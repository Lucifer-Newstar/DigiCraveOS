const Order = require("../models/orderModel");

const getKitchenDelayRisk = async (req, res, next) => {
  try {
    const thresholdMinutes = Math.min(Math.max(Number(req.query.thresholdMinutes) || 20, 1), 240);
    const orders = await Order.find({ orderStatus: { $nin: ["Completed", "Voided", "Paid"] } }).select("items orderStatus orderDate customerDetails").lean();
    const now = Date.now();
    const items = [];
    orders.forEach((order) => (order.items || []).forEach((item, itemIndex) => {
      const ageMinutes = Math.max(0, (now - new Date(order.orderDate || now).getTime()) / 60000);
      const kitchenStatus = item.kitchenStatus || "Pending";
      const risk = ageMinutes >= thresholdMinutes && kitchenStatus !== "Ready";
      items.push({ orderId: order._id, itemIndex, name: item.name, quantity: Number(item.quantity || 1), kitchenStatus, ageMinutes: Math.round(ageMinutes), risk: risk ? "at_risk" : "on_track", customerName: order.customerDetails?.name || "Guest" });
    }));
    res.json({ success: true, data: { thresholdMinutes, atRisk: items.filter((item) => item.risk === "at_risk").length, items } });
  } catch (error) { next(error); }
};

module.exports = { getKitchenDelayRisk };
