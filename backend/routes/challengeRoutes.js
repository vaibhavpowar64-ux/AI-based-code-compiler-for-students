const express = require("express");
const { getChallenges, getChallengeById, createChallenge, deleteChallenge } = require("../controllers/challengeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getChallenges);
router.get("/:id", protect, getChallengeById);
router.post("/", protect, createChallenge);
router.delete("/:id", protect, deleteChallenge);

module.exports = router;
