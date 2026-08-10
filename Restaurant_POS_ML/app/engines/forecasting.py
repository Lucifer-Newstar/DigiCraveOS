"""Sales forecasting.

Aggregates orders into a daily revenue / order-count series and fits a
Ridge regression (solved via the closed-form normal equations in NumPy)
on calendar features: linear trend + day-of-week seasonality + weekend
flag. Lightweight, explainable, and trains in microseconds.
"""
from datetime import datetime, timedelta

import numpy as np

from ..db import load_orders

MIN_DAYS = 5  # need at least this many distinct days to model a trend


def _daily_series(rows):
    """Return (sorted_dates[list[date]], revenue[np], orders[np]) filled per calendar day."""
    if not rows:
        return [], np.array([]), np.array([])
    by_day = {}
    for r in rows:
        d = r["date"].date()
        agg = by_day.setdefault(d, [0.0, 0])
        agg[0] += r["revenue"]
        agg[1] += 1
    start = min(by_day)
    end = max(by_day)
    dates, rev, cnt = [], [], []
    d = start
    while d <= end:
        dates.append(d)
        v = by_day.get(d, [0.0, 0])
        rev.append(v[0])
        cnt.append(v[1])
        d += timedelta(days=1)
    return dates, np.array(rev, dtype=float), np.array(cnt, dtype=float)


def _features(dates, origin):
    n = len(dates)
    t = np.array([(d - origin).days for d in dates], dtype=float)
    dow = np.array([d.weekday() for d in dates])  # Mon=0..Sun=6
    dow_oh = np.zeros((n, 7))
    dow_oh[np.arange(n), dow] = 1.0
    is_weekend = np.array([1.0 if d.weekday() >= 5 else 0.0 for d in dates]).reshape(-1, 1)
    bias = np.ones((n, 1))
    return np.column_stack([bias, t, dow_oh, is_weekend])


def _standardize(X):
    # Keep the bias column (index 0) untouched.
    mean = X.mean(axis=0)
    std = X.std(axis=0)
    std[std == 0] = 1.0
    mean[0], std[0] = 0.0, 1.0
    return (X - mean) / std, mean, std


def _ridge_fit(X, y, alpha=1.0):
    """Closed-form Ridge: w = (XᵀX + αI)⁻¹ Xᵀy (no penalty on bias)."""
    d = X.shape[1]
    reg = alpha * np.eye(d)
    reg[0, 0] = 0.0
    w = np.linalg.solve(X.T @ X + reg, X.T @ y)
    return w


def _r2(y, yhat):
    ss_res = float(np.sum((y - yhat) ** 2))
    ss_tot = float(np.sum((y - y.mean()) ** 2))
    return 1.0 - ss_res / ss_tot if ss_tot > 0 else 0.0


def forecast(horizon_days: int = 7) -> dict:
    rows = load_orders()
    if not rows:
        return {
            "trained": False,
            "reason": "No orders in database yet.",
            "history": [],
            "forecast": [],
        }

    dates, rev, cnt = _daily_series(rows)
    origin = dates[0]
    n_days = len(dates)

    history = [
        {"date": d.strftime("%Y-%m-%d"), "revenue": round(float(r), 2), "orders": int(c)}
        for d, r, c in zip(dates, rev, cnt)
    ]

    last = dates[-1]
    future = [last + timedelta(days=i) for i in range(1, horizon_days + 1)]

    if n_days < MIN_DAYS:
        avg_rev, avg_ord = float(rev.mean()), float(cnt.mean())
        fc = [
            {
                "date": d.strftime("%Y-%m-%d"),
                "predicted_revenue": round(avg_rev, 2),
                "predicted_orders": int(round(avg_ord)),
            }
            for d in future
        ]
        return {
            "trained": True,
            "method": "average-fallback",
            "days_of_history": n_days,
            "history": history,
            "forecast": fc,
        }

    X = _features(dates, origin)
    Xs, mean, std = _standardize(X)
    w_rev = _ridge_fit(Xs, rev)
    w_ord = _ridge_fit(Xs, cnt)

    Xf = (_features(future, origin) - mean) / std
    rev_pred = np.clip(Xf @ w_rev, 0, None)
    ord_pred = np.clip(Xf @ w_ord, 0, None)

    fc = [
        {
            "date": d.strftime("%Y-%m-%d"),
            "predicted_revenue": round(float(rv), 2),
            "predicted_orders": int(round(float(od))),
        }
        for d, rv, od in zip(future, rev_pred, ord_pred)
    ]

    r2 = round(_r2(rev, Xs @ w_rev), 3)
    return {
        "trained": True,
        "method": "ridge-regression",
        "days_of_history": n_days,
        "fit_r2": r2,
        "history": history,
        "forecast": fc,
    }
