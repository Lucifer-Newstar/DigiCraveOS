const mongoose = require("mongoose");

// Canonical order lifecycle (matches UML U10 state machine):
//   In Progress -> Ready -> Served -> Billing -> Paid -> Completed
// with hold/resume and void branches.
const ORDER_STATUSES = [
  "In Progress",
  "On Hold",
  "Ready",
  "Served",
  "Billing",
  "Paid",
  "Completed",
  "Voided",
];

// Allowed forward/side transitions. "Completed" and "Voided" are terminal.
const STATUS_TRANSITIONS = {
  "In Progress": ["On Hold", "Ready", "Voided"],
  "On Hold": ["In Progress", "Voided"],
  Ready: ["Served", "Voided"],
  Served: ["Billing", "Paid", "Voided"],
  Billing: ["Paid", "Voided"],
  Paid: ["Completed"],
  Completed: [],
  Voided: [],
};

// Line item embedded in Order.items[] (matches UML U03 OrderItem).
const orderItemSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.Mixed },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    pricePerQuantity: { type: Number },
    quantity: { type: Number, default: 1 },
    notes: { type: String, default: "" }, // special instructions (U03)
    station: { type: String, default: "" }, // kitchen station routing (U03)
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      guests: { type: Number, required: true },
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ORDER_STATUSES,
      default: "In Progress",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    bills: {
      invoiceNo: { type: String }, // GST invoice series (U03 Bill)
      total: { type: Number, required: true },
      tax: { type: Number, required: true },
      totalWithTax: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
    },
    items: [orderItemSchema],
    table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
    paymentMethod: String,
    paymentData: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
    },
    // Set to the previous status when an order is put On Hold, so resume()
    // can return it to where it was.
    _statusBeforeHold: { type: String },
  },
  { timestamps: true }
);

/* --------------------------- lifecycle helpers --------------------------- */

// Whether a transition from -> to is allowed by the state machine.
orderSchema.statics.canTransition = function (from, to) {
  if (!from) return true; // brand-new order
  if (from === to) return true; // idempotent
  return (STATUS_TRANSITIONS[from] || []).includes(to);
};

// Compute a per-line total (matches UML OrderItem.lineTotal()).
orderItemSchema.methods.lineTotal = function () {
  if (typeof this.price === "number") return this.price;
  return (this.pricePerQuantity || 0) * (this.quantity || 1);
};

orderSchema.statics.STATUSES = ORDER_STATUSES;
orderSchema.statics.TRANSITIONS = STATUS_TRANSITIONS;

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.STATUS_TRANSITIONS = STATUS_TRANSITIONS;
