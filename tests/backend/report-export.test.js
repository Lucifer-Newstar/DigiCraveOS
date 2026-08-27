const { app, request, loginAsAdmin } = require("./helpers");
const Order = require("../../Restaurant_POS_System/pos-backend/models/orderModel");

describe("Phase 3 report export", () => {
  test("Admin can export a date-filtered order CSV", async () => {
    const { cookie } = await loginAsAdmin();
    await Order.create({ orderDate: new Date("2026-02-15"), orderStatus: "Paid", customerDetails: { name: "CSV Guest", phone: "7666666666", guests: 1 }, items: [{ name: "CSV Dish", price: 100, quantity: 1 }], bills: { total: 100, tax: 5, totalWithTax: 105 } });
    const response = await request(app).get("/api/reports/export/orders.csv?from=2026-02-01&to=2026-02-28").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.text).toContain("\"Date\",\"Order status\"");
    expect(response.text).toContain("CSV Guest");
  });
});
