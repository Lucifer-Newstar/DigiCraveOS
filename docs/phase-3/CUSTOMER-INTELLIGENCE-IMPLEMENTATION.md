# Customer intelligence — implementation

## Delivered

- Added admin-only `GET /api/customer/intelligence`.
- Segments customers into `vip`, `loyal`, `new`, `at_risk`, and `regular` using deterministic order, spend, and recency rules.
- Returns segment counts and customer records with password fields excluded.
- Added frontend API client support.

## Verification

- Dedicated customer intelligence integration test: passed.
- Full backend suite: **49 passed, 0 failed** across 12 suites.
- ML suite: **7 passed, 0 failed**.
- Frontend full ESLint: passed.
- Frontend production build: passed.

The first slice is read-only. Retention campaigns, loyalty actions, and messaging integrations remain deferred.
