const mongoose = require("mongoose");

const ClassroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
    },
    joinCode: {
        type: String,
        required: true,
        unique: true,
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    activeChallenges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge"
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Classroom", ClassroomSchema);
