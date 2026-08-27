# Phase 3 intelligence API catalog

All endpoints below require an authenticated Admin unless noted otherwise.

| Domain | Endpoint | Purpose |
|---|---|---|
| Profit | `GET /api/reports/profit` | Recipe cost, gross profit, and margin analysis |
| Menu | `GET /api/reports/pricing-recommendations` | Advisory target-margin pricing |
| Owner | `GET /api/reports/owner-briefing` | Deterministic operations briefing |
| Payments | `GET /api/reports/payment-reconciliation` | Settlement mismatch findings |
| Fraud | `GET /api/reports/fraud-signals` | Explainable payment anomalies |
| Customers | `GET /api/customer/intelligence` | Customer segmentation |
| Retention | `GET /api/customer/retention` | Prioritized follow-up actions |
| Marketing | `GET /api/customer/campaign-drafts` | Reviewable campaign copy and audiences |
| Marketing | `GET /api/customer/cohorts` | Monthly customer cohort summaries |
| Marketing | `GET /api/customer/loyalty-opportunities` | Staff-reviewable milestone opportunities |
| Kitchen | `GET /api/order/kitchen/intelligence` | Station and status workload |
| Kitchen | `GET /api/order/kitchen/delay-risk` | Age-based ticket delay signals |
| Inventory | `GET /api/inventory/intelligence` | Low-stock purchase suggestions |
| Inventory | `GET /api/inventory/supplier-intelligence` | Supplier quote comparisons |
| Inventory | `GET /api/inventory/recipe-variance` | Recipe cost movement against baseline |
| Inventory | `GET /api/inventory/waste-anomalies` | Consumption anomaly signals |
| Reports | `GET /api/reports/export/orders.csv` | Date-filtered order CSV export |
| Reports | `GET /api/reports/audit-events` | Admin audit event search |
| Reports | `GET /api/reports/owner-briefing/acknowledgements` | Briefing acknowledgement state |
| Workforce | `GET /api/workforce/intelligence` | Open-shift liability and role coverage |

All intelligence endpoints are read-only in the current Phase 3 slices. External messaging, automatic pricing, settlement mutation, and automated enforcement remain approval-gated roadmap work.
