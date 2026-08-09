const express = require("express");
const {
  addCategory,
  getCategories,
  deleteCategory,
  addDish,
  getMenu,
  getDishes,
  updateDish,
  deleteDish,
} = require("../controllers/menuController");
const { isVerifiedUser, restrictTo } = require("../middlewares/tokenVerification");

const router = express.Router();

// Full grouped menu (categories with their dishes) — used by the POS menu screen.
router.route("/").get(isVerifiedUser, getMenu);

// Categories
router.route("/category").get(isVerifiedUser, getCategories);
router.route("/category").post(isVerifiedUser, restrictTo("Admin"), addCategory);
router
  .route("/category/:id")
  .delete(isVerifiedUser, restrictTo("Admin"), deleteCategory);

// Dishes
router.route("/dish").get(isVerifiedUser, getDishes);
router.route("/dish").post(isVerifiedUser, restrictTo("Admin"), addDish);
router.route("/dish/:id").put(isVerifiedUser, restrictTo("Admin"), updateDish);
router.route("/dish/:id").delete(isVerifiedUser, restrictTo("Admin"), deleteDish);

module.exports = router;
