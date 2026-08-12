const createHttpError = require("http-errors");
const Order = require("../models/orderModel");

const getFinanceReport = async (req, res, next) => {
  try {
    const start = new Date(req.query.from || new Date(new Date().setDate(new Date().getDate() - 30)));
    const end = new Date(req.query.to || new Date());
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return next(createHttpError(400, "Invalid date range."));
    end.setHours(23, 59, 59, 999);
    const match = { orderDate: { $gte: start, $lte: end } };
    const [summary, byMethod, daily] = await Promise.all([
      Order.aggregate([{ $match: match }, { $group: { _id: null, orders: { $sum: 1 }, paidOrders: { $sum: { $cond: [{ $in: ["$orderStatus", ["Paid", "Completed"]] }, 1, 0] } }, revenue: { $sum: "$bills.totalWithTax" }, cgst: { $sum: "$bills.cgst" }, sgst: { $sum: "$bills.sgst" } } }]),
      Order.aggregate([{ $match: match }, { $group: { _id: { $ifNull: ["$paymentMethod", "Unknown"] }, amount: { $sum: "$bills.totalWithTax" }, count: { $sum: 1 } } }, { $project: { _id: 0, method: "$_id", amount: 1, count: 1 } }, { $sort: { amount: -1 } }]),
      Order.aggregate([{ $match: match }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } }, revenue: { $sum: "$bills.totalWithTax" }, orders: { $sum: 1 }, cgst: { $sum: "$bills.cgst" }, sgst: { $sum: "$bills.sgst" } } }, { $project: { _id: 0, date: "$_id", revenue: 1, orders: 1, cgst: 1, sgst: 1 } }, { $sort: { date: 1 } }]),
    ]);
    res.json({ success: true, data: { from: start, to: end, summary: summary[0] || { orders: 0, paidOrders: 0, revenue: 0, cgst: 0, sgst: 0 }, byMethod, daily } });
  } catch (error) { next(error); }
};

module.exports = { getFinanceReport };
