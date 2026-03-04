const express = require("express");
const { getAdminStats, checkSubmissionSimilarity } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", protect, admin, getAdminStats);
router.get("/similarity/:submissionId", protect, admin, checkSubmissionSimilarity);

module.exports = router;
