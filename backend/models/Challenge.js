const mongoose = require("mongoose");

const TestCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        required: true,
    },
    expectedOutput: {
        type: String,
        required: true,
    },
    isHidden: {
        type: Boolean,
        default: false,
    }
});

const ChallengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Easy",
    },
    language: {
        type: String,
        required: true,
        default: "python", // primary language if specific, or can be omitted if multi-lang
    },
    starterCode: {
        type: String,
        default: "",
    },
    testCases: [TestCaseSchema],
    xpReward: {
        type: Number,
        default: 10,
    },
    isTimeTrial: {
        type: Boolean,
        default: false,
    },
    timeLimitSeconds: {
        type: Number,
        default: 0,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Challenge", ChallengeSchema);
