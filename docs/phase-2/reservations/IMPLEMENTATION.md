# Reservations and waitlist — implementation notes

Implemented the minimal reservations slice in the existing Express/MongoDB application.

## Backend

- Added `Reservation` and `Waitlist` models.
- Added staff routes under `/api/reservations`.
- Added reservation create, list, and status update behavior.
- Added simple conflict protection for active reservations at the same date/time/table.
- Added waitlist create, list, and status update behavior.
- Allowed Admin, Cashier, and Waiter roles to use the reservation routes.

## Frontend

- Added the staff `/reservations` page.
- Added a reservation form.
- Added reservation status management.
- Added Reservations navigation for non-Kitchen staff.

## Boundaries

Deposits, notifications, recurring bookings, multi-outlet booking, and advanced seating optimization remain outside this Phase 2 slice.

## Status

Implementation complete; runtime verification pending.
