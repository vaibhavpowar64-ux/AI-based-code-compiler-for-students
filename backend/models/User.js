const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["student", "admin", "staff", "professor"],
        default: "student",
    },
    xp: {
        type: Number,
        default: 0,
    },
    badges: [{
        name: String,
        earnedAt: { type: Date, default: Date.now }
    }],
    solvedChallenges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge"
    }],
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Classroom"
    }],
    portfolioSnippets: [{
        title: String,
        description: String,
        code: String,
        language: String,
        isPublic: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
    }],
    wpmStats: [{
        wpm: Number,
        accuracy: Number,
        language: String,
        date: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
