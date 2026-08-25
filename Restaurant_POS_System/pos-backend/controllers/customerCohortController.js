const Customer = require("../models/customerModel");

const getCustomerCohorts = async (req, res, next) => {
  try {
    const customers = await Customer.find({}).select("name totalOrders totalSpent createdAt lastVisit").lean();
    const cohorts = new Map();
    customers.forEach((customer) => {
      const date = new Date(customer.createdAt || customer.lastVisit || Date.now());
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      const cohort = cohorts.get(key) || { cohort: key, customers: 0, orders: 0, revenue: 0 };
      cohort.customers += 1;
      cohort.orders += Number(customer.totalOrders || 0);
      cohort.revenue += Number(customer.totalSpent || 0);
      cohorts.set(key, cohort);
    });
    const items = [...cohorts.values()].sort((a, b) => b.cohort.localeCompare(a.cohort)).map((cohort) => ({ ...cohort, revenue: Number(cohort.revenue.toFixed(2)), averageSpend: cohort.customers ? Number((cohort.revenue / cohort.customers).toFixed(2)) : 0, ordersPerCustomer: cohort.customers ? Number((cohort.orders / cohort.customers).toFixed(2)) : 0 }));
    res.json({ success: true, data: { totalCustomers: customers.length, cohorts: items } });
  } catch (error) { next(error); }
};

module.exports = { getCustomerCohorts };
