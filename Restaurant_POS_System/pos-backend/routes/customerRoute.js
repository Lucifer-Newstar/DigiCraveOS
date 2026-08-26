const express = require("express");
const { getCustomers } = require("../controllers/customerController");
const { getCustomerIntelligence, getRetentionRecommendations, getCampaignDrafts } = require("../controllers/customerIntelligenceController");
const { getCustomerCohorts } = require("../controllers/customerCohortController");
const { getLoyaltyOpportunities } = require("../controllers/loyaltyOpportunityController");
const { isVerifiedUser, restrictTo } = require("../middlewares/tokenVerification");
const router = express.Router();

router.route("/").get(isVerifiedUser, restrictTo("Admin"), getCustomers);
router.route("/intelligence").get(isVerifiedUser, restrictTo("Admin"), getCustomerIntelligence);
router.route("/cohorts").get(isVerifiedUser, restrictTo("Admin"), getCustomerCohorts);
router.route("/retention").get(isVerifiedUser, restrictTo("Admin"), getRetentionRecommendations);
router.route("/loyalty-opportunities").get(isVerifiedUser, restrictTo("Admin"), getLoyaltyOpportunities);
router.route("/campaign-drafts").get(isVerifiedUser, restrictTo("Admin"), getCampaignDrafts);

module.exports = router;
