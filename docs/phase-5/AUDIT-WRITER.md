# Audit Event Writer

Admin campaign-draft edits now write an `UPDATE` audit event with the actor, resource ID, and edited field names. The shared `writeAuditEvent` utility ignores requests without a staff actor and centralizes event creation for future mutating admin workflows.

The campaign edit integration test verifies that the audit event is persisted after a successful update.
