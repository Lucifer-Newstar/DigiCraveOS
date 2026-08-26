const Order = require("../models/orderModel");

const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const exportOrdersCsv = async (req, res, next) => {
  try {
    const from = new Date(req.query.from || new Date(Date.now() - 30 * 86400000));
    const to = new Date(req.query.to || new Date());
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return res.status(400).json({ success: false, message: "Invalid date range." });
    to.setHours(23, 59, 59, 999);
    const orders = await Order.find({ orderDate: { $gte: from, $lte: to } }).sort({ orderDate: 1 }).lean();
    const rows = [["Date", "Order status", "Customer", "Phone", "Total", "Tax", "Total with tax"]];
    orders.forEach((order) => rows.push([order.orderDate?.toISOString(), order.orderStatus, order.customerDetails?.name, order.customerDetails?.phone, order.bills?.total, order.bills?.tax, order.bills?.totalWithTax]));
    res.type("text/csv").set("Content-Disposition", `attachment; filename="orders-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}.csv"`).send(rows.map((row) => row.map(csvCell).join(",")).join("\n"));
  } catch (error) { next(error); }
};

module.exports = { exportOrdersCsv };
