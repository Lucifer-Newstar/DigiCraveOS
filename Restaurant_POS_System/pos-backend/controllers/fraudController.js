const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");

const amount = (value) => Math.round(Number(value || 0) * 100) / 100;

const getFraudSignals = async (req, res, next) => {
  try {
    const [orders, payments] = await Promise.all([
      Order.find({ orderStatus: { $in: ["Paid", "Completed"] } }).select("bills paymentData").lean(),
      Payment.find({}).lean(),
    ]);
    const signals = [];
    const paymentsByOrder = payments.reduce((map, payment) => {
      if (payment.orderId) map.set(String(payment.orderId), [...(map.get(String(payment.orderId)) || []), payment]);
      return map;
    }, new Map());
    orders.forEach((order) => {
      const related = paymentsByOrder.get(String(order._id)) || [];
      const expected = amount(order.bills?.totalWithTax);
      if (expected >= 10000) signals.push({ type: "high_value_order", severity: "medium", orderId: order._id, amount: expected, rule: "paid order is at least ₹10,000", action: "Confirm customer and settlement evidence." });
      if (related.length > 1) signals.push({ type: "duplicate_payment_records", severity: "high", orderId: order._id, paymentIds: related.map((payment) => payment.paymentId || String(payment._id)), rule: "more than one payment record references the order", action: "Check for duplicate capture or replay." });
      related.filter((payment) => amount(payment.amount) !== expected).forEach((payment) => signals.push({ type: "payment_amount_mismatch", severity: "high", orderId: order._id, paymentId: payment.paymentId || payment._id, expected, recorded: amount(payment.amount), rule: "recorded amount differs from billed total", action: "Reconcile gateway amount before closing the order." }));
    });
    res.json({ success: true, data: { signalCount: signals.length, highSeverity: signals.filter((signal) => signal.severity === "high").length, signals } });
  } catch (error) { next(error); }
};

module.exports = { getFraudSignals };
