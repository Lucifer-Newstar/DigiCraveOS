# Offline synchronization — implementation notes

Implemented the minimal browser-side offline foundation for order submissions.

## Frontend

- Added a localStorage-backed order queue.
- Orders submitted while offline are queued locally.
- Network failures without an HTTP response are also queued.
- Queued orders replay when the browser emits the `online` event.
- The replay uses the backend order endpoint directly.
- Orders carry an idempotency key so retries do not create duplicate records.

## Backend

- Added a sparse `idempotencyKey` field to orders.
- Repeated order requests with the same key return the existing order.

## Boundaries

Full offline menu sync, service workers, offline payments, multi-device conflict handling, and WebSockets remain outside this Phase 2 slice.

## Status

Implementation complete; runtime verification pending.
