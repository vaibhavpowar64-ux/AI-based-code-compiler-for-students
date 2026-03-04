import React, { useState, useEffect, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { Users, FileCode2, ShieldAlert, CheckCircle2, AlertTriangle, LogOut, Activity, BookOpen, Trophy } from "lucide-react";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // wait for effect to run

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const res = await API.get("/admin/stats");
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminStats();
    }, []);

    if (user?.role !== "admin" && user?.role !== "professor") {
        return <Navigate to="/" />;
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-muted bg-gray-900">Loading System Analytics...</div>;
    }

    if (!stats) {
        return <div className="flex items-center justify-center min-h-screen text-error bg-gray-900">Access Denied or Failed to Load Data</div>;
    }

    const { totalUsers, totalSubmissions, successfulSubmissions, errorSubmissions, commonErrors, recentSubmissions } = stats;

    // Run similarity check
    const runSimilarityCheck = async (submissionId) => {
        try {
            const res = await API.get(`/admin/similarity/${submissionId}`);
            const data = res.data;
            if (data.matches && data.matches.length > 0) {
                alert(`Found ${data.matches.length} similar submissions. Top match is ${data.matches[0].similarityPercentage}% similar from ${data.matches[0].userName}.`);
                console.log(data);
            } else {
                alert('No high-similarity matches found.');
            }
        } catch (error) {
            console.error("Failed to run similarity check", error);
            alert("Failed to run similarity check.");
        }
    };

    return (
        <div className="flex-col min-h-screen" style={{ overflow: "hidden" }}>
            {/* Navbar */}
            <header
                className="flex items-center"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem 2rem",
                    borderBottom: "1px solid var(--glass-border)",
                    background: "var(--glass-bg)",
                    backdropFilter: "blur(10px)",
                    gap: "2rem"
                }}
            >
                {/* Left Side: Brand */}
                <h2 className="text-primary font-bold" style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0, fontSize: "1.25rem", whiteSpace: "nowrap" }}>
                    <ShieldAlert size={20} /> Orbit Code Staff Center
                </h2>

                {/* Right Side: Links and Logout */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", paddingRight: "1.5rem", borderRight: "1px solid var(--glass-border)" }}>
                        <button className="text-muted hover:text-white transition-colors text-sm font-medium"
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer" }}
                            onClick={() => window.location.href = '/admin/challenges'}>
                            <Trophy size={16} className="text-yellow-400" /> Manage Challenges
                        </button>
                        <button className="text-muted hover:text-white transition-colors text-sm font-medium"
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer" }}
                            onClick={() => window.location.href = '/admin/classrooms'}>
                            <BookOpen size={16} className="text-blue-400" /> Manage Classrooms
                        </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span className="text-muted" style={{ whiteSpace: "nowrap" }}><strong className="text-white">Staff:</strong> {user?.name}</span>
                        <button
                            onClick={logout}
                            className="btn-primary"
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", background: "rgba(239, 68, 68, 0.2)", color: "var(--error)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "6px", cursor: "pointer" }}
                        >
                            <LogOut size={16} /> Logout System
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-col w-full h-full p-6 animate-fade-in" style={{ height: "calc(100vh - 70px)", overflowY: "auto" }}>
                <h2 className="text-2xl font-bold mb-6 text-white text-opacity-90">Global System Telemetry</h2>

                {/* Top Metrics Cards */}
                <div className="grid grid-cols-4 gap-4 mb-8" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
                    <div className="glass-panel p-6 flex flex-col items-center justify-center border border-primary border-opacity-30">
                        <Users size={32} className="text-primary mb-2" />
                        <h3 className="text-3xl font-bold text-white">{totalUsers}</h3>
                        <p className="text-muted text-sm mt-1">Registered Students</p>
                    </div>
                    <div className="glass-panel p-6 flex flex-col items-center justify-center border border-blue-500 border-opacity-30">
                        <FileCode2 size={32} className="text-blue-400 mb-2" />
                        <h3 className="text-3xl font-bold text-white">{totalSubmissions}</h3>
                        <p className="text-muted text-sm mt-1">Total Network Executions</p>
                    </div>
                    <div className="glass-panel p-6 flex flex-col items-center justify-center border border-success border-opacity-30">
                        <CheckCircle2 size={32} className="text-success mb-2" />
                        <h3 className="text-3xl font-bold text-white">{successfulSubmissions}</h3>
                        <p className="text-muted text-sm mt-1">Global Successes</p>
                    </div>
                    <div className="glass-panel p-6 flex flex-col items-center justify-center border border-error border-opacity-30">
                        <AlertTriangle size={32} className="text-error mb-2" />
                        <h3 className="text-3xl font-bold text-white">{errorSubmissions}</h3>
                        <p className="text-muted text-sm mt-1">Global Failures</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

                    {/* Common AI Errors Breakdown */}
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-4 flex items-center gap-2 text-error text-opacity-90">
                            <ShieldAlert size={20} /> Most Frequent Student Errors
                        </h3>
                        <div className="flex flex-col gap-3">
                            {commonErrors.length > 0 ? commonErrors.map((err, idx) => (
                                <div key={idx} className="flex justify-between items-start p-3 rounded" style={{ background: "rgba(239, 68, 68, 0.05)", borderLeft: "3px solid var(--error)" }}>
                                    <span className="text-sm pr-4 text-white text-opacity-80">{err._id}</span>
                                    <span className="bg-error bg-opacity-20 text-error px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">{err.count} times</span>
                                </div>
                            )) : <p className="text-muted text-sm">No significant error patterns detected.</p>}
                        </div>
                    </div>

                    {/* Live Student Feed */}
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-4 flex items-center gap-2 text-blue-400 text-opacity-90">
                            <Activity size={20} /> Live Execution Feed
                        </h3>
                        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-2" style={{ maxHeight: "400px" }}>
                            {recentSubmissions.length > 0 ? recentSubmissions.map(sub => (
                                <div key={sub._id} className="flex flex-col p-3 rounded border border-gray-800" style={{ background: "rgba(0,0,0,0.3)" }}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-white">{sub.user.name}</span>
                                            <span className="text-xs text-muted">({sub.user.email})</span>
                                        </div>
                                        <span className="text-xs text-muted">{new Date(sub.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="capitalize text-xs font-mono bg-gray-800 px-2 py-1 rounded mr-2">{sub.language}</span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${sub.status === "Success" ? "bg-success bg-opacity-20 text-success" : "bg-error bg-opacity-20 text-error"}`}>
                                                {sub.status}
                                            </span>
                                        </div>
                                        {sub.status === "Success" && (
                                            <button onClick={() => runSimilarityCheck(sub._id)} className="text-xs text-blue-400 hover:text-blue-300">
                                                Run Similarity Check
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) : <p className="text-muted text-sm">No recent executions in the network.</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
