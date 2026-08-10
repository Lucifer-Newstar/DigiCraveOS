const express = require("express");
const {
  health,
  forecast,
  demand,
  popular,
  recommend,
} = require("../controllers/mlController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

// All ML endpoints require an authenticated user (same as the rest of the API).
// They proxy to the Python ML microservice (Restaurant_POS_ML).
router.route("/health").get(isVerifiedUser, health);
router.route("/forecast").get(isVerifiedUser, forecast);
router.route("/demand").get(isVerifiedUser, demand);
router.route("/popular").get(isVerifiedUser, popular);
router.route("/recommend").post(isVerifiedUser, recommend);

module.exports = router;
