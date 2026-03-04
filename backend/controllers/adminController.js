const Submission = require("../models/Submission");
const User = require("../models/User");

const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "student" });
        const totalSubmissions = await Submission.countDocuments();

        const successfulSubmissions = await Submission.countDocuments({ status: "Success" });
        const errorSubmissions = totalSubmissions - successfulSubmissions;

        // Aggregate common errors
        const errorPatterns = await Submission.aggregate([
            { $match: { status: "Error", "errorAnalysis.explanation": { $exists: true } } },
            { $group: { _id: "$errorAnalysis.explanation", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // recent submissions
        const recentSubmissions = await Submission.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            totalUsers,
            totalSubmissions,
            successfulSubmissions,
            errorSubmissions,
            commonErrors: errorPatterns,
            recentSubmissions
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin stats", error: error.message });
    }
};

const { checkSimilarity } = require("../services/similarityService");

const checkSubmissionSimilarity = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const result = await checkSimilarity(submissionId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error running similarity check", error: error.message });
    }
};

module.exports = { getAdminStats, checkSubmissionSimilarity };
