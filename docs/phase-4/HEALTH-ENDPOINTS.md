# Phase 4 Health Endpoints

The backend exposes two unauthenticated operational endpoints:

- `GET /api/health/live` confirms that the process is running and returns uptime.
- `GET /api/health/ready` confirms MongoDB readiness. It returns HTTP 200 when the connection is ready and HTTP 503 otherwise.

These endpoints are intended for load balancers, container probes, and deployment smoke checks. They do not expose credentials or application records.
