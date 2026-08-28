require("dotenv").config();

const config = {
    port: Number(process.env.PORT || 3000),
    databaseURI: process.env.MONGODB_URI || "mongodb://localhost:27017/pos-db",
    nodeEnv : process.env.NODE_ENV || "development",
    accessTokenSecret: process.env.JWT_SECRET,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    razorpaySecretKey: process.env.RAZORPAY_KEY_SECRET,
    razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
};
Object.freeze(config);

const validateConfig = (values = config) => {
    const errors = [];
    if (!Number.isInteger(values.port) || values.port < 1 || values.port > 65535) errors.push("PORT must be an integer from 1 to 65535.");
    if (!values.databaseURI) errors.push("MONGODB_URI is required.");
    if (values.nodeEnv === "production" && (!values.accessTokenSecret || values.accessTokenSecret.length < 32)) errors.push("JWT_SECRET must contain at least 32 characters in production.");
    return errors;
};

module.exports = Object.freeze({ ...config, validateConfig });
