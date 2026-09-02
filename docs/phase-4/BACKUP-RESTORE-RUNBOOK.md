# MongoDB Backup and Restore Runbook

## Backup

1. Confirm `MONGODB_URI` points to the intended database.
2. Run `mongodump --uri "$MONGODB_URI" --archive="backup-$(date +%Y%m%d-%H%M%S).archive" --gzip`.
3. Store the archive in encrypted, access-controlled backup storage.
4. Record the backup timestamp and retention expiry.

## Restore rehearsal

1. Provision an isolated MongoDB database.
2. Run `mongorestore --uri "$RESTORE_URI" --archive=backup.archive --gzip --drop`.
3. Start the backend against the restored URI.
4. Run `/api/health/ready`, backend integration tests, and the deployment smoke script.
5. Never restore over production without an approved maintenance window and rollback plan.

Credentials and database URIs must not be committed to the repository.
