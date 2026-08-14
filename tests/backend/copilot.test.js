const { app, request, loginAsAdmin } = require("./helpers");
const Order = require("../../Restaurant_POS_System/pos-backend/models/orderModel");
const { Ingredient } = require("../../Restaurant_POS_System/pos-backend/models/inventoryModel");

describe("Phase 3 owner copilot", () => {
  test("Admin receives a deterministic operational briefing", async () => {
    const { cookie } = await loginAsAdmin();
    await Ingredient.create({ name: `Briefing Stock ${Date.now()}`, unit: "kg", stock: 1, reorderLevel: 2 });
    await Order.create({ customerDetails: { name: "Briefing Guest", phone: "7999999999", guests: 1 }, orderStatus: "Paid", bills: { total: 200, tax: 10, totalWithTax: 210 }, items: [{ name: "Briefing Dish", price: 200, quantity: 1 }] });
    const response = await request(app).get("/api/reports/owner-briefing").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.summary.paidOrders).toBe(1);
    expect(response.body.data.summary.revenue).toBe(210);
    expect(response.body.data.summary.lowStockCount).toBe(1);
    expect(response.body.data.insights.some((insight) => insight.source === "inventory")).toBe(true);
  });
});
