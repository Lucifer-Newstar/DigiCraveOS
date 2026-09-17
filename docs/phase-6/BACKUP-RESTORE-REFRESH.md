# Phase 6 Backup Runbook Refresh

Before a release, confirm a recent encrypted `mongodump` archive exists, record its checksum and expiry, and verify that credentials are supplied only through the environment. A restore rehearsal must use an isolated URI, run readiness, the full backend suite, and the retrying health smoke check. Keep the source backup immutable until the rehearsal and release are accepted.
