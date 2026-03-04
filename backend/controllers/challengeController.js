const Challenge = require("../models/Challenge");
const Submission = require("../models/Submission");
const User = require("../models/User");

// @desc    Get all challenges
// @route   GET /api/challenges
// @access  Private
const getChallenges = async (req, res) => {
    try {
        // Find all challenges, omitting testCases for users (prevent cheating)
        const challenges = await Challenge.find().select("-testCases");
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: "Error fetching challenges", error: error.message });
    }
};

// @desc    Get single challenge by ID
// @route   GET /api/challenges/:id
// @access  Private
const getChallengeById = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id).select("-testCases.expectedOutput");

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }
        res.json(challenge);
    } catch (error) {
        res.status(500).json({ message: "Error fetching challenge", error: error.message });
    }
};

// @desc    Create a new challenge
// @route   POST /api/challenges
// @access  Private (Staff/Admin)
const createChallenge = async (req, res) => {
    try {
        const { title, description, difficulty, language, starterCode, testCases, xpReward, isTimeTrial, timeLimitSeconds } = req.body;

        const challenge = new Challenge({
            title,
            description,
            difficulty,
            language,
            starterCode,
            testCases,
            xpReward,
            isTimeTrial,
            timeLimitSeconds,
            createdBy: req.user._id
        });

        const createdChallenge = await challenge.save();
        res.status(201).json(createdChallenge);
    } catch (error) {
        res.status(500).json({ message: "Error creating challenge", error: error.message });
    }
};

// @desc    Delete a challenge
// @route   DELETE /api/challenges/:id
// @access  Private (Staff/Admin)
const deleteChallenge = async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id);

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        await challenge.deleteOne();
        res.json({ message: "Challenge removed" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting challenge", error: error.message });
    }
};

module.exports = {
    getChallenges,
    getChallengeById,
    createChallenge,
    deleteChallenge,
};
