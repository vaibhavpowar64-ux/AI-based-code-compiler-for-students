import React, { useState, useEffect, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { Users, Plus, Key, BookOpen, Trash2, RefreshCw, X, BarChart2, CheckCircle2, AlertTriangle, FileCode2, Trophy } from "lucide-react";

const ClassroomManager = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [newClassData, setNewClassData] = useState({ name: "", description: "" });
    const [joinCode, setJoinCode] = useState("");

    // Analytics State
    const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
    const [selectedClassroomDetails, setSelectedClassroomDetails] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            setLoading(true);
            const res = await API.get("/classrooms");
            setClassrooms(res.data);
        } catch (error) {
            console.error("Failed to fetch classrooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            await API.post("/classrooms", newClassData);
            setShowCreateForm(false);
            setNewClassData({ name: "", description: "" });
            fetchClassrooms(); // Refresh list
        } catch (error) {
            console.error("Failed to create classroom:", error);
            alert("Failed to create classroom");
        }
    };

    const handleJoinClass = async (e) => {
        e.preventDefault();
        try {
            await API.post("/classrooms/join", { joinCode });
            setShowJoinForm(false);
            setJoinCode("");
            fetchClassrooms(); // Refresh list
        } catch (error) {
            console.error("Failed to join classroom:", error);
            alert(error.response?.data?.message || "Failed to join classroom. Check code.");
        }
    };

    const handleDeleteClassroom = async (classroomId) => {
        if (!window.confirm("Are you sure you want to delete this class? This cannot be undone.")) return;
        try {
            await API.delete(`/classrooms/${classroomId}`);
            fetchClassrooms();
        } catch (error) {
            console.error("Failed to delete classroom:", error);
            alert("Failed to delete classroom");
        }
    };

    const handleRemoveStudent = async (classroomId, studentId) => {
        if (!window.confirm("Are you sure you want to remove this student?")) return;
        try {
            await API.delete(`/classrooms/${classroomId}/students/${studentId}`);
            fetchClassrooms();
        } catch (error) {
            console.error("Failed to remove student:", error);
            alert("Failed to remove student");
        }
    };

    const handleRegenerateCode = async (classroomId) => {
        if (!window.confirm("Generate a new join code? The old code will no longer work.")) return;
        try {
            await API.patch(`/classrooms/${classroomId}/join-code`);
            fetchClassrooms();
        } catch (error) {
            console.error("Failed to regenerate join code:", error);
            alert("Failed to regenerate join code");
        }
    };

    const handleViewAnalytics = async (classroom) => {
        setSelectedClassroomDetails(classroom);
        setAnalyticsModalOpen(true);
        setLoadingAnalytics(true);
        try {
            const res = await API.get(`/classrooms/${classroom._id}/analytics`);
            setAnalyticsData(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
            alert("Failed to fetch analytics data");
            setAnalyticsModalOpen(false);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen text-muted">Loading Classrooms...</div>;

    return (
        <div className="flex-col w-full h-full p-8 animate-fade-in min-h-screen" style={{ overflowY: "auto", maxWidth: "1200px", margin: "0 auto" }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BookOpen size={32} className="text-blue-400" />
                        Classroom Management
                    </h2>
                    <p className="text-muted mt-2">
                        {user?.role === "professor" || user?.role === "admin"
                            ? "Create cohorts and monitor student progress."
                            : "Join classrooms and collaborate."}
                    </p>
                </div>
                {(user?.role === "professor" || user?.role === "admin") ? (
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="btn-primary flex items-center gap-2 px-4 py-2"
                    >
                        <Plus size={18} /> {showCreateForm ? "Cancel" : "New Classroom"}
                    </button>
                ) : (
                    <button
                        onClick={() => setShowJoinForm(!showJoinForm)}
                        className="btn-primary flex items-center gap-2 px-4 py-2"
                    >
                        <Plus size={18} /> {showJoinForm ? "Cancel" : "Join Classroom"}
                    </button>
                )}
            </div>

            {showJoinForm && (
                <div className="glass-panel p-6 mb-8 border border-green-500 border-opacity-30">
                    <h3 className="text-xl font-bold text-white mb-4">Join a Classroom</h3>
                    <form onSubmit={handleJoinClass} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-400 mb-1">Join Code</label>
                            <input
                                type="text"
                                required
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                className="w-full bg-black bg-opacity-50 border border-gray-700 rounded p-2 text-white font-mono uppercase tracking-widest"
                                placeholder="e.g., A1B2C3"
                            />
                        </div>
                        <button type="submit" className="btn-primary py-2 px-6 bg-green-600 hover:bg-green-500 font-bold tracking-wide">Join</button>
                    </form>
                </div>
            )}

            {showCreateForm && (
                <div className="glass-panel p-6 mb-8 border border-blue-500 border-opacity-30">
                    <h3 className="text-xl font-bold text-white mb-4">Create New Cohort</h3>
                    <form onSubmit={handleCreateClass} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-400 mb-1">Classroom Name</label>
                            <input
                                type="text"
                                required
                                value={newClassData.name}
                                onChange={(e) => setNewClassData({ ...newClassData, name: e.target.value })}
                                className="w-full bg-black bg-opacity-50 border border-gray-700 rounded p-2 text-white"
                                placeholder="e.g., Spring 2026 Intro to Algorithms"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm text-gray-400 mb-1">Description</label>
                            <input
                                type="text"
                                value={newClassData.description}
                                onChange={(e) => setNewClassData({ ...newClassData, description: e.target.value })}
                                className="w-full bg-black bg-opacity-50 border border-gray-700 rounded p-2 text-white"
                                placeholder="Optional description..."
                            />
                        </div>
                        <button type="submit" className="btn-primary py-2 px-6 bg-blue-600 hover:bg-blue-500">Create</button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classrooms.length > 0 ? classrooms.map((cls) => (
                    <div key={cls._id} className="glass-panel p-6 flex flex-col justify-between hover:border-gray-600 transition-colors">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-white">{cls.name}</h3>
                                {(user?.role === "professor" || user?.role === "admin" || user?.role === "staff") && (
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-900 bg-opacity-40 text-blue-300 px-3 py-1 rounded flex items-center gap-2 font-mono text-sm border border-blue-800">
                                            <Key size={14} /> Code: {cls.joinCode}
                                        </div>
                                        <button
                                            onClick={() => handleRegenerateCode(cls._id)}
                                            className="text-gray-400 hover:text-white p-1 rounded hover:bg-white hover:bg-opacity-10 transition-colors"
                                            title="Regenerate Join Code"
                                        >
                                            <RefreshCw size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-muted text-sm mb-6">{cls.description}</p>

                            <div className="flex items-center gap-2 text-gray-300 font-medium mb-4 pb-4 border-b border-gray-800">
                                <Users size={18} className="text-purple-400" />
                                {cls.students.length} Enrolled Student{cls.students.length !== 1 ? 's' : ''}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {cls.students.slice(0, 3).map((student, i) => (
                                <div key={i} className="flex justify-between items-center bg-black bg-opacity-20 p-2 rounded group">
                                    <span className="text-gray-300">{student.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-yellow-400 font-mono text-xs">{student.xp} XP</span>
                                        {(user?.role === "professor" || user?.role === "admin" || user?.role === "staff") && (
                                            <button
                                                onClick={() => handleRemoveStudent(cls._id, student._id)}
                                                className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300 p-1"
                                                title={`Remove ${student.name}`}
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {cls.students.length > 3 && (
                                <div className="text-xs text-center text-muted mt-2">
                                    + {cls.students.length - 3} more students
                                </div>
                            )}
                            {cls.students.length === 0 && (
                                <div className="text-sm text-center text-gray-500 italic py-2">
                                    Share the join code to add students.
                                </div>
                            )}
                        </div>

                        {(user?.role === "professor" || user?.role === "admin" || user?.role === "staff") && (
                            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end gap-3">
                                <button
                                    onClick={() => handleViewAnalytics(cls)}
                                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 rounded hover:bg-blue-900 hover:bg-opacity-20 border border-transparent hover:border-blue-900"
                                >
                                    <BarChart2 size={16} /> View Analytics
                                </button>
                                <button
                                    onClick={() => handleDeleteClassroom(cls._id)}
                                    className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-1 rounded hover:bg-red-900 hover:bg-opacity-20 border border-transparent hover:border-red-900"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="col-span-full text-center p-12 glass-panel text-muted border border-dashed border-gray-700">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl text-white mb-2">No Classrooms Found</h3>
                        <p>You haven't created any cohorts yet. Click 'New Classroom' to get started.</p>
                    </div>
                )}
            </div>

            {/* Analytics Modal */}
            {analyticsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm animate-fade-in">
                    <div className="glass-panel w-full max-w-5xl max-h-[90vh] flex flex-col" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-800">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <BarChart2 size={24} className="text-blue-400" />
                                    Analytics: {selectedClassroomDetails?.name}
                                </h2>
                                <p className="text-muted text-sm mt-1">{selectedClassroomDetails?.description}</p>
                            </div>
                            <button onClick={() => setAnalyticsModalOpen(false)} className="text-gray-400 hover:text-white p-2 rounded hover:bg-white hover:bg-opacity-10 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto" style={{ flex: 1 }}>
                            {loadingAnalytics || !analyticsData ? (
                                <div className="flex flex-col items-center justify-center p-12 text-muted">
                                    <RefreshCw size={32} className="animate-spin mb-4 text-blue-400" />
                                    <p>Gathering classroom intelligence...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Aggregates Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className="p-4 rounded border border-purple-500 border-opacity-30 bg-purple-900 bg-opacity-10 flex flex-col items-center justify-center">
                                            <Users size={24} className="text-purple-400 mb-2" />
                                            <h4 className="text-2xl font-bold text-white">{analyticsData.aggregate.totalStudents}</h4>
                                            <span className="text-xs text-muted uppercase tracking-wider mt-1">Students Enrolled</span>
                                        </div>
                                        <div className="p-4 rounded border border-blue-500 border-opacity-30 bg-blue-900 bg-opacity-10 flex flex-col items-center justify-center">
                                            <FileCode2 size={24} className="text-blue-400 mb-2" />
                                            <h4 className="text-2xl font-bold text-white">{analyticsData.aggregate.totalExecutions}</h4>
                                            <span className="text-xs text-muted uppercase tracking-wider mt-1">Total Executions</span>
                                        </div>
                                        <div className="p-4 rounded border border-success border-opacity-30 bg-green-900 bg-opacity-10 flex flex-col items-center justify-center" style={{ borderColor: 'var(--success)' }}>
                                            <CheckCircle2 size={24} className="text-success mb-2" />
                                            <h4 className="text-2xl font-bold text-white">
                                                {analyticsData.aggregate.totalExecutions > 0
                                                    ? Math.round((analyticsData.aggregate.successfulExecutions / analyticsData.aggregate.totalExecutions) * 100)
                                                    : 0}%
                                            </h4>
                                            <span className="text-xs text-muted uppercase tracking-wider mt-1">Avg Success Rate</span>
                                        </div>
                                        <div className="p-4 rounded border border-yellow-500 border-opacity-30 bg-yellow-900 bg-opacity-10 flex flex-col items-center justify-center">
                                            <Trophy size={24} className="text-yellow-400 mb-2" />
                                            <h4 className="text-2xl font-bold text-white">{analyticsData.aggregate.averageCodeQuality} / 10</h4>
                                            <span className="text-xs text-muted uppercase tracking-wider mt-1">Avg Code Quality</span>
                                        </div>
                                    </div>

                                    {/* Student Breakdown Table */}
                                    <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Student Performance Breakdown</h3>

                                    {analyticsData.studentBreakdown.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-gray-800 text-sm font-semibold tracking-wide text-gray-400 uppercase">
                                                        <th className="py-3 px-4">Student</th>
                                                        <th className="py-3 px-4 text-center">Executions</th>
                                                        <th className="py-3 px-4 text-center">Success Rate</th>
                                                        <th className="py-3 px-4 text-center">Avg Score</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm divide-y divide-gray-800">
                                                    {analyticsData.studentBreakdown.map((student) => (
                                                        <tr key={student.id} className="hover:bg-white hover:bg-opacity-5 transition-colors">
                                                            <td className="py-3 px-4">
                                                                <div className="font-medium text-white">{student.name}</div>
                                                                <div className="text-xs text-muted">{student.email}</div>
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-mono">
                                                                {student.totalSubmissions}
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span className={`px-2 py-1 rounded text-xs font-bold ${student.successRate >= 80 ? 'bg-success bg-opacity-20 text-success' :
                                                                        student.successRate >= 50 ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' :
                                                                            student.totalSubmissions === 0 ? 'bg-gray-800 text-gray-400' : 'bg-error bg-opacity-20 text-error'
                                                                    }`}>
                                                                    {student.successRate}%
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <span className={`font-mono font-bold ${student.averageScore >= 8 ? 'text-success' :
                                                                        student.averageScore >= 5 ? 'text-yellow-500' :
                                                                            student.totalSubmissions === 0 ? 'text-gray-600' : 'text-error'
                                                                    }`}>
                                                                    {student.averageScore}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 text-muted border border-dashed border-gray-800 rounded">
                                            No students found in this classroom.
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassroomManager;
