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
    // Dine-in (default) vs a guest self-order for pickup/delivery.
    orderType: { type: String, default: "Dine In" },
    // Who created the order: "staff" (POS) or "customer" (guest self-order).
    placedBy: { type: String, default: "staff" },
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

/* --------------------------- domain methods (U03) --------------------------- */

// Mark an order as paid, recording payment metadata. Matches Order.markPaid().
orderSchema.methods.markPaid = function (paymentData = {}, method) {
  if (!Order.canTransition(this.orderStatus, "Paid")) {
    // Allow paying from Served/Billing; otherwise flag the caller.
    throw new Error(`Cannot mark Paid from "${this.orderStatus}".`);
  }
  this.orderStatus = "Paid";
  if (method) this.paymentMethod = method;
  if (paymentData && (paymentData.razorpay_order_id || paymentData.razorpay_payment_id)) {
    this.paymentData = paymentData;
  }
  return this;
};

// Put an order On Hold, remembering where it came from. Matches Order.hold().
orderSchema.methods.hold = function () {
  if (!Order.canTransition(this.orderStatus, "On Hold")) {
    throw new Error(`Cannot hold from "${this.orderStatus}".`);
  }
  this._statusBeforeHold = this.orderStatus;
  this.orderStatus = "On Hold";
  return this;
};

// Resume a held order back to its previous status. Matches Order.resume().
orderSchema.methods.resume = function () {
  if (this.orderStatus !== "On Hold") {
    throw new Error(`Order is not On Hold (current: "${this.orderStatus}").`);
  }
  this.orderStatus = this._statusBeforeHold || "In Progress";
  this._statusBeforeHold = undefined;
  return this;
};

// Recompute this order's bill from its line items + a discount. Helper used
// by split/merge so totals & GST stay consistent (2.5% CGST + 2.5% SGST).
function computeBills(items, discount = 0) {
  const total = items.reduce(
    (s, it) => s + (it.price ?? (it.pricePerQuantity || 0) * (it.quantity || 1)),
    0
  );
  const taxable = Math.max(total - discount, 0);
  const cgst = +(taxable * 0.025).toFixed(2);
  const sgst = +(taxable * 0.025).toFixed(2);
  const tax = +(cgst + sgst).toFixed(2);
  return {
    total: +total.toFixed(2),
    discount,
    cgst,
    sgst,
    tax,
    totalWithTax: +(taxable + tax).toFixed(2),
  };
}
orderSchema.statics.computeBills = computeBills;

// Split this order's items into N child bills by ratios (or evenly).
// Returns plain bill objects (matches Bill.split()). Non-persisting.
orderSchema.methods.split = function (parts = 2) {
  const n = Math.max(2, Number(parts) || 2);
  const items = this.items || [];
  const groups = Array.from({ length: n }, () => []);
  items.forEach((it, i) => groups[i % n].push(it.toObject ? it.toObject() : it));
  return groups
    .filter((g) => g.length > 0)
    .map((g, idx) => ({
      part: idx + 1,
      items: g,
      bills: computeBills(g),
    }));
};

// Merge several orders' items + bills into one combined bill (matches
// Bill.merge()). Static because it operates across multiple orders.
orderSchema.statics.merge = function (orders = []) {
  const items = orders.flatMap((o) =>
    (o.items || []).map((it) => (it.toObject ? it.toObject() : it))
  );
  const discount = orders.reduce((s, o) => s + (o.bills?.discount || 0), 0);
  return { items, bills: computeBills(items, discount) };
};

orderSchema.statics.STATUSES = ORDER_STATUSES;
orderSchema.statics.TRANSITIONS = STATUS_TRANSITIONS;

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.STATUS_TRANSITIONS = STATUS_TRANSITIONS;
