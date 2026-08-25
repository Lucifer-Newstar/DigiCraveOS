const { app, request, loginAsAdmin } = require("./helpers");
const Order = require("../../Restaurant_POS_System/pos-backend/models/orderModel");

describe("Phase 3 kitchen delay risk", () => {
  test("Admin receives at-risk kitchen items based on ticket age", async () => {
    const { cookie } = await loginAsAdmin();
    await Order.create({ orderDate: new Date(Date.now() - 35 * 60000), orderStatus: "In Progress", customerDetails: { name: "Delay Guest", phone: "9999999999", guests: 1 }, items: [{ name: "Delayed Dish", quantity: 1, kitchenStatus: "Preparing", price: 100 }], bills: { total: 100, tax: 0, totalWithTax: 100 } });
    const response = await request(app).get("/api/order/kitchen/delay-risk?thresholdMinutes=20").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.atRisk).toBeGreaterThanOrEqual(1);
    expect(response.body.data.items.some((item) => item.name === "Delayed Dish" && item.risk === "at_risk")).toBe(true);
  });
});
