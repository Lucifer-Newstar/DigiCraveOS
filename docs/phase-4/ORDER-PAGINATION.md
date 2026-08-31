# Order Pagination

`GET /api/order` now accepts bounded `page` and `limit` query parameters, defaulting to 25 and capped at 100. The existing `data` array response is preserved and a top-level `pagination` object reports page, limit, total, and pages.

The Orders page requests 25 records at a time and provides Previous/Next controls. Existing dashboard and home consumers continue to receive an array in `data` when using the default request.

Verification included the order pagination integration test, frontend ESLint, and the Vite production build.
