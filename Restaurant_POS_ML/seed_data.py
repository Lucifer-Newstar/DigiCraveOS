"""Seed the POS MongoDB with realistic synthetic orders for ML demos.

Generates ~90 days of orders that match the exact `orders` schema written
by the Node backend (customerDetails, orderStatus, orderDate, bills, items,
paymentMethod). It embeds believable patterns so the models have something
to learn:
  * weekly seasonality (busier Fri/Sat/Sun)
  * a gentle upward revenue trend over time
  * dish co-occurrence (e.g. mains often paired with naan / gulab jamun)

Usage:
    python seed_data.py               # add ~90 days of orders
    python seed_data.py --days 120    # custom span
    python seed_data.py --clear       # delete seeded orders first
    python seed_data.py --wipe-all    # delete ALL orders first (careful!)
"""
import argparse
import random
from datetime import datetime, timedelta

from pymongo import MongoClient

from app.config import MONGODB_URI

random.seed(7)

SEED_TAG = "ml-seed"  # marks documents this script created

MENU = [
    ("Butter Chicken", 320),
    ("Palak Paneer", 260),
    ("Hyderabadi Biryani", 300),
    ("Masala Dosa", 150),
    ("Chole Bhature", 180),
    ("Rajma Chawal", 170),
    ("Paneer Tikka", 280),
    ("Gulab Jamun", 90),
    ("Poori Sabji", 140),
    ("Rogan Josh", 340),
    ("Butter Naan", 60),
    ("Masala Chai", 40),
]
PRICE = dict(MENU)

# Dishes that tend to be ordered alongside a chosen main.
AFFINITY = {
    "Butter Chicken": ["Butter Naan", "Gulab Jamun"],
    "Rogan Josh": ["Butter Naan", "Masala Chai"],
    "Palak Paneer": ["Butter Naan"],
    "Paneer Tikka": ["Masala Chai", "Butter Naan"],
    "Hyderabadi Biryani": ["Gulab Jamun"],
    "Chole Bhature": ["Masala Chai"],
    "Masala Dosa": ["Masala Chai"],
}

FIRST = ["Aarav", "Diya", "Vivaan", "Ananya", "Arjun", "Isha", "Kabir",
         "Meera", "Rohan", "Sara", "Dev", "Nisha", "Aditya", "Priya"]
LAST = ["Sharma", "Patel", "Reddy", "Iyer", "Nair", "Gupta", "Singh",
        "Kumar", "Das", "Menon"]

STATUSES = ["Completed", "Completed", "Completed", "In Progress", "Ready"]
PAYMENTS = ["Cash", "Online", "Online", "Cash"]


def make_customer():
    name = f"{random.choice(FIRST)} {random.choice(LAST)}"
    phone = "9" + "".join(random.choice("0123456789") for _ in range(9))
    return name, phone


def make_items():
    mains = [m for m, _ in MENU if m not in ("Butter Naan", "Masala Chai", "Gulab Jamun")]
    chosen = set()
    base = random.choice(mains)
    chosen.add(base)
    # sometimes a second main
    if random.random() < 0.45:
        chosen.add(random.choice(mains))
    # affinity add-ons
    for m in list(chosen):
        for add in AFFINITY.get(m, []):
            if random.random() < 0.55:
                chosen.add(add)
    # random extra
    if random.random() < 0.3:
        chosen.add(random.choice([m for m, _ in MENU]))

    items = []
    for name in chosen:
        qty = random.choices([1, 2, 3], weights=[6, 3, 1])[0]
        ppq = PRICE[name]
        items.append(
            {
                "id": random.randint(1, 12),
                "name": name,
                "quantity": qty,
                "pricePerQuantity": ppq,
                "price": ppq * qty,
            }
        )
    return items


def day_multiplier(d: datetime, day0: datetime, span_days: int) -> float:
    # Weekend boost + gentle upward trend across the span.
    dow = d.weekday()  # Mon=0
    weekend = 1.5 if dow >= 4 else 1.0  # Fri/Sat/Sun busier
    progress = (d - day0).days / max(span_days, 1)
    trend = 1.0 + 0.4 * progress
    return weekend * trend


def build_orders(days: int):
    now = datetime.utcnow()
    day0 = now - timedelta(days=days)
    orders = []
    for i in range(days):
        d = day0 + timedelta(days=i)
        base_orders = random.randint(6, 12)
        n = max(1, int(round(base_orders * day_multiplier(d, day0, days))))
        for _ in range(n):
            hour = random.choices(
                [11, 12, 13, 14, 19, 20, 21, 22],
                weights=[2, 5, 6, 3, 4, 6, 5, 3],
            )[0]
            ts = d.replace(hour=hour, minute=random.randint(0, 59), second=0, microsecond=0)
            name, phone = make_customer()
            items = make_items()
            total = sum(it["price"] for it in items)
            tax = round(total * 0.05, 2)
            cgst = round(tax / 2, 2)
            sgst = round(tax / 2, 2)
            orders.append(
                {
                    "customerDetails": {
                        "name": name,
                        "phone": phone,
                        "guests": random.randint(1, 6),
                    },
                    "orderStatus": random.choice(STATUSES),
                    "orderDate": ts,
                    "createdAt": ts,
                    "updatedAt": ts,
                    "bills": {
                        "total": total,
                        "tax": tax,
                        "totalWithTax": round(total + tax, 2),
                        "discount": 0,
                        "cgst": cgst,
                        "sgst": sgst,
                    },
                    "items": items,
                    "paymentMethod": random.choice(PAYMENTS),
                    "_source": SEED_TAG,
                }
            )
    return orders


def upsert_customers(db):
    """Rebuild the customers collection totals from seeded orders,
    matching how the Node backend upserts customers per order."""
    pipeline = [
        {
            "$group": {
                "_id": "$customerDetails.phone",
                "name": {"$last": "$customerDetails.name"},
                "totalOrders": {"$sum": 1},
                "totalSpent": {"$sum": "$bills.totalWithTax"},
                "lastVisit": {"$max": "$orderDate"},
            }
        }
    ]
    for row in db["orders"].aggregate(pipeline):
        phone = row["_id"]
        if not phone:
            continue
        db["customers"].update_one(
            {"phone": phone},
            {
                "$set": {
                    "name": row["name"],
                    "totalOrders": row["totalOrders"],
                    "totalSpent": round(row["totalSpent"], 2),
                    "lastVisit": row["lastVisit"],
                },
                "$setOnInsert": {"createdAt": datetime.utcnow()},
            },
            upsert=True,
        )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=90)
    ap.add_argument("--clear", action="store_true", help="delete previously seeded orders")
    ap.add_argument("--wipe-all", action="store_true", help="delete ALL orders (danger)")
    args = ap.parse_args()

    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    db = client.get_default_database()
    if db is None:
        db = client["pos-db"]

    if args.wipe_all:
        deleted = db["orders"].delete_many({}).deleted_count
        db["customers"].delete_many({})
        print(f"Wiped ALL orders ({deleted}) and customers.")
    elif args.clear:
        deleted = db["orders"].delete_many({"_source": SEED_TAG}).deleted_count
        print(f"Cleared {deleted} previously seeded orders.")

    orders = build_orders(args.days)
    if orders:
        db["orders"].insert_many(orders)
    upsert_customers(db)

    print(f"Inserted {len(orders)} synthetic orders spanning {args.days} days.")
    print(f"Total orders now in DB: {db['orders'].count_documents({})}")
    print(f"Total customers now in DB: {db['customers'].count_documents({})}")


if __name__ == "__main__":
    main()
