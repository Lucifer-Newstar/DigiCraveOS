const express = require("express");
const {
  addOrder,
  getOrders,
  getOrderById,
  updateOrder,
  getMetrics,
  getPopularDishes,
  getPayments,
} = require("../controllers/orderController");
const { isVerifiedUser, restrictTo } = require("../middlewares/tokenVerification");
const router = express.Router();

// Static routes must be declared before the dynamic "/:id" route,
// otherwise "metrics"/"popular" get matched as an order id.
router.route("/metrics").get(isVerifiedUser, getMetrics);
router.route("/popular").get(isVerifiedUser, getPopularDishes);
router.route("/payments").get(isVerifiedUser, getPayments);

router.route("/").post(isVerifiedUser, addOrder);
router.route("/").get(isVerifiedUser, getOrders);
router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, updateOrder);

module.exports = router;
