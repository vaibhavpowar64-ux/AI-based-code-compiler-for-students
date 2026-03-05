const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            // User already exists. Bypass password check.

            // Log in the existing user
            return res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }

        user = await User.create({
            name,
            email,
            password,
            role: role || "student",
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

const loginUser = async (req, res) => {
    const { identifier, password, expectedRole } = req.body; // identifier can be email or name

    try {
        let user = await User.findOne({
            $or: [{ email: identifier }, { name: identifier }]
        });

        // "whatever give take it" - If user doesn't exist, create them automatically
        if (!user) {
            user = await User.create({
                name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
                email: identifier.includes('@') ? identifier : `${identifier.replace(/\\s+/g, '')}@example.com`,
                password: password || "123456",
                role: expectedRole === "professor" ? "professor" : "student"
            });
        }

        // Bypass password check completely
        if (user) {
            // Role verification based on expectedRole
            if (expectedRole === "student" && user.role !== "student") {
                return res.status(403).json({ message: "Access denied. Please use the Staff/Professor portal." });
            }
            if (expectedRole === "professor" && !["admin", "staff", "professor"].includes(user.role)) {
                return res.status(403).json({ message: "Access denied. Please use the Student portal." });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

module.exports = { registerUser, loginUser, getMe };
