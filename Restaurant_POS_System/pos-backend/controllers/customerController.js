const Customer = require("../models/customerModel");

// List saved customers, most recently seen first.
const getCustomers = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
    const [customers, total] = await Promise.all([
      Customer.find().sort({ lastVisit: -1 }).skip((page - 1) * limit).limit(limit),
      Customer.countDocuments(),
    ]);
    res.status(200).json({ success: true, data: customers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers };
