const express = require("express");
const { getCustomers } = require("../controllers/customerController");
const { getCustomerIntelligence } = require("../controllers/customerIntelligenceController");
const { isVerifiedUser, restrictTo } = require("../middlewares/tokenVerification");
const router = express.Router();

router.route("/").get(isVerifiedUser, restrictTo("Admin"), getCustomers);
router.route("/intelligence").get(isVerifiedUser, restrictTo("Admin"), getCustomerIntelligence);

module.exports = router;
