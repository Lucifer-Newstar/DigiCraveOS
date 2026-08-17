const Order = require("../models/orderModel");

const getKitchenIntelligence = async (req, res, next) => {
  try {
    const orders = await Order.find({ orderStatus: { $nin: ["Completed", "Voided", "Paid"] } }).select("items orderStatus").lean();
    const statusCounts = { Pending: 0, Preparing: 0, Ready: 0 };
    const stations = {};
    let activeItems = 0;
    orders.forEach((order) => (order.items || []).forEach((item) => {
      const status = item.kitchenStatus || "Pending";
      const station = item.station || "General";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      stations[station] = (stations[station] || 0) + Number(item.quantity || 1);
      activeItems += Number(item.quantity || 1);
    }));
    res.json({ success: true, data: { activeTickets: orders.length, activeItems, statusCounts, stations } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getKitchenIntelligence };
