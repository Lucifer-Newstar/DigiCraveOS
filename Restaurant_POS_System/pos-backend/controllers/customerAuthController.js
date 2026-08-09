const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const Customer = require("../models/customerModel");
const Order = require("../models/orderModel");
const config = require("../config/config");

// Customer (Guest) authentication — separate from staff (User) auth.
// Uses its own cookie ("customerToken") and a JWT tagged type:"customer" so a
// guest session can never be used on staff-only endpoints and vice versa.

const cookieOpts = () => ({
  maxAge: 1000 * 60 * 60 * 24 * 30,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
});

const signToken = (id) =>
  jwt.sign({ _id: id, type: "customer" }, config.accessTokenSecret, {
    expiresIn: "30d",
  });

const publicCustomer = (c) => ({
  _id: c._id,
  name: c.name,
  email: c.email,
  phone: c.phone,
  totalOrders: c.totalOrders,
  totalSpent: c.totalSpent,
  lastVisit: c.lastVisit,
});

// POST /api/customer/auth/register
const register = async (req, res, next) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !email || !password) {
      return next(createHttpError(400, "All fields are required!"));
    }

    // A customer may already exist (created from a staff order by phone).
    // Attach account credentials to it rather than creating a duplicate.
    let customer = await Customer.findOne({ phone });

    if (customer && customer.hasAccount) {
      return next(createHttpError(400, "An account with this phone already exists!"));
    }

    const emailTaken = await Customer.findOne({ email, hasAccount: true });
    if (emailTaken) {
      return next(createHttpError(400, "An account with this email already exists!"));
    }

    if (!customer) {
      customer = new Customer({ name, phone });
    }
    customer.name = name;
    customer.email = email;
    customer.password = password; // hashed by pre-save hook
    customer.hasAccount = true;
    await customer.save();

    res.cookie("customerToken", signToken(customer._id), cookieOpts());
    res.status(201).json({
      success: true,
      message: "Account created!",
      data: publicCustomer(customer),
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(createHttpError(409, "Phone or email already registered!"));
    }
    next(error);
  }
};

// POST /api/customer/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(createHttpError(400, "All fields are required!"));
    }
    const customer = await Customer.findOne({ email, hasAccount: true });
    if (!customer) return next(createHttpError(401, "Invalid Credentials"));

    const ok = await customer.comparePassword(password);
    if (!ok) return next(createHttpError(401, "Invalid Credentials"));

    res.cookie("customerToken", signToken(customer._id), cookieOpts());
    res.status(200).json({
      success: true,
      message: "Logged in!",
      data: publicCustomer(customer),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/auth/me
const me = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    if (!customer) return next(createHttpError(404, "Customer not found"));
    res.status(200).json({ success: true, data: publicCustomer(customer) });
  } catch (error) {
    next(error);
  }
};

// POST /api/customer/auth/logout
const logout = async (req, res, next) => {
  try {
    res.clearCookie("customerToken", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ success: true, message: "Logged out!" });
  } catch (error) {
    next(error);
  }
};

// GET /api/customer/auth/orders — the logged-in customer's own orders (by phone).
const myOrders = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    if (!customer) return next(createHttpError(404, "Customer not found"));
    const orders = await Order.find({ "customerDetails.phone": customer.phone })
      .sort({ createdAt: -1 })
      .populate("table");
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// POST /api/customer/auth/orders — a logged-in customer places their own order.
// Server computes the bill from the submitted items so the client can't set
// arbitrary totals (GST = 2.5% CGST + 2.5% SGST, matching the staff flow).
const placeMyOrder = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    if (!customer) return next(createHttpError(404, "Customer not found"));

    const { items, guests, orderType } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return next(createHttpError(400, "Your order has no items."));
    }

    // Normalise items and compute totals server-side.
    const cleanItems = items.map((it) => {
      const quantity = Math.max(1, Number(it.quantity) || 1);
      const pricePerQuantity = Number(it.pricePerQuantity ?? it.price) || 0;
      return {
        id: it.id,
        name: String(it.name),
        pricePerQuantity,
        quantity,
        price: pricePerQuantity * quantity,
        notes: it.notes || "",
        station: it.station || "",
      };
    });
    const bills = Order.computeBills(cleanItems, 0);

    const order = new Order({
      customerDetails: {
        name: customer.name,
        phone: customer.phone,
        guests: Number(guests) || 1,
      },
      orderStatus: "In Progress",
      bills,
      items: cleanItems,
      paymentMethod: "Online", // guest self-orders settle online; cash = at counter
      orderType: orderType || "Pickup",
      placedBy: "customer",
    });
    await order.save();
    await Customer.upsertFromOrder(order);

    res.status(201).json({ success: true, message: "Order placed!", data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, me, logout, myOrders, placeMyOrder };
