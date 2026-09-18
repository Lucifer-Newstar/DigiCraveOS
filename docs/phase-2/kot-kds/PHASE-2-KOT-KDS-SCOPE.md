# DigiCraveOS — Phase 2 KOT/KDS scope

DigiCraveOS is maintained by **Lucifer-Newstar / Navin Jairam**.

This note defines the first Phase 2 development slice: expanding the existing Kitchen Display System-lite into a clearer kitchen ticket workflow.

## Why this comes first

Phase 1 already has:

- Orders with line items
- Optional item notes
- Optional kitchen station values
- An order status lifecycle
- A Kitchen page for Kitchen and Admin roles
- A basic "Mark Ready" action

The first Phase 2 step builds on those pieces instead of introducing a separate kitchen product or a new database service.

## Scope for this step

### Included

- A kitchen ticket API derived from active orders
- Kitchen ticket data grouped by order and station
- Ticket-level states: `Pending`, `Preparing`, and `Ready`
- A kitchen action to move a ticket forward through those states
- Station visibility using the existing `OrderItem.station` field
- Item notes and quantities on kitchen tickets
- A clearer Kitchen Display with state filters and action buttons
- Access limited to Kitchen and Admin staff
- Backend tests for ticket retrieval, role access, and valid state changes
- Frontend build/lint checks where available

### Not included yet

- Inventory deduction
- Recipe or ingredient management
- Reservations or waitlists
- Offline sync
- WebSocket infrastructure
- Printer integration
- New payment behavior
- Automatic prep-time prediction
- New third-party services

## Working behavior

1. Orders in `In Progress` are visible as pending kitchen work.
2. A kitchen user can start a ticket, changing it to `Preparing`.
3. A kitchen user can finish a ticket, changing it to `Ready`.
4. Finishing all active station work keeps the existing order lifecycle compatible; the order can still be moved through the existing order status API.
5. Orders on hold are visible but cannot be started until resumed.
6. Existing order notes, quantities, and station values remain visible.
7. If an order has no station value, it appears in a general kitchen view.

## API direction

The first implementation will use the existing `/api/order` area and existing authentication. The API should return a stable response shape:

```json
{
  "success": true,
  "data": []
}
```

No separate service or external integration is planned for this step.

## Documentation and verification checklist

- [x] Scope recorded before implementation
- [x] Backend implementation recorded
- [x] Frontend implementation recorded
- [x] Tests recorded
- [x] Manual verification recorded
- [x] Commit recorded
- [ ] Phase 2 progress index updated

## Status

**Implementation complete — runtime verification pending.**

Implementation commit: `7a52868` (`feat(kitchen): add station ticket workflow`)
