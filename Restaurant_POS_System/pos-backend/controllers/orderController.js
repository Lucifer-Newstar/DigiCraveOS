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

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: revenueAgg?.totalRevenue || 0,
        totalOrders: revenueAgg?.totalOrders || 0,
        totalCustomers,
        activeOrders,
        readyOrders,
        totalTables,
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

module.exports = {
  addOrder,
  getOrderById,
  getOrders,
  updateOrder,
  getMetrics,
  getPopularDishes,
};
