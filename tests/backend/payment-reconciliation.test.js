const { app, request, loginAsAdmin } = require("./helpers");
const Order = require("../../Restaurant_POS_System/pos-backend/models/orderModel");
const Payment = require("../../Restaurant_POS_System/pos-backend/models/paymentModel");

describe("Phase 3 payment reconciliation", () => {
  test("Admin receives read-only payment mismatch findings", async () => {
    const { cookie } = await loginAsAdmin();
    const order = await Order.create({ customerDetails: { name: "Recon Guest", phone: "7222222222", guests: 1 }, orderStatus: "Paid", bills: { total: 100, tax: 5, totalWithTax: 105 }, items: [{ name: "Recon Dish", price: 100, quantity: 1 }] });
    await Payment.create({ orderId: order._id.toString(), paymentId: "pay_recon", amount: 95, currency: "INR", status: "captured", method: "UPI" });
    const response = await request(app).get("/api/reports/payment-reconciliation").set("Cookie", cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.reconciled).toBe(false);
    expect(response.body.data.issues.some((issue) => issue.type === "amount_mismatch" && issue.orderId === order._id.toString())).toBe(true);
  });
});
