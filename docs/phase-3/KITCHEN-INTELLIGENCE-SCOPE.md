# Phase 3 — Kitchen intelligence scope

## Goal

Give kitchen and owner users a live operational summary from the existing KDS tickets.

## First slice

- Admin/Kitchen-only read-only insights endpoint.
- Summarize active tickets, item status counts, and station workload.
- Keep it derived from current order data; no schema migration.
- Surface the summary in the Kitchen Display.

## Acceptance criteria

1. Only Kitchen and Admin roles can access the endpoint.
2. Voided and completed orders are excluded.
3. Station and status totals reconcile with active ticket items.
4. Empty kitchens return zero-valued summaries.
5. Existing automated suites remain green.
