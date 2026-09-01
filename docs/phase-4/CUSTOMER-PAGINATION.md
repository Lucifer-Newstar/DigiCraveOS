# Customer Pagination

`GET /api/customer` now accepts bounded `page` and `limit` parameters while preserving the customer array in `data`. Pagination metadata is returned at the response root.

The Dashboard Customers table requests 25 customers per page and supports Previous/Next navigation. Customer intelligence summaries remain independent and continue to provide segment-wide information.

Verification included the customer pagination integration test, frontend ESLint, and the Vite production build.
