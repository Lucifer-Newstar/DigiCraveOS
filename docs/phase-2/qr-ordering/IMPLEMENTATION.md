# QR ordering and QR payments — implementation notes

## QR ordering implemented

- Customer menu reads an optional `?table=<tableId>` reference.
- The table reference is preserved when moving from menu to cart.
- Cart submissions include the table reference and use `Dine In` order type.
- The backend validates the table reference before creating the order.
- Customer order history displays the table and payment state.
- Invalid table references return a clear error.

## Payment status

- Added customer-scoped Razorpay create-payment endpoint.
- Added customer-scoped HMAC verification endpoint.
- Verified customer payments update the matching customer order to `Paid`.
- Payment records are persisted in the existing `Payment` collection.
- Customer checkout opens the existing Razorpay checkout script after the order is created.

## Status

Implementation complete; runtime and browser verification pending.
