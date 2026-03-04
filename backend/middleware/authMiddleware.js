const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "staff" || req.user.role === "professor")) {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as an admin or staff" });
    }
};

const isProfessor = (req, res, next) => {
    if (req.user && (req.user.role === "professor" || req.user.role === "admin" || req.user.role === "staff")) {
        next();
    } else {
        res.status(401).json({ message: "Not authorized as a professor or staff" });
    }
};

const isStudentOrProfessor = (req, res, next) => {
    if (req.user && (req.user.role === "student" || req.user.role === "professor" || req.user.role === "admin" || req.user.role === "staff")) {
        next();
    } else {
        res.status(401).json({ message: "Not authorized. Role must be student, professor, or staff." });
    }
};

module.exports = { protect, admin, isProfessor, isStudentOrProfessor };
