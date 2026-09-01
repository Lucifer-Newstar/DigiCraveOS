const { app, request, loginAsAdmin } = require("./helpers");
const Customer = require("../../Restaurant_POS_System/pos-backend/models/customerModel");

describe("Phase 4 customer pagination", () => {
  test("Admin receives bounded customer pages and metadata", async () => {
    const { cookie } = await loginAsAdmin();
    const suffix = Date.now();
    await Customer.create([
      { name: `Page Customer A ${suffix}`, phone: `76666${String(suffix).slice(-5)}` },
      { name: `Page Customer B ${suffix}`, phone: `77777${String(suffix).slice(-5)}` },
    ]);
    const response = await request(app).get("/api/customer?page=2&limit=1").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.limit).toBe(1);
    expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);
  });
});
