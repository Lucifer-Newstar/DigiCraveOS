const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");

const amount = (value) => Math.round(Number(value || 0) * 100) / 100;

const getPaymentReconciliation = async (req, res, next) => {
  try {
    const [orders, payments] = await Promise.all([
      Order.find({ orderStatus: { $in: ["Paid", "Completed"] } }).select("bills paymentData paymentMethod").lean(),
      Payment.find({}).lean(),
    ]);
    const paymentByOrder = new Map(payments.filter((payment) => payment.orderId).map((payment) => [String(payment.orderId), payment]));
    const issues = [];
    const matchedOrderIds = new Set();
    orders.forEach((order) => {
      const payment = paymentByOrder.get(String(order._id));
      if (!payment) {
        issues.push({ type: "missing_payment", severity: "high", orderId: order._id, amount: amount(order.bills?.totalWithTax), action: "Review the gateway settlement and payment record." });
        return;
      }
      matchedOrderIds.add(String(order._id));
      if (amount(payment.amount) !== amount(order.bills?.totalWithTax)) issues.push({ type: "amount_mismatch", severity: "high", orderId: order._id, expected: amount(order.bills?.totalWithTax), recorded: amount(payment.amount), action: "Reconcile the order total against the gateway settlement." });
    });
    payments.filter((payment) => payment.orderId && !matchedOrderIds.has(String(payment.orderId)) && !orders.some((order) => String(order._id) === String(payment.orderId))).forEach((payment) => issues.push({ type: "orphan_payment", severity: "medium", paymentId: payment._id, orderId: payment.orderId, amount: amount(payment.amount), action: "Find the related order before closing the settlement." }));
    res.json({ success: true, data: { checkedOrders: orders.length, checkedPayments: payments.length, issueCount: issues.length, reconciled: issues.length === 0, issues } });
  } catch (error) { next(error); }
};

module.exports = { getPaymentReconciliation };
