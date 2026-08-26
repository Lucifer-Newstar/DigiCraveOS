const { app, request, loginAsAdmin } = require("./helpers");
const Customer = require("../../Restaurant_POS_System/pos-backend/models/customerModel");

describe("Phase 3 loyalty opportunities", () => {
  test("Admin receives actionable milestone recommendations", async () => {
    const { cookie } = await loginAsAdmin();
    await Customer.create({ name: "Near VIP", phone: "7000000001", totalOrders: 2, totalSpent: 800 });
    await Customer.create({ name: "High Spend", phone: "7000000002", totalOrders: 1, totalSpent: 4500 });
    const response = await request(app).get("/api/customer/loyalty-opportunities").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.total).toBeGreaterThanOrEqual(2);
    expect(response.body.data.opportunities.map((item) => item.opportunity)).toEqual(expect.arrayContaining(["loyalty_milestone", "vip_threshold"]));
  });
});
