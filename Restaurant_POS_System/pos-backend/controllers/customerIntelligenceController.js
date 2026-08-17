const Customer = require("../models/customerModel");

const getCustomerIntelligence = async (req, res, next) => {
  try {
    const customers = await Customer.find({}).select("-password").lean();
    const now = Date.now();
    const segment = (customer) => {
      const orders = Number(customer.totalOrders || 0);
      const spent = Number(customer.totalSpent || 0);
      const daysSinceVisit = customer.lastVisit ? (now - new Date(customer.lastVisit).getTime()) / 86400000 : Infinity;
      if (orders >= 5 || spent >= 5000) return "vip";
      if (daysSinceVisit > 30 && orders > 0) return "at_risk";
      if (orders >= 3) return "loyal";
      if (orders <= 1) return "new";
      return "regular";
    };
    const items = customers.map((customer) => ({ ...customer, segment: segment(customer) }));
    const segments = items.reduce((counts, customer) => ({ ...counts, [customer.segment]: (counts[customer.segment] || 0) + 1 }), {});
    res.json({ success: true, data: { total: items.length, segments, customers: items } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomerIntelligence };
