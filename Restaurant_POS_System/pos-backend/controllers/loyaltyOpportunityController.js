const Customer = require("../models/customerModel");

const getLoyaltyOpportunities = async (req, res, next) => {
  try {
    const customers = await Customer.find({}).select("name phone email totalOrders totalSpent lastVisit").lean();
    const opportunities = customers.map((customer) => {
      const orders = Number(customer.totalOrders || 0);
      const spent = Number(customer.totalSpent || 0);
      if (orders >= 2 && orders < 5) return { customer: { _id: customer._id, name: customer.name, phone: customer.phone }, priority: "medium", opportunity: "loyalty_milestone", reason: `${5 - orders} order(s) until VIP review`, action: "Offer a return-visit incentive" };
      if (spent >= 4000 && spent < 5000) return { customer: { _id: customer._id, name: customer.name, phone: customer.phone }, priority: "high", opportunity: "vip_threshold", reason: `₹${(5000 - spent).toFixed(2)} until VIP review`, action: "Recognize high spend at next visit" };
      if (orders === 0) return { customer: { _id: customer._id, name: customer.name, phone: customer.phone }, priority: "low", opportunity: "first_visit", reason: "No completed orders recorded", action: "Invite a first visit" };
      return null;
    }).filter(Boolean).sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
    res.json({ success: true, data: { total: opportunities.length, opportunities } });
  } catch (error) { next(error); }
};

module.exports = { getLoyaltyOpportunities };
