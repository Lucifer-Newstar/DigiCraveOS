const Customer = require("../models/customerModel");
const { parsePagination, paginationMeta } = require("../utils/pagination");

// List saved customers, most recently seen first.
const getCustomers = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [customers, total] = await Promise.all([
      Customer.find().sort({ lastVisit: -1 }).skip(skip).limit(limit),
      Customer.countDocuments(),
    ]);
    res.status(200).json({ success: true, data: customers, pagination: paginationMeta({ page, limit, total }) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers };
