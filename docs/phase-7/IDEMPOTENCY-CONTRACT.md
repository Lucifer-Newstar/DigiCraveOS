# Order Idempotency Contract

Order creation accepts an `Idempotency-Key` header or the existing `idempotencyKey` body field. When a matching order already exists, the API returns HTTP 200 with the stored order instead of creating a duplicate. The order model's sparse unique index protects the key when present.

Offline batch synchronization continues to use the body field and returns `already_synced` for replayed payloads. Existing replay regression coverage remains part of the backend suite.
