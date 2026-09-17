# Phase 6 API Catalog Update

| Endpoint | Access | Purpose |
|---|---|---|
| `GET /api/health/live` | Public | Process liveness |
| `GET /api/health/ready` | Public | Database readiness |
| `GET /api/health/metrics` | Admin | Process and database diagnostics |
| `GET /api/reports/audit-events/retention` | Admin | Non-destructive retention eligibility |
| `GET /api/reports/export/orders.csv` | Admin | ETagged order CSV export with content length |

All admin endpoints require the verified staff session and Admin role. Public probes intentionally expose no customer or operational detail beyond health state.
