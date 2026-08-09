"""MongoDB access layer.

Reads directly from the SAME collections the POS Node backend writes to,
so the ML models train on the existing schema and existing data with no
duplication. Nothing here mutates POS data. Uses only pymongo + stdlib.
"""
from datetime import datetime, timezone
from functools import lru_cache

from pymongo import MongoClient

from .config import MONGODB_URI


@lru_cache(maxsize=1)
def get_client() -> MongoClient:
    return MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)


def get_db():
    client = get_client()
    db = client.get_default_database()
    if db is None:
        db = client["pos-db"]
    return db


def ping() -> bool:
    try:
        get_client().admin.command("ping")
        return True
    except Exception:
        return False


def _to_datetime(value) -> datetime:
    if isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(str(value))
    except Exception:
        return datetime.now(timezone.utc)


def _day_key(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")


def load_orders() -> list:
    """All orders as a list of flat dicts (one per order)."""
    docs = list(get_db()["orders"].find({}))
    rows = []
    for o in docs:
        bills = o.get("bills") or {}
        cust = o.get("customerDetails") or {}
        date = _to_datetime(o.get("orderDate") or o.get("createdAt"))
        rows.append(
            {
                "order_id": str(o.get("_id")),
                "date": date,
                "revenue": float(bills.get("totalWithTax") or bills.get("total") or 0),
                "guests": int(cust.get("guests") or 0),
                "phone": str(cust.get("phone") or ""),
                "status": o.get("orderStatus") or "",
                "payment_method": o.get("paymentMethod") or "",
                "items": o.get("items") or [],
            }
        )
    return rows


def load_order_items() -> list:
    """List of baskets: {names: [...], date: datetime} per order."""
    baskets = []
    for o in get_db()["orders"].find(
        {}, {"items": 1, "orderDate": 1, "createdAt": 1}
    ):
        items = o.get("items") or []
        names = []
        for it in items:
            if isinstance(it, dict):
                name = it.get("name") or it.get("dishName")
                if name:
                    names.append(str(name))
            elif isinstance(it, str):
                names.append(it)
        if names:
            date = _to_datetime(o.get("orderDate") or o.get("createdAt"))
            baskets.append({"names": names, "date": date})
    return baskets


def count_orders() -> int:
    return get_db()["orders"].count_documents({})
