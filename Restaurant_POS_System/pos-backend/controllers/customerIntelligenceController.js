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

const getRetentionRecommendations = async (req, res, next) => {
  try {
    const customers = await Customer.find({}).select("-password").lean();
    const now = Date.now();
    const recommendations = customers.map((customer) => {
      const orders = Number(customer.totalOrders || 0);
      const spent = Number(customer.totalSpent || 0);
      const daysSinceVisit = customer.lastVisit ? Math.max(0, Math.floor((now - new Date(customer.lastVisit).getTime()) / 86400000)) : null;
      if (daysSinceVisit !== null && daysSinceVisit > 30 && orders > 0) return { customer: { _id: customer._id, name: customer.name, phone: customer.phone, email: customer.email }, priority: daysSinceVisit > 60 ? "high" : "medium", reason: `${daysSinceVisit} days since last visit`, action: "Send a win-back offer", channel: customer.hasAccount ? "email_or_in_app" : "phone_or_sms", daysSinceVisit };
      if (orders >= 5 || spent >= 5000) return { customer: { _id: customer._id, name: customer.name, phone: customer.phone, email: customer.email }, priority: "low", reason: "High-value customer", action: "Offer loyalty recognition", channel: customer.hasAccount ? "in_app" : "staff_prompt", daysSinceVisit };
      return null;
    }).filter(Boolean).sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority] || (b.daysSinceVisit || 0) - (a.daysSinceVisit || 0)));
    res.json({ success: true, data: { total: recommendations.length, recommendations } });
  } catch (error) {
    next(error);
  }
};

const getCampaignDrafts = async (req, res, next) => {
  try {
    const customers = await Customer.find({}).select("-password").lean();
    const now = Date.now();
    const atRisk = customers.filter((customer) => customer.totalOrders > 0 && customer.lastVisit && (now - new Date(customer.lastVisit).getTime()) / 86400000 > 30);
    const vip = customers.filter((customer) => customer.totalOrders >= 5 || customer.totalSpent >= 5000);
    const safe = (customer) => ({ _id: customer._id, name: customer.name, phone: customer.phone, email: customer.email });
    const campaigns = [];
    if (atRisk.length) campaigns.push({ id: "win-back", name: "Win-back customers", audienceCount: atRisk.length, channel: "email_or_sms", subject: "We saved a table for you", message: "We miss you. Come back and enjoy a special welcome on your next visit.", audience: atRisk.map(safe) });
    if (vip.length) campaigns.push({ id: "vip-appreciation", name: "VIP appreciation", audienceCount: vip.length, channel: "in_app_or_staff", subject: "Thank you for being a regular", message: "Thank you for dining with us. Ask our team about your VIP appreciation benefit.", audience: vip.map(safe) });
    res.json({ success: true, data: { total: campaigns.length, campaigns } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomerIntelligence, getRetentionRecommendations, getCampaignDrafts };
