# Reservation Conflict Protection

Reservation availability checks remain application-enforced for active statuses (`Pending`, `Confirmed`, and `Seated`) and are supported by the date/time/status indexes added to the reservation model. The existing Phase 2 regression test verifies that a duplicate active slot returns HTTP 409.

The index improves conflict lookup but does not claim a database-level uniqueness guarantee across changing status values; concurrent booking writes should remain monitored and receive a transactional design if multi-instance booking volume requires it.
