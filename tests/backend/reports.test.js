const { app, request, loginAsAdmin } = require("./helpers");

describe("Phase 2 finance reports", () => {
  test("Admin can read date-range revenue and GST data", async () => {
    const { cookie } = await loginAsAdmin();
    const response = await request(app).get("/api/reports/finance?from=2026-01-01&to=2026-12-31").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.summary).toEqual(expect.objectContaining({ orders: expect.any(Number), cgst: expect.any(Number), sgst: expect.any(Number) }));
    expect(Array.isArray(response.body.data.daily)).toBe(true);
  });

  test("Finance reports require Admin access", async () => {
    const response = await request(app).get("/api/reports/finance");
    expect(response.status).toBe(401);
  });
});
