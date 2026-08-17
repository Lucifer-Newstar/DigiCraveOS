const { app, request, loginAsAdmin } = require("./helpers");
const Customer = require("../../Restaurant_POS_System/pos-backend/models/customerModel");

describe("Phase 3 customer intelligence", () => {
  test("Admin receives safe customer segments without passwords", async () => {
    const { cookie } = await loginAsAdmin();
    await Customer.create({ name: "VIP Guest", phone: "7666666666", password: "secret", totalOrders: 6, totalSpent: 6200 });
    await Customer.create({ name: "New Guest", phone: "7555555555", totalOrders: 1, totalSpent: 200 });
    const response = await request(app).get("/api/customer/intelligence").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(2);
    expect(response.body.data.segments.vip).toBe(1);
    expect(response.body.data.segments.new).toBe(1);
    expect(response.body.data.customers.every((customer) => !customer.password)).toBe(true);
  });
});
