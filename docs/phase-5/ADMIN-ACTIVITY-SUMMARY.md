# Admin Activity Summary

Admin Reports now exposes `GET /api/reports/admin-activity?days=7`, aggregating audit events by action and resource for a bounded one-to-thirty-day window. The Reports page shows the recent total and top action counts alongside the detailed audit feed.

Verification included the admin activity integration test, frontend ESLint, and the Vite production build.
