# Menu Query Filtering

`GET /api/menu` now accepts a bounded `search` query for case-insensitive dish-name filtering and `available=true` to return only available dishes. The grouped category response shape is preserved.

The staff Menu screen adds an available-dish search field and keeps category selection and cart behavior intact.

Verification included menu integration coverage for search and availability, frontend ESLint, and the Vite production build.
