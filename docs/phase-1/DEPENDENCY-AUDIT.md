# DigiCraveOS — dependency audit and Phase 1 finish-up

## Audit date

2026-09-18

## Backend

The backend cleanup removed the deprecated direct `crypto` package. Node's built-in `crypto` module is used by the payment controller and tests, so no replacement package was needed.

The backend `bcrypt` dependency was moved from 5.x to 6.x because its older native dependency chain exposed critical `tar` vulnerabilities.

Current backend audit result:

```text
npm audit: 0 vulnerabilities
```

## Frontend

The frontend direct dependencies were refreshed within the existing major-version range:

- `axios` → `^1.20.0`
- `react-router-dom` → `^7.18.4`
- `vite` → `^6.4.3`

The frontend build still passes after the refresh.

The current frontend audit reports two high-severity transitive development-tool vulnerabilities:

- `brace-expansion`, pulled through the existing lint/tooling chain
- `picomatch`, pulled through the existing Tailwind/lint/tooling chain

The direct runtime dependencies no longer report the original Axios and Vite advisories. The remaining transitive findings require a larger tooling upgrade or dependency override and are kept documented rather than forcing a potentially breaking upgrade.

## Phase 1 finish-up checks

- [x] Deprecated direct backend `crypto` package removed
- [x] Backend bcrypt dependency updated
- [x] Backend `npm audit` clean
- [x] Frontend direct Axios, router, and Vite versions refreshed
- [x] Frontend production build passes
- [ ] Backend integration tests pass against MongoDB
- [ ] Full frontend lint is clean

The remaining two checks are tracked in the Phase 1 verification notes. MongoDB must be available for the backend tests, and the full frontend lint currently includes older project-wide errors outside the KOT/KDS change.
