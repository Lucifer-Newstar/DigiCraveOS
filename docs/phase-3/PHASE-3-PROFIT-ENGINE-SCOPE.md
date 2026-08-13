# Phase 3 — Profit Engine scope

## Goal

Turn Phase 2 sales, recipe, purchasing, and FIFO inventory data into owner-facing margin intelligence without changing the order or inventory workflows.

## First slice

- Calculate item-level revenue from non-voided orders for a requested date range.
- Calculate recipe food cost from the current ingredient batch costs.
- Report gross profit and gross margin by dish and for the selected period.
- Flag dishes as `high_margin`, `low_margin`, or `no_recipe`.
- Recommend a review when an item has a low margin or has no recipe cost configured.
- Expose the result through the admin finance API and a covered backend test.

## Explicitly deferred

- Automatic price changes.
- Combo/bundle optimization.
- Discounts and channel commissions modeled as separate cost layers.
- LLM-generated explanations.
- WhatsApp delivery and approval workflows.

## Acceptance criteria

1. Admin-only API returns a validated date range, summary, and item breakdown.
2. Voided orders are excluded from revenue and units sold.
3. Recipe cost uses ingredient batch costs and is deterministic when no batches exist.
4. Missing recipes are reported rather than silently treated as zero cost.
5. Existing Phase 2 suites remain green.
