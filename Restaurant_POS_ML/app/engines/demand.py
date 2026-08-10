"""Per-dish demand prediction for prep planning.

For each dish we build a daily quantity series and predict the expected
quantity for a target day. The estimator blends:
  * that dish's average quantity on the same weekday (seasonality), and
  * a recent-trend level (mean of the last 14 days),
weighted by how much history exists. Dishes with little history fall back
to their overall daily average. Pure NumPy + stdlib.
"""
from datetime import datetime, timedelta, timezone

import numpy as np

from ..db import get_db

MIN_ROWS = 6  # min active days before we trust weekday seasonality


def _to_dt(value):
    if isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(str(value))
    except Exception:
        return datetime.now(timezone.utc)


def _dish_daily():
    """dish -> {date(): quantity}."""
    data = {}
    for o in get_db()["orders"].find({}, {"items": 1, "orderDate": 1, "createdAt": 1}):
        d = _to_dt(o.get("orderDate") or o.get("createdAt")).date()
        for it in (o.get("items") or []):
            if isinstance(it, dict):
                name = it.get("name") or it.get("dishName")
                qty = float(it.get("quantity") or 1)
                if name:
                    day_map = data.setdefault(str(name), {})
                    day_map[d] = day_map.get(d, 0.0) + qty
    return data


def _filled_series(day_map):
    """Return (dates_sorted, quantities) filled per calendar day between min and max."""
    if not day_map:
        return [], np.array([])
    start, end = min(day_map), max(day_map)
    dates, qty = [], []
    d = start
    while d <= end:
        dates.append(d)
        qty.append(day_map.get(d, 0.0))
        d += timedelta(days=1)
    return dates, np.array(qty, dtype=float)


def predict(target_date: str = None, top: int = 12) -> dict:
    data = _dish_daily()
    if not data:
        return {"trained": False, "reason": "No order line-item history yet.", "predictions": []}

    all_days = [d for m in data.values() for d in m.keys()]
    max_day = max(all_days)
    if target_date:
        try:
            tdate = datetime.fromisoformat(target_date).date()
        except Exception:
            tdate = max_day + timedelta(days=1)
    else:
        tdate = max_day + timedelta(days=1)

    target_dow = tdate.weekday()
    preds = []

    for dish, day_map in data.items():
        dates, qty = _filled_series(day_map)
        total_hist = float(sum(day_map.values()))
        n = len(dates)

        if n >= MIN_ROWS:
            dow = np.array([d.weekday() for d in dates])
            same = qty[dow == target_dow]
            weekday_level = float(same.mean()) if same.size else float(qty.mean())
            recent = qty[-14:]
            recent_level = float(recent.mean()) if recent.size else float(qty.mean())
            # Blend: seasonality dominates, trend nudges it.
            pred = 0.65 * weekday_level + 0.35 * recent_level
            method = "weekday-seasonal-trend"
        else:
            pred = float(qty.mean()) if qty.size else 0.0
            method = "average-fallback"

        preds.append(
            {
                "dish": dish,
                "predicted_quantity": int(round(pred)),
                "predicted_quantity_exact": round(pred, 2),
                "total_ordered_history": int(total_hist),
                "method": method,
            }
        )

    preds.sort(key=lambda x: x["predicted_quantity_exact"], reverse=True)
    return {
        "trained": True,
        "target_date": tdate.strftime("%Y-%m-%d"),
        "weekday": tdate.strftime("%A"),
        "predictions": preds[:top],
    }
