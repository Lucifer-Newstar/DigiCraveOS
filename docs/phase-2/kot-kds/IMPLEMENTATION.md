# KOT/KDS workflow — implementation notes

## Backend

Implemented in the existing order module:

- `Order.items[].kitchenStatus` with `Pending`, `Preparing`, and `Ready`
- `GET /api/order/kitchen`
- `PATCH /api/order/:id/kitchen`
- Kitchen tickets grouped by station
- General kitchen grouping when an item has no station
- Existing item quantity and notes included in ticket responses
- Kitchen and Admin role protection on the new kitchen routes
- On-hold orders remain visible but cannot start or finish kitchen work
- Invalid state jumps return `409`

No new service, database, or external integration was added.

## Frontend

The Kitchen page now:

- Reads from the dedicated kitchen-ticket endpoint
- Groups work by station
- Shows customer, table/order type, item quantity, notes, and kitchen state
- Provides `Mark Preparing` and `Mark Ready` actions
- Keeps on-hold tickets visible and disables their actions
- Refreshes the board every 10 seconds

## Compatibility

The existing order lifecycle remains available. Kitchen ticket state is stored on line items and does not replace the existing order status state machine.

## Files changed

- `Restaurant_POS_System/pos-backend/models/orderModel.js`
- `Restaurant_POS_System/pos-backend/controllers/orderController.js`
- `Restaurant_POS_System/pos-backend/routes/orderRoute.js`
- `Restaurant_POS_System/pos-frontend/src/https/index.js`
- `Restaurant_POS_System/pos-frontend/src/pages/Kitchen.jsx`
- `tests/backend/kitchen.test.js`

## Status

Implementation is complete for the defined first slice. Runtime verification is pending because the sandbox does not currently have project dependencies or MongoDB installed.
