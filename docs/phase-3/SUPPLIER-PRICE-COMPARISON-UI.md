# Supplier Price Comparison UI

## Scope

The admin Inventory page now includes a supplier price comparison panel backed by `GET /api/inventory/supplier-intelligence`.

## Behavior

- Loads supplier intelligence independently from the inventory table using React Query.
- Shows supplier and purchase counts so the comparison has visible data context.
- Lists every ingredient, including ingredients with no purchase history.
- Displays the lowest observed unit cost and the latest observed quote.
- Shows up to the three most recent supplier quotes with supplier name, cost, and received date.
- Uses an explicit empty state when no quotes have been recorded.
- Keeps the existing inventory and low-stock workflows unchanged.

## Verification

- Frontend ESLint passed.
- Vite production build passed.
- Supplier integration suite passed with 3 tests.

Known non-blocking build warning: the existing production JavaScript bundle is larger than Vite's 500 kB advisory threshold.
