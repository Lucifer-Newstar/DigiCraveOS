# Campaign planner — implementation

## Delivered

- Added admin-only `GET /api/customer/campaign-drafts`.
- Creates reviewable win-back and VIP appreciation drafts from customer intelligence.
- Includes safe audience identifiers, suggested channel, subject, and copy.
- Added campaign draft cards to the Customers screen.
- No messages are sent automatically.

## Verification

- Customer intelligence test covers campaign drafts and password exclusion.
- Full backend suite: **50 passed, 0 failed** across 13 suites.
- ML suite: **7 passed, 0 failed**.
- Frontend full ESLint: passed.
- Frontend production build: passed.

External marketing providers, scheduling, editing, approval, and delivery remain deferred.
