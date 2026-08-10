# ✅ DigiCraveOS — Phase 1 Verification (UML ↔ Implementation)

This document cross-checks the **live implementation** against the actors and
✔-marked use cases in `docs/digicrave-architecture/ARCHITECTURE-AND-UML.md`,
and records the fixes made to bring the running website in line with the
diagrams (two portals, role-based logins, the flash/blank fix, and the
customer/Guest experience that was previously missing).

Verified against a running stack (frontend :5173 · backend :8000 · ML :8100 ·
MongoDB :27017) and the automated test suite (**38 tests passing**).

---

## 1. Actors → Portals (UML U01)

| UML Actor | Portal / Experience | Login page | Status |
|-----------|---------------------|------------|--------|
| 👤 Guest / Customer | **Customer storefront** (`/customer/*`) — amber theme | `/customer/login` (separate) | ✅ built |
| 👤 POS Staff (Cashier · Waiter) | **Staff POS** (Home/Orders/Tables/Menu) | `/auth` (Staff Portal) | ✅ built |
| 👤 Kitchen Staff | **Kitchen Display (KDS-lite)** (`/kitchen`) | `/auth` | ✅ built |
| 👤 Owner / Manager (Admin) | **Admin Dashboard** (Metrics/Orders/Customers/AI/Payments) | `/auth` | ✅ built |
| 👤 Franchise HQ | (Phase 4 — roadmap) | — | ⏭ roadmap |

**Customers get a completely different login page and site** from staff, exactly
as required. Staff and customer sessions are isolated (separate cookies:
`accessToken` vs `customerToken`; JWT `type:"customer"` rejected on staff routes).

---

## 2. Phase-1 ✔ Use Cases (UML U01) — live verification

| Use case | Implementation | Live check |
|----------|----------------|-----------|
| uc1 Fast touch billing | `POST /api/order` (staff cart → order) | ✅ order created |
| uc2 Hold / resume | `POST /api/order/:id/hold` · `/resume` | ✅ On Hold → In Progress |
| uc3 Split · merge bills | `GET /api/order/:id/split` · `POST /api/order/merge` | ✅ split=2 parts, merge=3 items |
| uc4 Settle bill (cash / online) | order lifecycle → `Paid`; online auto-Paid | ✅ reached Paid |
| uc5 GST invoice · discounts | `bills.cgst/sgst` (2.5%+2.5%), Invoice print, Bill discount | ✅ cgst/sgst present |
| uc5b Manage menu (categories & dishes) | `/api/menu/*` CRUD + dashboard modals | ✅ category+dish created |
| uc13 QR / self-ordering (Guest) | Customer portal: browse → cart → place order | ✅ guest order placed |
| Auto-CRM (U03 Customer) | `Customer.upsertFromOrder`; Dashboard **Customers** tab | ✅ customers listed |
| Dashboard & metrics | `/api/order/metrics` (+trend, status donut) | ✅ revenue + trend |
| Payments view | `/api/order/payments` (summary/method/txns) | ✅ txns counted |
| AI Insights (forecast/demand/recommend) | ML service via `/api/ml/*` proxy | ✅ forecast+recommend |

> Use cases beyond the ✔ set (KOT station routing, prep ETA, coupons, refunds,
> inventory/recipes, loyalty/campaigns, aggregators, Owner Copilot, reviews,
> shifts/payroll) remain **Phase 2–4 roadmap** and are intentionally not built.

---

## 3. Bugs fixed this phase

### 3.1 "Flash then blank" on navigation
- **Cause:** `useLoadData` gated the whole app on a network call and
  **navigated on error during render**, and auth state wasn't persisted — so a
  refresh/navigation showed content, then blanked/redirected when the session
  re-check resolved (or raced on cross-site cookies).
- **Fix:** `userSlice` now hydrates from `localStorage`; `useLoadData`
  revalidates **silently in the background** (no full-screen gate when a cached
  session exists) and **never navigates on error** — route guards handle
  redirects. Same pattern applied to the customer portal (`useCustomerAuth`).

### 3.2 Missing customer & role experiences
- Added the entire **Customer/Guest portal** (was absent).
- Added **role-based staff logins/experiences**: Admin, Cashier, Waiter,
  Kitchen — each sees only what its role should (UML actors).

---

## 4. Code ↔ diagram alignment (carried from earlier phase-1 work)

Order lifecycle (U10), payment→order persistence (U11), Order/Bill methods
`markPaid/hold/resume/split/merge` (U03), `Customer.upsertFromOrder` static
(U03), OrderItem `notes/station` (U03/U04), and the ML `engines/` package (U07)
were previously reconciled; diagrams were updated to show Menu management,
Payments tab, Category/Dish models and Metrics charts. This phase adds the
**Customer actor** experience and **role-based staff** experiences to complete
the U01 actor coverage for Phase 1.

---

## 5. Test results

| Suite | Stack | Count |
|-------|-------|-------|
| Backend API | Jest + Supertest | 31 |
| ML service | pytest + FastAPI TestClient | 7 |
| **Total** | | **38 passing** |

New this phase: `tests/backend/customer-auth.test.js` (guest register/login/me,
menu browse, staff-endpoint isolation, self-order with server-computed GST,
own-order history).

Run: `bash tests/run-all-tests.sh`

---

## 6. Portal quick reference

| URL | Who | What |
|-----|-----|------|
| `/auth` | Staff | Employee login/register (Admin/Cashier/Waiter/Kitchen) |
| `/` | Cashier/Waiter/Admin | POS home |
| `/orders` `/tables` `/menu` | Cashier/Waiter/Admin | POS operations |
| `/kitchen` | Kitchen/Admin | Kitchen Display (KDS-lite) |
| `/dashboard` | Admin | Metrics · Orders · Customers · AI Insights · Payments |
| `/customer/login` | Guest | Customer login/register (separate site) |
| `/customer` | Guest | Browse menu, cart, checkout |
| `/customer/orders` | Guest | Live order tracking + history |
| `/customer/profile` | Guest | Loyalty stats |

**Phase 1 is complete and verified against the UML blueprint.**
