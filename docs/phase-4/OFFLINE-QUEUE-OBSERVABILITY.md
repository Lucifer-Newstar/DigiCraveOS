# Offline Queue Observability

The staff header now displays the number of locally queued offline orders. Queue mutations dispatch a `digicrave:queue-changed` event, and the header refreshes on queue changes and browser reconnection.

The indicator is informational only. Existing idempotency keys and online synchronization behavior are preserved.
