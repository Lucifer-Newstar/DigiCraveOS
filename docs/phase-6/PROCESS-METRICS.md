# Admin Process Metrics

Admin users can query `GET /api/health/metrics` for process uptime, Node version, PID, memory counters, and MongoDB connection state. The endpoint requires the staff session and Admin role; public probes remain limited to `/live` and `/ready`.

Metrics are point-in-time operational diagnostics, not a replacement for a long-term metrics backend. They intentionally omit credentials, request payloads, and customer records.

Verification covers the endpoint through the health integration suite.
