# Menu intelligence — implementation

## Delivered

- Added admin-only `GET /api/reports/pricing-recommendations`.
- Supports date filters and a configurable `targetMargin` between 1 and 99 percent.
- Uses current recipe and FIFO ingredient costs to calculate a suggested price.
- Returns current average selling price, units sold, current margin, target margin, and status.
- Reports `needs_recipe` explicitly and never changes menu prices automatically.
- Added the frontend API client for the pricing recommendation endpoint.

## Verification

- Profit Engine integration test now covers pricing recommendations.
- Full backend suite: **47 passed, 0 failed** across 10 suites.
- Frontend production build: passed.
- Reports page targeted ESLint: passed.
