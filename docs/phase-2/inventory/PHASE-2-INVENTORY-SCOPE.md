# Phase 2 — inventory and recipes scope

This is the minimal inventory slice for DigiCraveOS Phase 2.

## Included

- Admin-managed ingredients with unit, current stock, and reorder level
- Recipes linked to dishes
- Recipe ingredient quantities
- Stock deduction when an order reaches `Completed`
- Low-stock information in the admin inventory view/API
- Validation for missing ingredients and insufficient stock
- Backend tests and implementation notes

## Not included

- Suppliers and purchase orders
- Multi-outlet stock
- Batch expiry/FIFO
- Waste logging
- Automatic procurement
- External integrations

## Status

Implementation complete — runtime verification pending.
