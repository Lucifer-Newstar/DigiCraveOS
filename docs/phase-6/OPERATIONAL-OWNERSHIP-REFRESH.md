# Phase 6 Operational Ownership Refresh

| Area | Owner | First response |
|---|---|---|
| Health and API | POS platform owner | Check liveness, readiness, metrics, and request ID |
| Database and backups | Infrastructure owner | Check connection state, backup freshness, and restore rehearsal |
| Frontend telemetry | POS product owner | Inspect `pos:query-error` events and deployment build |
| Security and dependencies | Platform security owner | Review headers, CORS, audit output, and credentials |
| Release and rollback | Release owner | Apply release gates and preserve rollback evidence |

Escalate unresolved production impact to the release owner with timestamps, commit, endpoint, and request ID.
