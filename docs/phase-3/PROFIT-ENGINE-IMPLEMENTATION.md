# Profit Engine — implementation

## Delivered

- Added admin-only `GET /api/reports/profit`.
- Supports `from` and `to` date filters with a 30-day default range.
- Includes only paid and completed orders, so voided and unpaid orders do not inflate profit.
- Aggregates dish units and revenue from order line items.
- Calculates recipe food cost from current positive FIFO batch quantities, with the latest purchase movement as fallback.
- Returns gross profit, margin percentage, measured and uncosted item counts, item-level status, and owner recommendations.
- Reports missing recipes explicitly as `no_recipe` instead of silently reporting zero food cost.
- Added the Profit Engine API client and margin-analysis table/cards to the existing admin Reports screen.

## Verification

- Dedicated Profit Engine integration test: passed.
- Full backend suite: **47 passed, 0 failed** across 10 suites.
- ML suite: 7 passed, 0 failed.
- Frontend production build: passed.
- Reports page targeted ESLint: passed.

## Deferred from this slice

Automatic price changes, combo optimization, channel commissions, LLM explanations, and WhatsApp approval workflows remain separate roadmap slices.
