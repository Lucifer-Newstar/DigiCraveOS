const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastVisit: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Upsert a customer from an order's customer details (matches UML U03
// Customer.upsertFromOrder(order)$ static). Deduplicates by phone: first order
// creates the customer, later orders increment totals. Returns the customer
// doc, or null when the order carries no phone.
customerSchema.statics.upsertFromOrder = async function (order) {
  const details = (order && order.customerDetails) || {};
  const phone = details.phone && String(details.phone).trim();
  if (!phone) return null;

  return this.findOneAndUpdate(
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
};

module.exports = mongoose.model("Customer", customerSchema);
