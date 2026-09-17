# Phase 6 Release and Rollback Refresh

Release gates now include the full verification snapshot, production dependency audit, OpenAPI validation, and retrying health smoke. Record the release commit and environment checksum.

For rollback, stop traffic, restore the last known-good application and configuration, preserve newer backups, and verify liveness, readiness, authentication, CORS, and read-only reports before reopening traffic. Record the incident and rollback reason with its request IDs.
