const express = require("express");
const {
    createClassroom,
    joinClassroom,
    getClassrooms,
    deleteClassroom,
    removeStudent,
    regenerateJoinCode,
    getClassroomAnalytics
} = require("../controllers/classroomController");
const { protect, isProfessor } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, isProfessor, createClassroom); // Only admins/teachers/professors can create
router.post("/join", protect, joinClassroom); // Students use code to join
router.get("/", protect, getClassrooms); // Both can view their respective lists
router.delete("/:id", protect, isProfessor, deleteClassroom);
router.delete("/:id/students/:studentId", protect, isProfessor, removeStudent);
router.patch("/:id/join-code", protect, isProfessor, regenerateJoinCode);
router.get("/:id/analytics", protect, isProfessor, getClassroomAnalytics);

module.exports = router;
