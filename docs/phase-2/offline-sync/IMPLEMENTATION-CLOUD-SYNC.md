# Offline cloud replay — implementation notes

- Added authenticated `POST /api/order/sync`.
- The endpoint accepts a batch of queued orders.
- Existing idempotency keys return `already_synced` instead of duplicating orders.
- New queued orders return `synced` with their server order ID.
- The frontend reconnect handler replays queued orders through the sync endpoint.
- Added backend coverage for duplicate-safe replay.

## Status

Implementation complete; runtime and browser verification pending.
