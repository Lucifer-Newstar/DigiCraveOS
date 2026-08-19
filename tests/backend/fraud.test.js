const { app, request, loginAsAdmin } = require("./helpers");
const Order = require("../../Restaurant_POS_System/pos-backend/models/orderModel");
const Payment = require("../../Restaurant_POS_System/pos-backend/models/paymentModel");

describe("Phase 3 fraud detection", () => {
  test("Admin receives duplicate and high-value payment signals", async () => {
    const { cookie } = await loginAsAdmin();
    const order = await Order.create({ customerDetails: { name: "High Value Guest", phone: "7111111111", guests: 1 }, orderStatus: "Paid", bills: { total: 12000, tax: 600, totalWithTax: 12600 }, items: [{ name: "Large Order", price: 12000, quantity: 1 }] });
    await Payment.create({ orderId: order._id.toString(), paymentId: "pay_one", amount: 12600, status: "captured" });
    await Payment.create({ orderId: order._id.toString(), paymentId: "pay_two", amount: 12600, status: "captured" });
    const response = await request(app).get("/api/reports/fraud-signals").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.highSeverity).toBeGreaterThanOrEqual(1);
    expect(response.body.data.signals.some((signal) => signal.type === "duplicate_payment_records")).toBe(true);
    expect(response.body.data.signals.some((signal) => signal.type === "high_value_order")).toBe(true);
  });
});
