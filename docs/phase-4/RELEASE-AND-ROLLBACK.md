# Phase 4 Release and Rollback Checklist

## Release

- Run `ulimit -n 8192 && ./scripts/verify-all.sh`.
- Run `./scripts/validate-openapi-seed.sh` and `./scripts/test-smoke-health.sh`.
- Run production dependency audits without force-fixing packages.
- Confirm `/api/health/ready` is 200 after deployment.
- Record the release commit and request-correlation behavior.

## Rollback

- Stop traffic to the failing deployment.
- Restore the previous known-good application commit and environment configuration.
- If data changes are involved, follow the backup/restore runbook and do not delete newer backups.
- Confirm liveness, readiness, authentication, and read-only reporting before reopening traffic.
- Record the incident, release commit, and rollback reason.
