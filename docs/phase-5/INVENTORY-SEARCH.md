# Inventory Search

`GET /api/inventory` now accepts a bounded case-insensitive `search` query against ingredient names. Pagination metadata reflects the filtered result set while stock valuation remains global.

The Inventory page adds an ingredient search field and resets pagination when the search changes.

Verification included the inventory search integration test, frontend ESLint, and the Vite production build.
