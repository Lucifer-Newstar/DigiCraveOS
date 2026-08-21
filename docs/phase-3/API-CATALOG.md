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
| Kitchen | `GET /api/order/kitchen/intelligence` | Station and status workload |
| Inventory | `GET /api/inventory/intelligence` | Low-stock purchase suggestions |
| Workforce | `GET /api/workforce/intelligence` | Open-shift liability and role coverage |

All intelligence endpoints are read-only in the current Phase 3 slices. External messaging, automatic pricing, settlement mutation, and automated enforcement remain approval-gated roadmap work.
