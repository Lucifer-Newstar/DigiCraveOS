# Security Headers and CORS

The backend now sets baseline browser security headers on every response: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, a strict referrer policy, and a restrictive permissions policy.

CORS now accepts a comma-separated allowlist from `CORS_ORIGIN`, defaults to the local frontend origin, preserves credentialed requests, and rejects origins outside the allowlist. Requests without an Origin header remain usable for health probes and server-to-server clients.

Integration coverage verifies headers and an allowed frontend origin.
