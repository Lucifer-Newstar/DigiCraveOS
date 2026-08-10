const express = require("express");
const {
  addOrder,
  getOrders,
  getOrderById,
  updateOrder,
  getMetrics,
  getPopularDishes,
  getPayments,
  holdOrder,
  resumeOrder,
  splitOrder,
  mergeOrders,
} = require("../controllers/orderController");
const { isVerifiedUser, restrictTo } = require("../middlewares/tokenVerification");
const router = express.Router();

// Static routes must be declared before the dynamic "/:id" route,
// otherwise "metrics"/"popular"/"merge" get matched as an order id.
router.route("/metrics").get(isVerifiedUser, getMetrics);
router.route("/popular").get(isVerifiedUser, getPopularDishes);
router.route("/payments").get(isVerifiedUser, getPayments);
router.route("/merge").post(isVerifiedUser, mergeOrders);

router.route("/").post(isVerifiedUser, addOrder);
router.route("/").get(isVerifiedUser, getOrders);

// Bill/lifecycle operations on a specific order (UML U03 methods).
router.route("/:id/hold").post(isVerifiedUser, holdOrder);
router.route("/:id/resume").post(isVerifiedUser, resumeOrder);
router.route("/:id/split").get(isVerifiedUser, splitOrder);

router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, updateOrder);

module.exports = router;
