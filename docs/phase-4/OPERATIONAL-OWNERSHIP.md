# Operational Ownership Matrix

| Area | Primary owner | Verification path |
|---|---|---|
| Backend/API | POS platform owner | Backend Jest suite and health probes |
| Frontend | POS product owner | ESLint, production build, browser smoke checks |
| ML service | Data/ML owner | Python test suite and readiness review |
| Database | Infrastructure owner | Backup/restore runbook and readiness probe |
| Security | Platform security owner | Headers, CORS, auth, dependency audit |
| Release | Release owner | Phase 4 checklist and rollback checklist |

Operational incidents should include the `X-Request-Id` value from the affected response.
