# Audit Retention Query

Admin users can query `GET /api/reports/audit-events/retention?retainDays=90` to identify audit events older than the configured one-to-3650-day retention window. The response reports the cutoff, eligible count, oldest event, and whether retention action is required.

The endpoint is deliberately non-destructive. Deletion or archival must remain an explicit operational job governed by the backup and retention policy.
