const express = require("express");
const { isVerifiedUser, restrictTo } = require("../middlewares/tokenVerification");
const { getFinanceReport } = require("../controllers/reportController");
const { getProfitReport } = require("../controllers/profitController");
const router = express.Router();
router.get("/finance", isVerifiedUser, restrictTo("Admin"), getFinanceReport);
router.get("/profit", isVerifiedUser, restrictTo("Admin"), getProfitReport);
module.exports = router;
