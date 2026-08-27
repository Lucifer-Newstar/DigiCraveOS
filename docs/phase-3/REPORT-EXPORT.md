# Report Export

Admin users can download a date-filtered order CSV from `GET /api/reports/export/orders.csv?from=YYYY-MM-DD&to=YYYY-MM-DD`. The export includes order date, status, customer, phone, subtotal, tax, and total with tax. Invalid date ranges return a 400 response.

The Finance Reports page adds an Export orders CSV control using the currently selected date range. Export is read-only and does not alter order or payment records.

Verification:

- Report export integration test passed.
- Frontend ESLint and Vite production build passed.
