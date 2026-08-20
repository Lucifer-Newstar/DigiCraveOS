const { app, request } = require("./helpers");

describe("Phase 3 admin endpoint security", () => {
  test.each([
    "/api/reports/profit",
    "/api/reports/pricing-recommendations",
    "/api/reports/owner-briefing",
    "/api/reports/payment-reconciliation",
    "/api/reports/fraud-signals",
    "/api/customer/intelligence",
    "/api/customer/retention",
    "/api/customer/campaign-drafts",
  ])("rejects unauthenticated access to %s", async (path) => {
    const response = await request(app).get(path);
    expect(response.status).toBe(401);
  });
});
