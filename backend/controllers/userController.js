const User = require("../models/User");

// @desc    Get top users by XP for leaderboard
// @route   GET /api/users/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find({ role: "student" })
            .select("name xp badges solvedChallenges")
            .sort({ xp: -1 })
            .limit(10);

        res.json(topUsers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching leaderboard", error: error.message });
    }
};

// @desc    Get user profile data including portfolio
// @route   GET /api/users/:id/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password -role")
            .populate("solvedChallenges", "title difficulty xpReward");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user profile", error: error.message });
    }
};

// @desc    Save WPM stat
// @route   POST /api/users/wpm
// @access  Private
const saveWpmStat = async (req, res) => {
    try {
        const { wpm, accuracy, language } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.wpmStats.push({ wpm, accuracy, language });
        await user.save();

        res.status(201).json({ message: "WPM stat saved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error saving WPM stat", error: error.message });
    }
};

// @desc    Save code snippet
// @route   POST /api/users/snippets
// @access  Private
const saveSnippet = async (req, res) => {
    try {
        const { title, description, code, language, isPublic } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.portfolioSnippets.push({ title, description, code, language, isPublic });
        await user.save();

        res.status(201).json({ message: "Snippet saved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error saving snippet", error: error.message });
    }
};

module.exports = {
    getLeaderboard,
    getUserProfile,
    saveWpmStat,
    saveSnippet
};
