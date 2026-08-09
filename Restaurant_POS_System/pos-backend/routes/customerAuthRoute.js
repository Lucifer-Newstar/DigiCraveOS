const express = require("express");
const {
  register,
  login,
  me,
  logout,
  myOrders,
  placeMyOrder,
} = require("../controllers/customerAuthController");
const { getMenu } = require("../controllers/menuController");
const { isVerifiedCustomer } = require("../middlewares/tokenVerification");

const router = express.Router();

// Guest (Customer) authentication + self-service, separate from staff auth.
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/me").get(isVerifiedCustomer, me);

// Guest-facing menu (read-only, no auth needed to browse).
router.route("/menu").get(getMenu);

// A logged-in guest's own orders.
router.route("/orders").get(isVerifiedCustomer, myOrders);
router.route("/orders").post(isVerifiedCustomer, placeMyOrder);

module.exports = router;
