const express = require("express");
const { getLiveness, getReadiness } = require("../controllers/healthController");

const router = express.Router();
router.get("/live", getLiveness);
router.get("/ready", getReadiness);
module.exports = router;
