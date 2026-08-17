# Phase 3 — Customer intelligence scope

## Goal

Turn the customer history already created by Phase 2 order flows into explainable owner segments for retention and service planning.

## First slice

- Admin-only customer segmentation endpoint.
- Classify customers as `vip`, `loyal`, `new`, `at_risk`, or `regular` using order count, spend, and recency.
- Return segment counts and customer records without exposing passwords.
- Keep segmentation deterministic and read-only.

## Acceptance criteria

1. Only Admin users can access the endpoint.
2. Customer passwords are never returned.
3. Segment counts reconcile with returned customers.
4. Empty customer data returns valid empty arrays and counts.
5. Existing backend, ML, and frontend verification remains green.
