const express = require("express");
const { submitCode, getMySubmissions, getStudentAnalytics } = require("../controllers/submissionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/execute", protect, submitCode);
router.get("/history", protect, getMySubmissions);
router.get("/analytics", protect, getStudentAnalytics);

module.exports = router;