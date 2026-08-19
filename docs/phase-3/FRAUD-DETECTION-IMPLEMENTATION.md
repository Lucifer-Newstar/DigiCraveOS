# Fraud detection — implementation

## Delivered

- Added admin-only `GET /api/reports/fraud-signals`.
- Flags high-value orders, duplicate payment records, and payment amount mismatches.
- Returns severity, rule evidence, related identifiers, and review action.
- Added fraud signal summary cards to Reports.
- Detection is advisory and read-only.

## Verification

- Dedicated fraud integration test: passed.
- Full backend suite: **52 passed, 0 failed** across 15 suites.
- ML suite: **7 passed, 0 failed**.
- Frontend full ESLint: passed.
- Frontend production build: passed.

Automated blocking, chargebacks, and gateway action workflows remain deferred.
