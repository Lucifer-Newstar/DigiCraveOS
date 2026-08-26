# Loyalty Opportunities and Campaign Draft Editing

Admin customer intelligence now includes `GET /api/customer/loyalty-opportunities`, which identifies deterministic milestone, VIP-threshold, and first-visit opportunities for staff review.

Campaign drafts are persisted in the `CampaignDraft` model. The existing draft endpoint upserts generated audience drafts, and admins can edit subject and message through `PATCH /api/customer/campaign-drafts/:id`. The Dashboard Customers view provides an inline edit/save flow.

No campaign is sent automatically. Audience and copy remain reviewable operational data.

Verification:

- Customer intelligence integration test covers campaign persistence and editing.
- Loyalty opportunity integration test passed.
- Frontend ESLint and Vite production build passed.
