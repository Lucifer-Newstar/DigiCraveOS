const express = require("express");
const { getLiveness, getReadiness, getProcessMetrics } = require("../controllers/healthController");
const { isVerifiedUser, restrictTo } = require("../middlewares/tokenVerification");

const router = express.Router();
router.get("/live", getLiveness);
router.get("/ready", getReadiness);
router.get("/metrics", isVerifiedUser, restrictTo("Admin"), getProcessMetrics);
module.exports = router;
