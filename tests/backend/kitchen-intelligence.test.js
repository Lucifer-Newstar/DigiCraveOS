const { app, request, loginAsAdmin } = require("./helpers");
const Order = require("../../Restaurant_POS_System/pos-backend/models/orderModel");

describe("Phase 3 kitchen intelligence", () => {
  test("Admin receives reconciled active station workload", async () => {
    const { cookie } = await loginAsAdmin();
    await Order.create({ customerDetails: { name: "Kitchen Guest", phone: "7444444444", guests: 1 }, orderStatus: "In Progress", bills: { total: 100, tax: 5, totalWithTax: 105 }, items: [{ name: "Naan", price: 50, quantity: 2, station: "Tandoor", kitchenStatus: "Preparing" }, { name: "Dal", price: 50, quantity: 1, station: "Main", kitchenStatus: "Pending" }] });
    const response = await request(app).get("/api/order/kitchen/intelligence").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.activeTickets).toBe(1);
    expect(response.body.data.activeItems).toBe(3);
    expect(response.body.data.statusCounts.Preparing).toBe(1);
    expect(response.body.data.stations.Tandoor).toBe(2);
    expect(response.body.data.stations.Main).toBe(1);
  });
});
