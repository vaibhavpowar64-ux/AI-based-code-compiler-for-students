import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CreateTask from "./pages/admin/CreateTask";
import { AuthContext } from "./context/AuthContext";

import Challenges from "./pages/Challenges";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import ClassroomManager from "./pages/ClassroomManager";
import SpeedTest from "./pages/SpeedTest";

import AdminChallenges from "./pages/admin/AdminChallenges";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const HomeRedirect = () => {
  const { user } = useContext(AuthContext);
  return user?.role === "professor" || user?.role === "admin" || user?.role === "staff" ? <Navigate to="/admin" /> : <Dashboard />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/challenges" element={<ProtectedRoute><AdminChallenges /></ProtectedRoute>} />
      <Route path="/admin/challenges/new" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
      <Route path="/admin/classrooms" element={<ProtectedRoute><Navigate to="/classrooms" replace /></ProtectedRoute>} />

      {/* Shared Features */}
      <Route path="/classrooms" element={<ProtectedRoute><ClassroomManager /></ProtectedRoute>} />

      {/* New Feature Routes */}
      <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/speedtest" element={<ProtectedRoute><SpeedTest /></ProtectedRoute>} />
    </Routes>
  );
};

export default App;
