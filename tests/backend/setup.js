/**
 * Jest global setup for API integration tests.
 *
 * Connects to an isolated TEST database on the running MongoDB instance
 * (never the dev/prod DB) and drops it afterwards. Critically, it uses the
 * SAME mongoose instance the backend uses (resolved from the backend's
 * node_modules), otherwise models would be bound to a different, unconnected
 * mongoose and every query would time out.
 */
const path = require("path");

const BACKEND = path.resolve(
  __dirname,
  "../../Restaurant_POS_System/pos-backend"
);
// Resolve mongoose from the backend so models & the connection share one instance.
const mongoose = require(require.resolve("mongoose", { paths: [BACKEND] }));

const TEST_URI =
  process.env.TEST_MONGODB_URI || "mongodb://localhost:27017/pos-db-test";

// These must be set before the app/config is required by any test file.
process.env.MONGODB_URI = TEST_URI;
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
process.env.RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "test_secret_local";
process.env.NODE_ENV = "test";

beforeAll(async () => {
  await mongoose.connect(TEST_URI);
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});
