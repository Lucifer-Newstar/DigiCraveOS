const { app, request, loginAsAdmin } = require("./helpers");
const Order = require("../../Restaurant_POS_System/pos-backend/models/orderModel");

describe("Phase 4 order pagination", () => {
  test("Staff receives bounded order pages and metadata", async () => {
    const { cookie } = await loginAsAdmin();
    const suffix = Date.now();
    await Order.create([
      { customerDetails: { name: `Page Guest A ${suffix}`, phone: `74444${String(suffix).slice(-5)}`, guests: 1 }, items: [{ name: "Dish A", price: 10 }], bills: { total: 10, tax: 0, totalWithTax: 10 } },
      { customerDetails: { name: `Page Guest B ${suffix}`, phone: `75555${String(suffix).slice(-5)}`, guests: 1 }, items: [{ name: "Dish B", price: 20 }], bills: { total: 20, tax: 0, totalWithTax: 20 } },
    ]);
    const response = await request(app).get("/api/order?page=2&limit=1").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.limit).toBe(1);
    expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);
  });
});
