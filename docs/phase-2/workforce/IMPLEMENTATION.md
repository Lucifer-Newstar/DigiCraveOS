# Shifts and payroll — implementation notes

## Backend

- Added `Shift` records linked to staff users.
- Added Admin-only workforce routes.
- Added shift start and close operations.
- Prevented more than one open shift for a staff member.
- Added break minutes and notes.
- Added worked-minute and estimated-pay summary.

## Frontend

- Added Admin `/workforce` page.
- Added shift start form.
- Added open-shift list and close action.
- Added basic payroll summary cards.
- Added Workforce navigation for Admin users.

## Boundaries

This is an attendance and estimate foundation. It does not perform payroll disbursement, taxes, leave, rosters, overtime, biometrics, or multi-outlet workforce management.

## Status

Implementation complete; runtime verification pending.
