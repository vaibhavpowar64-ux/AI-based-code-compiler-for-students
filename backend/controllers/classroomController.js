const Classroom = require("../models/Classroom");
const User = require("../models/User");
const Submission = require("../models/Submission");

// @desc    Create a new classroom
// @route   POST /api/classrooms
// @access  Private (Admin only)
const createClassroom = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Generate a random 6 character join code
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const classroom = await Classroom.create({
            name,
            description,
            joinCode,
            teacher: req.user._id
        });

        res.status(201).json(classroom);
    } catch (error) {
        res.status(500).json({ message: "Failed to create classroom", error: error.message });
    }
};

// @desc    Join a classroom using a code
// @route   POST /api/classrooms/join
// @access  Private (Students)
const joinClassroom = async (req, res) => {
    try {
        const { joinCode } = req.body;
        const classroom = await Classroom.findOne({ joinCode: joinCode.toUpperCase() });

        if (!classroom) {
            return res.status(404).json({ message: "Invalid join code." });
        }

        // Add student to classroom if not already in it
        if (!classroom.students.includes(req.user._id)) {
            classroom.students.push(req.user._id);
            await classroom.save();
        }

        // Add classroom to student's classes array
        const user = await User.findById(req.user._id);
        if (!user.classes.includes(classroom._id)) {
            user.classes.push(classroom._id);
            await user.save();
        }

        res.status(200).json({ message: `Successfully joined ${classroom.name}`, classroom });
    } catch (error) {
        res.status(500).json({ message: "Failed to join classroom", error: error.message });
    }
};

// @desc    Get all classrooms for the logged in user (teacher or student)
// @route   GET /api/classrooms
// @access  Private
const getClassrooms = async (req, res) => {
    try {
        let classrooms;
        if (req.user.role === "admin" || req.user.role === "professor") {
            // Teacher sees their own created classes
            classrooms = await Classroom.find({ teacher: req.user._id })
                .populate("students", "name email xp solvedChallenges")
                .populate("activeChallenges", "title difficulty");
        } else {
            // Student sees classes they have joined
            classrooms = await Classroom.find({ students: req.user._id })
                .populate("teacher", "name")
                .populate("activeChallenges", "title difficulty xpReward");
        }
        res.status(200).json(classrooms);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch classrooms", error: error.message });
    }
};

// @desc    Delete a classroom
// @route   DELETE /api/classrooms/:id
// @access  Private (Admin/Professor only - Creator)
const deleteClassroom = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        // Ensure only the creator can delete
        if (classroom.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to delete this classroom" });
        }

        // Remove this classroom from all students' classes array
        await User.updateMany(
            { _id: { $in: classroom.students } },
            { $pull: { classes: classroom._id } }
        );

        await Classroom.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Classroom deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete classroom", error: error.message });
    }
};

// @desc    Remove a student from a classroom
// @route   DELETE /api/classrooms/:id/students/:studentId
// @access  Private (Admin/Professor only - Creator)
const removeStudent = async (req, res) => {
    try {
        const { id, studentId } = req.params;
        const classroom = await Classroom.findById(id);

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        // Ensure only the creator can remove students
        if (classroom.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to modify this classroom" });
        }

        // Remove student from classroom array
        classroom.students = classroom.students.filter(
            (student) => student.toString() !== studentId
        );
        await classroom.save();

        // Remove classroom from student's classes array
        await User.findByIdAndUpdate(studentId, {
            $pull: { classes: id }
        });

        res.status(200).json({ message: "Student removed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to remove student", error: error.message });
    }
};

// @desc    Regenerate join code for a classroom
// @route   PATCH /api/classrooms/:id/join-code
// @access  Private (Admin/Professor only - Creator)
const regenerateJoinCode = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        // Ensure only the creator can regenerate code
        if (classroom.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to modify this classroom" });
        }

        // Generate a new random 6 character join code
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        classroom.joinCode = joinCode;
        await classroom.save();

        res.status(200).json({ message: "Join code regenerated successfully", joinCode });
    } catch (error) {
        res.status(500).json({ message: "Failed to regenerate join code", error: error.message });
    }
};

// @desc    Get analytics for a specific classroom
// @route   GET /api/classrooms/:id/analytics
// @access  Private (Admin/Professor only - Creator)
const getClassroomAnalytics = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id).populate('students', 'name email _id');

        if (!classroom) {
            return res.status(404).json({ message: "Classroom not found" });
        }

        // Ensure only the creator or admin can view analytics
        if (classroom.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to view analytics for this classroom" });
        }

        const studentIds = classroom.students.map(s => s._id);

        // Fetch all submissions for these students
        const submissions = await Submission.find({ user: { $in: studentIds } });

        // Calculate aggregates
        let totalExecutions = submissions.length;
        let successfulExecutions = 0;
        let totalScore = 0;
        let scoreCount = 0;

        // Per-student breakdown
        const studentStatsMap = {};
        classroom.students.forEach(student => {
            studentStatsMap[student._id] = {
                id: student._id,
                name: student.name,
                email: student.email,
                totalSubmissions: 0,
                successfulSubmissions: 0,
                totalScore: 0,
                scoreCount: 0,
                averageScore: 0
            };
        });

        submissions.forEach(sub => {
            const studentStat = studentStatsMap[sub.user];
            if (studentStat) {
                studentStat.totalSubmissions++;
                if (sub.status === "Success") {
                    successfulExecutions++;
                    studentStat.successfulSubmissions++;
                }

                // If there's AI analysis with a score
                if (sub.analysis && typeof sub.analysis.codeQualityScore === 'number') {
                    totalScore += sub.analysis.codeQualityScore;
                    scoreCount++;
                    studentStat.totalScore += sub.analysis.codeQualityScore;
                    studentStat.scoreCount++;
                }
            }
        });

        // Finalize averages
        const averageCodeQuality = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : 0;

        const studentBreakdown = Object.values(studentStatsMap).map(stat => ({
            ...stat,
            averageScore: stat.scoreCount > 0 ? (stat.totalScore / stat.scoreCount).toFixed(1) : 0,
            successRate: stat.totalSubmissions > 0 ? Math.round((stat.successfulSubmissions / stat.totalSubmissions) * 100) : 0
        }));

        res.status(200).json({
            aggregate: {
                totalExecutions,
                successfulExecutions,
                errorExecutions: totalExecutions - successfulExecutions,
                averageCodeQuality,
                totalStudents: classroom.students.length
            },
            studentBreakdown
        });

    } catch (error) {
        console.error("Error fetching classroom analytics:", error);
        res.status(500).json({ message: "Failed to fetch classroom analytics", error: error.message });
    }
};

module.exports = {
    createClassroom,
    joinClassroom,
    getClassrooms,
    deleteClassroom,
    removeStudent,
    regenerateJoinCode,
    getClassroomAnalytics
};
