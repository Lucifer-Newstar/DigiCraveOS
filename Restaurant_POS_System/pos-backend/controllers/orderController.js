const createHttpError = require("http-errors");
const Order = require("../models/orderModel");
const Customer = require("../models/customerModel");
const Table = require("../models/tableModel");
const { default: mongoose } = require("mongoose");

// Thin wrapper around Customer.upsertFromOrder (UML U03 static). Failures here
// must not fail the order itself, so errors are swallowed with a log.
const upsertCustomerFromOrder = async (order) => {
  try {
    await Customer.upsertFromOrder(order);
  } catch (error) {
    console.log(`⚠️  Customer upsert skipped: ${error.message}`);
  }
};

const addOrder = async (req, res, next) => {
  try {
    const order = new Order(req.body);

    // An order paid online arrives with Razorpay paymentData already verified,
    // so it enters the lifecycle as Paid (matches UML U11 sequence). Cash
    // orders start In Progress unless the client set a valid status.
    const paidOnline = !!(
      req.body?.paymentData?.razorpay_payment_id ||
      req.body?.paymentData?.razorpay_order_id
    );
    if (paidOnline) {
      order.orderStatus = "Paid";
      if (order.paymentMethod == null) order.paymentMethod = "Online";
    } else if (!order.orderStatus) {
      order.orderStatus = "In Progress";
    }

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

    if (!Order.ORDER_STATUSES.includes(orderStatus)) {
      return next(
        createHttpError(
          400,
          `Invalid status "${orderStatus}". Allowed: ${Order.ORDER_STATUSES.join(", ")}`
        )
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return next(createHttpError(404, "Order not found!"));
    }

    // Enforce the state machine (matches UML U10).
    if (!Order.canTransition(order.orderStatus, orderStatus)) {
      return next(
        createHttpError(
          409,
          `Cannot move order from "${order.orderStatus}" to "${orderStatus}".`
        )
      );
    }

    order.orderStatus = orderStatus;
    await order.save();

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

// POST /api/order/:id/hold  &  /:id/resume  — matches Order.hold()/resume() (U03)
const holdOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return next(createHttpError(404, "Invalid id!"));
    const order = await Order.findById(id);
    if (!order) return next(createHttpError(404, "Order not found!"));
    order.hold();
    await order.save();
    res.status(200).json({ success: true, message: "Order on hold", data: order });
  } catch (error) {
    next(createHttpError(409, error.message));
  }
};

const resumeOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return next(createHttpError(404, "Invalid id!"));
    const order = await Order.findById(id);
    if (!order) return next(createHttpError(404, "Order not found!"));
    order.resume();
    await order.save();
    res.status(200).json({ success: true, message: "Order resumed", data: order });
  } catch (error) {
    next(createHttpError(409, error.message));
  }
};

// GET /api/order/:id/split?parts=2 — matches Bill.split() (U03). Non-persisting.
const splitOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return next(createHttpError(404, "Invalid id!"));
    const order = await Order.findById(id);
    if (!order) return next(createHttpError(404, "Order not found!"));
    const parts = Number(req.query.parts) || 2;
    res.status(200).json({ success: true, data: order.split(parts) });
  } catch (error) {
    next(error);
  }
};

// POST /api/order/merge  { orderIds: [...] } — matches Bill.merge() (U03).
const mergeOrders = async (req, res, next) => {
  try {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length < 2) {
      return next(createHttpError(400, "Provide at least two orderIds to merge."));
    }
    const valid = orderIds.filter((x) => mongoose.Types.ObjectId.isValid(x));
    const orders = await Order.find({ _id: { $in: valid } });
    if (orders.length < 2) {
      return next(createHttpError(404, "Two valid orders not found."));
    }
    res.status(200).json({ success: true, data: Order.merge(orders) });
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
  holdOrder,
  resumeOrder,
  splitOrder,
  mergeOrders,
};
