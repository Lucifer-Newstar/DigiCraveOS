# Customer Cohort Analysis

Admin users can query `GET /api/customer/cohorts` for monthly cohorts based on customer creation time. Each cohort includes customer count, accumulated orders, revenue, average spend, and orders per customer.

The Dashboard Customers view shows the most recent cohorts alongside existing deterministic segments and advisory retention information. No customer data is sent externally and no campaign is delivered automatically.

Verification:

- Customer cohort integration test passed.
- Frontend ESLint passed.
- Vite production build passed.
