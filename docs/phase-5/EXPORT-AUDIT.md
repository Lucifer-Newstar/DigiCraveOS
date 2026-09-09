# Report Export Audit Trail

Successful order CSV exports now write an `EXPORT` audit event with the date range and row count. Conditional 304 retries do not create duplicate audit events because no new export body is produced.

The report export integration test verifies both the ETag retry and exactly one audit record.
