"""Dish recommendations via market-basket / item co-occurrence.

Builds a co-occurrence matrix from order line items and computes an
association score (lift) between dishes. Given the dishes currently in a
cart, we recommend dishes most likely to be bought together.

Lift(A, B) = P(A & B) / (P(A) * P(B))  -- >1 means positively associated.
"""
from collections import Counter, defaultdict
from itertools import combinations

from .db import load_order_items


def _build_stats():
    baskets = load_order_items()
    n = len(baskets)
    item_counts = Counter()
    pair_counts = defaultdict(int)

    for b in baskets:
        unique = sorted(set(b["names"]))
        for name in unique:
            item_counts[name] += 1
        for a, c in combinations(unique, 2):
            pair_counts[(a, c)] += 1

    return n, item_counts, pair_counts


def top_dishes(limit: int = 10):
    _, item_counts, _ = _build_stats()
    return [
        {"name": name, "orders": cnt}
        for name, cnt in item_counts.most_common(limit)
    ]


def recommend(cart_items, limit: int = 5):
    """Recommend dishes to pair with the given cart_items (list of names)."""
    n, item_counts, pair_counts = _build_stats()
    if n == 0:
        return {"trained": False, "reason": "No order history yet.", "recommendations": []}

    cart = set(cart_items or [])
    scores = defaultdict(float)
    reasons = defaultdict(list)

    def pair_count(a, b):
        key = (a, b) if a <= b else (b, a)
        return pair_counts.get(key, 0)

    for candidate, cand_count in item_counts.items():
        if candidate in cart:
            continue
        p_cand = cand_count / n
        agg_lift = 0.0
        support = 0
        for c in cart:
            if c not in item_counts:
                continue
            co = pair_count(c, candidate)
            if co == 0:
                continue
            p_c = item_counts[c] / n
            p_both = co / n
            lift = p_both / (p_c * p_cand) if p_c * p_cand > 0 else 0
            confidence = co / item_counts[c]  # P(candidate | c)
            agg_lift += lift * confidence
            support += co
            reasons[candidate].append(
                {"with": c, "lift": round(lift, 2), "confidence": round(confidence, 2)}
            )
        if support > 0:
            scores[candidate] = agg_lift * (1 + 0.05 * cand_count)  # slight popularity tie-break

    # If the cart is empty or nothing co-occurred, fall back to popularity.
    if not scores:
        recs = [
            {"name": name, "score": round(cnt / n, 3), "basis": "popularity", "reasons": []}
            for name, cnt in item_counts.most_common(limit)
            if name not in cart
        ]
        return {"trained": True, "basis": "popularity", "recommendations": recs[:limit]}

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:limit]
    recs = [
        {
            "name": name,
            "score": round(score, 3),
            "basis": "association",
            "reasons": reasons[name][:3],
        }
        for name, score in ranked
    ]
    return {"trained": True, "basis": "association", "orders_analyzed": n, "recommendations": recs}
