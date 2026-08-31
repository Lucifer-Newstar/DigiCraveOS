# Request Correlation IDs

Every backend request now receives an `X-Request-Id` response header. A valid caller-provided ID is preserved; otherwise the backend generates a UUID. Error responses include the same ID as `requestId` so operators can correlate client reports with server logs and upstream gateway traces.

Accepted caller IDs are limited to 100 safe characters and are never interpreted as code.
