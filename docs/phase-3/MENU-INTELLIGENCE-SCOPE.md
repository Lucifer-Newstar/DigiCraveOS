# Phase 3 — Menu intelligence and pricing recommendations

## Goal

Use the Profit Engine's recipe costs and sales mix to help an owner review menu pricing without automatically changing live prices.

## First slice

- Add an admin-only pricing recommendation endpoint.
- Estimate the price required for a configurable target gross margin.
- Identify dishes with insufficient margin, healthy margin, and missing recipes.
- Include sales volume and current average selling price so recommendations are actionable.
- Keep recommendations advisory; no automatic menu mutation.

## Acceptance criteria

1. Voided and unpaid orders are excluded.
2. Dishes without recipes are reported as `needs_recipe`.
3. Suggested prices are based on current recipe cost and target margin.
4. Existing Phase 3 and Phase 2 tests remain green.
