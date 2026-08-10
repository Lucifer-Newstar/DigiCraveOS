const Customer = require("../models/customerModel");

// List saved customers, most recently seen first.
const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ lastVisit: -1 });
    res.status(200).json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers };
