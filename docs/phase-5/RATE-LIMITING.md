# Phase 5 Rate Limiting

A configurable in-memory rate-limit middleware now protects the Admin order CSV export route at 30 requests per minute per client and path. Responses expose `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `Retry-After` when applicable. Excess requests receive HTTP 429.

The middleware is intentionally scoped and process-local for the current deployment. A distributed limiter should replace the storage map when multiple API instances are deployed.
