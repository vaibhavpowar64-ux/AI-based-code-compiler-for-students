import React, { useState, useEffect } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { Activity, Code, AlertCircle, CheckCircle2, TerminalSquare } from "lucide-react";

const AnalyticsView = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await API.get("/submissions/analytics");
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center w-full h-full text-muted">Loading Analytics...</div>;
    }

    if (!stats) {
        return <div className="flex items-center justify-center w-full h-full text-error">Failed to load analytics data.</div>;
    }

    const { totalSubmissions, successfulSubmissions, errorSubmissions, languageStats, recentActivity } = stats;
    const successRate = totalSubmissions > 0 ? Math.round((successfulSubmissions / totalSubmissions) * 100) : 0;

    return (
        <div className="flex-col w-full h-full p-8 animate-fade-in" style={{ overflowY: "auto", maxWidth: "1200px", margin: "0 auto" }}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Activity size={32} className="text-primary" />
                        Progress Dashboard
                    </h2>
                    <p className="text-muted mt-2">Track your coding execution statistics over time.</p>
                </div>
            </div>

            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="glass-panel p-6 flex flex-col justify-center border-t-4 border-t-primary" style={{ transition: "transform 0.2s", cursor: "default" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-muted text-sm font-medium uppercase tracking-wider">Total Runs</p>
                        <TerminalSquare size={20} className="text-primary opacity-80" />
                    </div>
                    <h3 className="text-4xl font-bold text-white">{totalSubmissions}</h3>
                </div>

                <div className="glass-panel p-6 flex flex-col justify-center border-t-4 border-t-green-500" style={{ transition: "transform 0.2s", cursor: "default" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-muted text-sm font-medium uppercase tracking-wider">Successful</p>
                        <CheckCircle2 size={20} className="text-success opacity-80" />
                    </div>
                    <h3 className="text-4xl font-bold text-white">{successfulSubmissions}</h3>
                </div>

                <div className="glass-panel p-6 flex flex-col justify-center border-t-4 border-t-red-500" style={{ transition: "transform 0.2s", cursor: "default" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-muted text-sm font-medium uppercase tracking-wider">Errors</p>
                        <AlertCircle size={20} className="text-error opacity-80" />
                    </div>
                    <h3 className="text-4xl font-bold text-white">{errorSubmissions}</h3>
                </div>

                <div className="glass-panel p-6 flex flex-col justify-center border-t-4 border-t-blue-400" style={{ transition: "transform 0.2s", cursor: "default" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-muted text-sm font-medium uppercase tracking-wider">Success Rate</p>
                        <Activity size={20} className="text-blue-400 opacity-80" />
                    </div>
                    <h3 className="text-4xl font-bold text-white">{successRate}%</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Language Breakdown */}
                <div className="glass-panel p-6 lg:col-span-1 border border-gray-800">
                    <h3 className="text-lg font-semibold border-b border-gray-800 pb-3 mb-4 flex items-center gap-2 text-white">
                        <Code size={18} className="text-primary" /> Languages Used
                    </h3>
                    <div className="flex flex-col gap-3">
                        {languageStats.length > 0 ? languageStats.map(lang => (
                            <div key={lang._id} className="flex justify-between items-center p-3 rounded-lg border border-gray-800 bg-black bg-opacity-20 hover:bg-opacity-40 transition-colors">
                                <span className="capitalize font-medium text-gray-200">{lang._id}</span>
                                <span className="bg-primary bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide">{lang.count} runs</span>
                            </div>
                        )) : <p className="text-muted text-sm italic">No languages used yet.</p>}
                    </div>
                </div>

                {/* Submissions History */}
                <div className="glass-panel p-6 lg:col-span-2 border border-gray-800">
                    <h3 className="text-lg font-semibold border-b border-gray-800 pb-3 mb-4 flex items-center gap-2 text-white">
                        <Activity size={18} className="text-primary" /> Recent Execution History
                    </h3>
                    <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentActivity.length > 0 ? recentActivity.map(session => (
                            <div key={session._id} className="flex flex-col md:flex-row md:justify-between p-4 rounded-lg border border-gray-800 bg-black bg-opacity-20 hover:bg-opacity-40 transition-all group">
                                <div className="flex items-center gap-4 mb-2 md:mb-0">
                                    <div className={`p-2 rounded-full ${session.status === "Success" ? "bg-success bg-opacity-20" : "bg-error bg-opacity-20"}`}>
                                        {session.status === "Success" ? <CheckCircle2 size={18} className="text-success" /> : <AlertCircle size={18} className="text-error" />}
                                    </div>
                                    <span className="capitalize text-sm font-semibold tracking-wide text-gray-200">{session.language}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium">
                                    <span className={`px-2 py-1 rounded-md bg-opacity-20 ${session.status === "Success" ? "bg-success text-success" : "bg-error text-error"}`}>
                                        {session.status}
                                    </span>
                                    <span className="text-muted group-hover:text-gray-300 transition-colors">{new Date(session.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        )) : <p className="text-muted text-sm italic">No recent activity found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
