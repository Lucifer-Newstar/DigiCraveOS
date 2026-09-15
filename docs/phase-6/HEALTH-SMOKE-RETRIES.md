# Health Smoke Retry Behavior

`scripts/smoke-health.sh` retries transient connection and health-check failures before declaring deployment health unsuccessful.

Configuration:

- `HEALTH_RETRIES`: retry count, default `3`.
- `HEALTH_RETRY_DELAY`: seconds between attempts, default `1`.

The smoke test intentionally returns one temporary HTTP 503 for each probe and verifies that both liveness and readiness recover. Invalid retry configuration exits with status 2.
