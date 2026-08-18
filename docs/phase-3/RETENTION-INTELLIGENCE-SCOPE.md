# Phase 3 — Retention intelligence scope

## Goal

Turn customer segments into concrete, explainable retention actions without sending messages automatically.

## First slice

- Admin-only retention recommendations endpoint.
- Prioritize at-risk customers for win-back and VIP customers for appreciation.
- Include recency, order count, spend, and a suggested action/channel.
- Surface the recommendations in the Customers screen.

## Acceptance criteria

1. Only Admin users can access recommendations.
2. Recommendations exclude customer passwords.
3. At-risk customers are prioritized by days since last visit.
4. No external messages are sent automatically.
5. Existing backend, ML, and frontend checks remain green.
