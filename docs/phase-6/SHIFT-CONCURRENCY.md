# Shift Open-State Constraint

The Shift model now declares a unique partial index on `staff` for records whose status is `Open`. The application-level duplicate-open check remains for a clear HTTP 409 response; the database constraint protects the invariant during concurrent writes.

The workforce regression suite and database-index suite cover the behavior and declaration.
