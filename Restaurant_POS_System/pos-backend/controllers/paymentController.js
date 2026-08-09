const Razorpay = require("razorpay");
const config = require("../config/config");
const crypto = require("crypto");
const createHttpError = require("http-errors");
const Payment = require("../models/paymentModel");

const createOrder = async (req, res, next) => {
  const razorpay = new Razorpay({
    key_id: config.razorpayKeyId,
    key_secret: config.razorpaySecretKey,
  });

  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100, // Amount in paisa (1 INR = 100 paisa)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount, // optional: rupee amount, if the client sends it
    } = req.body;

    if (!config.razorpaySecretKey) {
      return next(
        createHttpError(
          503,
          "Payment gateway not configured (RAZORPAY_KEY_SECRET missing)."
        )
      );
    }
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return next(createHttpError(400, "Missing payment verification fields."));
    }

    // HMAC-SHA256 signature verification (matches UML U11 sequence).
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpaySecretKey)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return next(createHttpError(400, "Payment verification failed!"));
    }

    // Persist a Payment record on successful verification. This is the
    // "insert Payment doc" step shown in the U11 sequence diagram — it now
    // happens in the main verify flow, not only via the async webhook.
    let payment = null;
    try {
      payment = await Payment.findOneAndUpdate(
        { paymentId: razorpay_payment_id },
        {
          $set: {
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            amount: amount ? Number(amount) : undefined,
            currency: "INR",
            status: "captured",
            method: "Online",
            createdAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (e) {
      // A missing payment record must not fail an otherwise-valid payment.
      console.log(`⚠️  Payment persist skipped: ${e.message}`);
    }

    res.json({
      success: true,
      message: "Payment verified successfully!",
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

const webHookVerification = async (req, res, next) => {
  try {
    const secret = config.razorpayWebhookSecret;
    const signature = req.headers["x-razorpay-signature"];

    const body = JSON.stringify(req.body);

    // 🛑 Verify the signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature === signature) {
      console.log("✅ Webhook verified:", req.body);

      // ✅ Process payment (e.g., update DB, send confirmation email)
      if (req.body.event === "payment.captured") {
        const payment = req.body.payload.payment.entity;
        console.log(`💰 Payment Captured: ${payment.amount / 100} INR`);

        // Add Payment Details in Database
        const newPayment = new Payment({
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          email: payment.email,
          contact: payment.contact,
          createdAt: new Date(payment.created_at * 1000) 
        })

        await newPayment.save();
      }

      res.json({ success: true });
    } else {
      const error = createHttpError(400, "❌ Invalid Signature!");
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, verifyPayment, webHookVerification };
