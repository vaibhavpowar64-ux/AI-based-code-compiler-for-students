const express = require("express");
const { getLeaderboard, getUserProfile, saveWpmStat, saveSnippet } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/leaderboard", protect, getLeaderboard);
router.get("/:id/profile", protect, getUserProfile);
router.post("/wpm", protect, saveWpmStat);
router.post("/snippets", protect, saveSnippet);

module.exports = router;
