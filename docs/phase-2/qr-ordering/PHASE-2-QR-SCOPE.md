# Phase 2 — QR ordering and QR payments scope

This extends the existing customer ordering and Razorpay payment flow.

## Included

- Table QR links that open the customer menu with a table reference
- Customer cart preserves the table reference
- Customer order submission includes table and `orderType: Dine In`
- Customer order tracking remains available
- Razorpay payment creation and verification remain server-controlled
- Verified online payment attaches to the customer order
- Payment status is shown in the customer order view
- Invalid or missing QR table references are handled safely
- Backend and frontend documentation updates

## Not included

- Printed QR generation service
- Third-party QR hosting
- New payment gateway
- Anonymous payment bypass
- Refund automation
- Multi-outlet QR management

## Status

Implementation complete; runtime and browser verification pending.
