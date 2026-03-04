const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
        enum: ["python", "c", "cpp", "java", "javascript"],
    },
    status: {
        type: String,
        enum: ["Success", "Error"],
        required: true,
    },
    output: {
        type: String, // Can store success output or simplified error msg
    },
    rawError: {
        type: String, // Original compiler/runtime error for admin tracking
    },
    errorAnalysis: {
        // Structured data about the error if applicable
        explanation: String,
        suggestedAction: String,
        lineNumber: Number,
    },
    timeComplexity: String,
    spaceComplexity: String,
    optimizationSuggestion: String,
    securityVulnerabilities: String,
    codeQualityScore: Number,
    edgeCases: String,
    alternativeApproach: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Submission", SubmissionSchema);
