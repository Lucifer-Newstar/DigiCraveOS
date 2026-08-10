/**
 * Shared test helpers: locate the backend app and authenticate a test admin.
 */
const path = require("path");
const request = require("supertest");

const BACKEND = path.resolve(
  __dirname,
  "../../Restaurant_POS_System/pos-backend"
);

// Import the Express app (does not start a listener under test).
const app = require(path.join(BACKEND, "app.js"));

const ADMIN = {
  name: "Test Admin",
  email: `admin_${Date.now()}@test.com`,
  phone: "9999999999",
  password: "pass1234",
  role: "Admin",
};

// Register (idempotent-ish) + login, returning the auth cookie string.
async function loginAsAdmin(agent = request(app)) {
  await agent.post("/api/user/register").send(ADMIN);
  const res = await agent
    .post("/api/user/login")
    .send({ email: ADMIN.email, password: ADMIN.password });
  const cookie = res.headers["set-cookie"];
  return { cookie, res };
}

module.exports = { app, request, loginAsAdmin, ADMIN, BACKEND };
