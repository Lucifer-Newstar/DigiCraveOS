const express = require("express");
const { isVerifiedUser, restrictTo } = require("../middlewares/tokenVerification");
const { getFinanceReport } = require("../controllers/reportController");
const router = express.Router();
router.get("/finance", isVerifiedUser, restrictTo("Admin"), getFinanceReport);
module.exports = router;
