# Phase 3 — Fraud detection scope

## Goal

Flag payment anomalies for admin review using explainable rules on the existing order and payment records.

## First slice

- Admin-only fraud-signals endpoint.
- Flag payment amount mismatches, duplicate payment records, orphan payments, and unusually high order values.
- Return severity, evidence, and review action.
- Keep detection advisory and read-only.

## Acceptance criteria

1. Only Admin users can access fraud signals.
2. No payment or order is automatically changed.
3. Each signal identifies its rule and related identifiers.
4. Existing backend, ML, and frontend verification remains green.
