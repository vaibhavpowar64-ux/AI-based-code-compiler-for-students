const { executeCode } = require("../services/executeService");
const { analyzeCode } = require("../services/errorAnalyzerService");
const Submission = require("../models/Submission");

const submitCode = async (req, res) => {
    const { code, language, challengeId } = req.body;
    const user = req.user._id;

    try {
        const start = Date.now();
        let testCases = [];

        // If a challenge ID is provided, fetch its hidden test cases
        if (challengeId) {
            const Challenge = require("../models/Challenge");
            const challenge = await Challenge.findById(challengeId);
            if (challenge && challenge.testCases) {
                testCases = challenge.testCases;
            }
        }

        let result = await executeCode(code, language, testCases);
        let executionStatus = result.isSuccess === false ? "Error" : "Success"; // Handle test cases response

        if (result.error && result.error.trim() !== "") {
            executionStatus = "Error";
        }

        // Always run analysis to get complexity and optimization
        let analysisPayload = await analyzeCode(code, language, executionStatus === "Error" ? result.error : null);

        const submission = await Submission.create({
            user,
            challenge: challengeId || null,
            code,
            language,
            status: executionStatus,
            output: result.output,
            rawError: result.error || null,
            errorAnalysis: analysisPayload ? {
                explanation: analysisPayload.explanation,
                suggestedAction: analysisPayload.suggestedAction,
                lineNumber: analysisPayload.line === "Unknown" ? null : parseInt(analysisPayload.line) || null
            } : null,
            timeComplexity: analysisPayload ? analysisPayload.timeComplexity : null,
            spaceComplexity: analysisPayload ? analysisPayload.spaceComplexity : null,
            optimizationSuggestion: analysisPayload ? analysisPayload.optimizationSuggestion : null,
            securityVulnerabilities: analysisPayload ? analysisPayload.securityVulnerabilities : null,
            codeQualityScore: analysisPayload ? analysisPayload.codeQualityScore : null,
            edgeCases: analysisPayload ? analysisPayload.edgeCases : null,
            alternativeApproach: analysisPayload ? analysisPayload.alternativeApproach : null
        });

        res.status(200).json({
            submissionId: submission._id,
            status: executionStatus,
            output: result.output,
            rawError: result.error,
            analysis: analysisPayload,
            timeElapsed: Date.now() - start,
            memory: result.memory
        });

    } catch (err) {
        res.status(500).json({ message: "Engine Failure", details: err.error || err.message });
    }
};

const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch submissions" });
    }
};

const getStudentAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;

        const totalSubmissions = await Submission.countDocuments({ user: userId });
        const successfulSubmissions = await Submission.countDocuments({ user: userId, status: "Success" });
        const errorSubmissions = totalSubmissions - successfulSubmissions;

        const languageStats = await Submission.aggregate([
            { $match: { user: userId } },
            { $group: { _id: "$language", count: { $sum: 1 } } }
        ]);

        const recentActivity = await Submission.find({ user: userId })
            .sort({ createdAt: -1 })
            .select('createdAt status language')
            .limit(50);

        res.status(200).json({
            totalSubmissions,
            successfulSubmissions,
            errorSubmissions,
            languageStats,
            recentActivity
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch analytics" });
    }
};

module.exports = { submitCode, getMySubmissions, getStudentAnalytics };
