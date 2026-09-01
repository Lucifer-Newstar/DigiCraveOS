# Database Index Review

Phase 4 adds operational indexes for the primary listing and intelligence access paths:

- Orders: newest order listing and status-plus-date filtering.
- Customers: last-visit listing and loyalty aggregation fields.
- Purchases: received-date listing and ingredient history lookup.
- Audit events: action/resource/date index from the Phase 3 audit slice.

The index declarations are covered by a model-level test. MongoDB creates missing indexes through the normal Mongoose model initialization path.
