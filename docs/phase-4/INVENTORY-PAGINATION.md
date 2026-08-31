# Inventory Pagination

`GET /api/inventory` now accepts bounded `page` and `limit` query parameters. The limit defaults to 25 and is capped at 100. The response retains existing inventory fields and adds `data.pagination` with page, limit, total, and pages.

The admin Inventory page requests 25 ingredients at a time and provides Previous/Next controls. Stock valuation remains calculated across the full inventory rather than only the visible page.

Verification included a pagination integration test, frontend ESLint, and the Vite production build.
