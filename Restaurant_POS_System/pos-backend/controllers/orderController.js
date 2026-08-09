const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Customer = require("../models/customerModel");
const Table = require("../models/tableModel");
const { default: mongoose } = require("mongoose");

// Upsert a customer record from an order's customer details.
// Deduplicates by phone: first order creates the customer, later orders
// increment their totals. Failures here must not fail the order itself.
const upsertCustomerFromOrder = async (order) => {
  try {
    const details = order.customerDetails || {};
    const phone = details.phone && String(details.phone).trim();
    if (!phone) return;

    await Customer.findOneAndUpdate(
      { phone },
      {
        $set: { name: details.name, lastVisit: new Date() },
        $inc: {
          totalOrders: 1,
          totalSpent: order.bills?.totalWithTax || 0,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    console.log(`⚠️  Customer upsert skipped: ${error.message}`);
  }
};

const addOrder = async (req, res, next) => {
  try {
    const order = new Order(req.body);
    await order.save();
    await upsertCustomerFromOrder(order);
    res
      .status(201)
      .json({ success: true, message: "Order created!", data: order });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findById(id);
    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("table");
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid id!");
      return next(error);
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res
      .status(200)
      .json({ success: true, message: "Order updated", data: order });
  } catch (error) {
    next(error);
  }
};

// Dashboard metrics computed live from the database (no hardcoded values).
const getMetrics = async (req, res, next) => {
  try {
    const [revenueAgg] = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$bills.totalWithTax" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const [totalCustomers, activeOrders, readyOrders, totalTables] =
      await Promise.all([
        Customer.countDocuments(),
        Order.countDocuments({ orderStatus: "In Progress" }),
        Order.countDocuments({ orderStatus: "Ready" }),
        Table.countDocuments(),
      ]);

    // Last-14-days revenue trend (for the dashboard chart).
    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);

    const trendAgg = await Order.aggregate([
      {
        $addFields: {
          _day: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $ifNull: ["$orderDate", "$createdAt"] },
            },
          },
        },
      },
      { $match: { _day: { $gte: since.toISOString().slice(0, 10) } } },
      {
        $group: {
          _id: "$_day",
          revenue: { $sum: "$bills.totalWithTax" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1, orders: 1 } },
    ]);

    // Order-status breakdown (for the donut chart).
    const statusAgg = await Order.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$orderStatus", "Unknown"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: revenueAgg?.totalRevenue || 0,
        totalOrders: revenueAgg?.totalOrders || 0,
        totalCustomers,
        activeOrders,
        readyOrders,
        totalTables,
        revenueTrend: trendAgg,
        statusBreakdown: statusAgg,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Most-ordered dishes, aggregated from every order's line items.
const getPopularDishes = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const dishes = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          numberOfOrders: { $sum: { $ifNull: ["$items.quantity", 1] } },
        },
      },
      { $sort: { numberOfOrders: -1 } },
      { $limit: limit },
      { $project: { _id: 0, name: "$_id", numberOfOrders: 1 } },
    ]);

    res.status(200).json({ success: true, data: dishes });
  } catch (error) {
    next(error);
  }
};

// Payments view derived from orders (every order carries a paymentMethod,
// bills and — for online payments — Razorpay ids). Returns a summary plus the
// most recent payment rows so the dashboard can show real collection data.
const getPayments = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 25;

    const [summaryAgg, byMethod, recent] = await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalCollected: { $sum: "$bills.totalWithTax" },
            totalTax: { $sum: "$bills.tax" },
            count: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$paymentMethod", "Unknown"] },
            amount: { $sum: "$bills.totalWithTax" },
            count: { $sum: 1 },
          },
        },
        { $sort: { amount: -1 } },
        { $project: { _id: 0, method: "$_id", amount: 1, count: 1 } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("customerDetails bills paymentMethod paymentData orderDate createdAt orderStatus"),
    ]);

    const summary = summaryAgg[0] || {
      totalCollected: 0,
      totalTax: 0,
      count: 0,
    };

    const payments = recent.map((o) => ({
      _id: o._id,
      customerName: o.customerDetails?.name || "Guest",
      amount: o.bills?.totalWithTax || 0,
      tax: o.bills?.tax || 0,
      method: o.paymentMethod || "Unknown",
      status: o.orderStatus || "",
      transactionId:
        o.paymentData?.razorpay_payment_id || o.paymentData?.razorpay_order_id || "—",
      date: o.orderDate || o.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCollected: summary.totalCollected || 0,
          totalTax: summary.totalTax || 0,
          transactions: summary.count || 0,
        },
        byMethod,
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrder,
  getOrderById,
  getOrders,
  updateOrder,
  getMetrics,
  getPopularDishes,
  getPayments,
};
