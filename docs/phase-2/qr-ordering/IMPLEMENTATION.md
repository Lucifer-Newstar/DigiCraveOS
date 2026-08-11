# QR ordering and QR payments — implementation notes

## QR ordering implemented

- Customer menu reads an optional `?table=<tableId>` reference.
- The table reference is preserved when moving from menu to cart.
- Cart submissions include the table reference and use `Dine In` order type.
- The backend validates the table reference before creating the order.
- Customer order history displays the table and payment state.
- Invalid table references return a clear error.

## Payment status

The existing Razorpay flow remains available for authenticated staff POS payments. Customer QR payment checkout still needs a customer-scoped payment session and is intentionally not marked complete yet.

## Status

QR ordering implementation complete; QR payment implementation pending.
