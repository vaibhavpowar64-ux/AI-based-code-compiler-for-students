require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const userRoutes = require("./routes/userRoutes");
const classroomRoutes = require("./routes/classroomRoutes");

const http = require("http");
const setupSocket = require("./socket");

const app = express();
const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get("/", (req, res) => {
  res.send("Student-Centric Code Execution API is running.");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classrooms", classroomRoutes);

// Start Server Immediately (Required for Render Port Binding)
server.listen(PORT, () => {
  console.log(`Server and WebSockets are running on port ${PORT}`);
});

// Database Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is missing!");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Don't exit the process so Render doesn't kill the container, 
    // but operations will fail until fixed.
  }
};

connectDB();
