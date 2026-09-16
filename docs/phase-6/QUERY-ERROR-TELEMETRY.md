# Frontend Query Error Telemetry

The React Query client reports failed queries through the `pos:query-error` browser event. Payloads contain a bounded query-key string, HTTP status when available, a bounded error message, and an ISO timestamp. Development builds also log the structured payload; production behavior remains non-blocking and does not expose request data.

The smoke script verifies the global QueryCache hook and telemetry event wiring. Frontend lint and production build verification passed.
