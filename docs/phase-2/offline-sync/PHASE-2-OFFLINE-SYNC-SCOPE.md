# Phase 2 — offline synchronization scope

This is the minimal offline foundation for DigiCraveOS Phase 2.

## Included

- Browser-local mutation queue for supported order actions
- Offline detection in the frontend
- Queueing of new customer/staff order submissions when the API is unavailable
- Replay on reconnection
- Idempotency keys to avoid duplicate order creation
- Visible pending/failed sync state
- Tests for queue serialization and replay behavior

## Not included

- Full offline menu synchronization
- Multi-device conflict resolution
- Background service workers
- Offline payments
- Cross-outlet synchronization
- WebSocket infrastructure

## Status

Planned — implementation follows the reservations slice.
