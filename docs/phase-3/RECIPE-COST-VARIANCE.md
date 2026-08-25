# Recipe Cost Variance

The admin Inventory page now exposes recipe-level cost movement through `GET /api/inventory/recipe-variance`.

For each configured recipe, the API compares the current weighted cost of active ingredient batches with the first recorded purchase cost baseline. It returns line-level costs, absolute variance, percentage variance, and an `increased`, `decreased`, or `stable` status. Recipes without purchase movements use their current cost as the baseline.

The UI presents the recipe count, increased-cost count, baseline cost, current cost, variance, and status. This is advisory reporting only; it does not change menu prices or purchasing behavior.

Verification:

- Recipe variance integration test passed.
- Frontend ESLint passed.
- Vite production build passed.
