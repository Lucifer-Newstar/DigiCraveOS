const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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
    // Auth fields — only present when a customer self-registers on the Guest
    // portal. Records auto-created from staff orders leave these empty.
    email: {
      type: String,
      sparse: true, // allow many customers without an email
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    hasAccount: {
      type: Boolean,
      default: false,
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

// Hash the password when a customer sets one (self-registration / password change).
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

customerSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

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
