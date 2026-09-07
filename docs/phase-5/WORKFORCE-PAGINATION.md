# Workforce Pagination

The workforce listing now accepts bounded `page` and `limit` parameters and returns pagination metadata while preserving the shift array in `data`. The Workforce page requests 25 shifts at a time and provides Previous/Next controls.

Summary and intelligence queries remain separate so payroll totals are not reduced to the visible page.

Verification included the workforce pagination integration test, frontend ESLint, and the Vite production build.
