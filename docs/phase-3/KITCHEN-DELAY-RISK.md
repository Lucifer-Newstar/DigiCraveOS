# KDS Delay Risk

Kitchen and Admin users can query `GET /api/order/kitchen/delay-risk` for active ticket age signals. The default threshold is 20 minutes and can be configured between one and 240 minutes. An item is marked `at_risk` when its ticket age exceeds the threshold and its kitchen status is not Ready.

The Kitchen Display refreshes the signal every ten seconds and adds a Delay risk metric to the existing status cards. This is an operational warning only; it does not automatically change kitchen status or order state.

Verification:

- Kitchen delay-risk integration test passed.
- Frontend ESLint passed.
- Vite production build passed.
