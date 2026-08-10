const express = require("express");
const { getCustomers } = require("../controllers/customerController");
const { isVerifiedUser, restrictTo } = require("../middlewares/tokenVerification");
const router = express.Router();

router.route("/").get(isVerifiedUser, restrictTo("Admin"), getCustomers);

module.exports = router;
