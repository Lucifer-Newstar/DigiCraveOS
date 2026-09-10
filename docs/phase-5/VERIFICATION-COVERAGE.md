# Phase 5 Verification Coverage

The Phase 5 hardening batch uses the existing regression suites plus new focused coverage:

- Error contracts verify request IDs and stable unauthenticated responses.
- Customer portal tests verify guest registration, menu access, own-order visibility, and staff-boundary rejection.
- Staff portal suites cover admin, kitchen, workforce, inventory, reporting, and reservation flows.
- ML compatibility remains covered by the Python service suite.
- Security coverage includes headers, CORS, authentication boundaries, rate limiting, and dependency audits.
- OpenAPI, health, frontend boundary, offline queue, and deployment smoke scripts are executable checks.

The final full verifier remains the release gate.
