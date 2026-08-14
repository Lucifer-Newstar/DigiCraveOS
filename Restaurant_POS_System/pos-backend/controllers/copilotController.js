const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const { Ingredient } = require("../models/inventoryModel");
const Shift = require("../models/shiftModel");

const round = (value) => +(Number(value || 0).toFixed(2));

const getOwnerBriefing = async (req, res, next) => {
  try {
    const start = new Date(req.query.from || new Date(new Date().setHours(0, 0, 0, 0)));
    const end = new Date(req.query.to || new Date());
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return next(createHttpError(400, "Invalid date range."));
    end.setHours(23, 59, 59, 999);

    const [orders, lowStock, openShifts] = await Promise.all([
      Order.find({ orderDate: { $gte: start, $lte: end }, orderStatus: { $in: ["Paid", "Completed"] } }).select("bills orderStatus").lean(),
      Ingredient.find({ $expr: { $lte: ["$stock", "$reorderLevel"] } }).select("name stock reorderLevel unit").lean(),
      Shift.find({ status: "Open" }).select("staff startedAt hourlyRate").populate("staff", "name role").lean(),
    ]);

    const revenue = round(orders.reduce((sum, order) => sum + Number(order.bills?.totalWithTax || 0), 0));
    const tax = round(orders.reduce((sum, order) => sum + Number(order.bills?.tax || 0), 0));
    const insights = [];
    if (!orders.length) insights.push({ severity: "info", source: "finance", title: "No paid orders in this period", action: "Review service activity or date filters." });
    if (lowStock.length) insights.push({ severity: "warning", source: "inventory", title: `${lowStock.length} ingredient${lowStock.length === 1 ? " is" : "s are"} at reorder level`, action: "Review purchasing needs before the next service." });
    if (openShifts.length) insights.push({ severity: "warning", source: "workforce", title: `${openShifts.length} shift${openShifts.length === 1 ? " remains" : "s remain"} open`, action: "Close completed shifts to keep payroll estimates accurate." });
    if (revenue > 0 && orders.length >= 5) insights.push({ severity: "positive", source: "finance", title: `Revenue is ${round(revenue / orders.length)} per paid order`, action: "Compare this period with the previous service period." });

    res.json({ success: true, data: { from: start, to: end, summary: { paidOrders: orders.length, revenue, tax, lowStockCount: lowStock.length, openShiftCount: openShifts.length }, insights, lowStock, openShifts } });
  } catch (error) { next(error); }
};

module.exports = { getOwnerBriefing };
