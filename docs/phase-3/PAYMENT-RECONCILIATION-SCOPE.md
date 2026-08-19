# Phase 3 — Payment reconciliation scope

## Goal

Give admins a read-only view of payment/order mismatches so UPI and Razorpay exceptions can be reviewed before manual correction.

## First slice

- Admin-only reconciliation endpoint.
- Compare paid/completed orders with recorded Payment documents.
- Detect missing payment records, amount mismatches, and payments without a matching order.
- Return a severity and review action; do not mutate financial records.

## Acceptance criteria

1. Only Admin users can access reconciliation.
2. Reconciliation is read-only.
3. Amount comparisons use paise-safe rounded rupee values.
4. Empty data returns a clean reconciled result.
5. Existing backend, ML, and frontend checks remain green.
