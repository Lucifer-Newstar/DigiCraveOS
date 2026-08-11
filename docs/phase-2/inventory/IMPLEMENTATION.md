# Inventory and recipes — implementation notes

Implemented the minimal inventory slice in the existing Express/MongoDB application.

## Backend

- Added `Ingredient` and `Recipe` models.
- Added Admin-only `/api/inventory` routes.
- Added ingredient listing, creation, and updates.
- Added recipe upsert linked to a dish.
- Added low-stock information through `stock <= reorderLevel`.
- Added order inventory deduction when an order changes to `Completed`.
- Added `inventoryDeducted` protection to prevent repeat deduction.
- Orders without a matching recipe remain compatible and do not fail deduction.

## Frontend

- Added the Admin `/inventory` page.
- Added ingredient creation form.
- Added stock and reorder-level table.
- Added low-stock status display.
- Added Inventory navigation for Admin users.

## Boundaries

Suppliers, purchase orders, batches, expiry, waste, and multi-outlet stock remain outside this Phase 2 slice.

## Status

Implementation complete; runtime verification pending.
