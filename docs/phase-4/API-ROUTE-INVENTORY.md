# API Route Inventory

| Route group | Access | Main scale/reliability notes |
|---|---|---|
| `/api/health` | Public | Liveness and MongoDB readiness probes |
| `/api/order` | Staff/session | Paginated order listing and KDS controls |
| `/api/customer` | Admin/session | Paginated customer listing and intelligence slices |
| `/api/inventory` | Admin/session | Paginated ingredients and operational intelligence |
| `/api/reports` | Admin/session | Reports, exports, audit search, acknowledgements |
| `/api/user` | Public/session | Staff authentication and profile |
| `/api/customer/auth` | Customer/session | Guest portal authentication and orders |
| `/api/ml` | Staff/session | ML service integration |

All JSON object responses include request correlation metadata. Health probes are the only intentionally unauthenticated operational endpoints.
