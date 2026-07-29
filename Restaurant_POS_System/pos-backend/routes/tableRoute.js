const express = require("express");
const { addTable, getTables, updateTable } = require("../controllers/tableController");
const router = express.Router();
const { isVerifiedUser, restrictTo } = require("../middlewares/tokenVerification")

router.route("/").post(isVerifiedUser , restrictTo("Admin"), addTable);
router.route("/").get(isVerifiedUser , getTables);
router.route("/:id").put(isVerifiedUser , updateTable);

module.exports = router;