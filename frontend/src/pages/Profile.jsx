import React, { useState, useEffect, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { User, Medal, BookOpen, Code, Calendar } from "lucide-react";

const Profile = () => {
    const { user: authUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!authUser?._id) return;
            try {
                const res = await API.get(`/users/${authUser._id}/profile`);
                setProfile(res.data);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [authUser]);

    if (loading) return <div className="flex items-center justify-center min-h-screen text-muted">Loading Profile...</div>;
    if (!profile) return <div className="flex items-center justify-center min-h-screen text-error">Profile not found.</div>;

    return (
        <div className="flex-col w-full h-full p-8 animate-fade-in min-h-screen" style={{ overflowY: "auto" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
                {/* Header section */}
                <div className="glass-panel p-10 mb-8 flex flex-col md:flex-row items-center justify-between border border-gray-800 shadow-xl" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)" }}>
                    <div className="flex items-center gap-8 mb-6 md:mb-0">
                        <div className="w-28 h-28 rounded-full bg-primary bg-opacity-20 border-2 border-primary flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                            <User size={56} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-2 tracking-wide">{profile.name}</h2>
                            <p className="text-muted flex items-center gap-3 mb-4 text-lg">
                                {profile.email}
                                <span className="bg-white bg-opacity-10 px-3 py-1 rounded-md text-sm font-mono tracking-widest text-primary border border-gray-700">
                                    STUDENT PASS
                                </span>
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium tracking-wide">
                                <Calendar size={16} /> Joined {new Date(profile.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-10 text-center flex-wrap justify-center mt-6 md:mt-0">
                        <div className="p-4 bg-black bg-opacity-20 rounded-xl border border-gray-800 flex-1 min-w-[120px]">
                            <div className="text-5xl font-bold text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)] font-mono">{profile.xp || 0}</div>
                            <div className="text-muted text-sm font-bold uppercase tracking-widest mt-2">Total XP</div>
                        </div>
                        <div className="p-4 bg-black bg-opacity-20 rounded-xl border border-gray-800 flex-1 min-w-[120px]">
                            <div className="text-5xl font-bold text-white font-mono drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">{profile.solvedChallenges?.length || 0}</div>
                            <div className="text-muted text-sm font-bold uppercase tracking-widest mt-2">Problems Solved</div>
                        </div>
                        <div className="p-4 bg-black bg-opacity-20 rounded-xl border border-green-900 border-opacity-50 flex-1 min-w-[120px]">
                            <div className="text-5xl font-bold text-green-400 font-mono drop-shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                                {profile.wpmStats && profile.wpmStats.length > 0
                                    ? Math.max(...profile.wpmStats.map(s => s.wpm))
                                    : 0}
                            </div>
                            <div className="text-muted text-sm font-bold uppercase tracking-widest mt-2">Top WPM</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Badges Section */}
                    <div className="glass-panel p-8 col-span-1 border border-gray-800 h-fit">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-gray-800 pb-4">
                            <Medal size={22} className="text-primary" /> Earned Badges
                        </h3>
                        <div className="flex flex-col gap-4">
                            {profile.badges && profile.badges.length > 0 ? profile.badges.map((badge, i) => (
                                <div key={i} className="bg-black bg-opacity-20 border border-gray-700 rounded-xl p-4 flex items-center gap-4 transition-transform hover:scale-105 cursor-default">
                                    <div className="p-3 bg-yellow-500 bg-opacity-10 rounded-full border border-yellow-500 border-opacity-30">
                                        <Medal size={28} className="text-yellow-500" />
                                    </div>
                                    <div className="text-sm font-bold text-gray-200 tracking-wide">{badge.name}</div>
                                </div>
                            )) : (
                                <div className="text-muted text-sm w-full text-center py-10 opacity-60 border border-dashed border-gray-800 rounded-lg">No badges earned yet.<br />Solve challenges to earn them!</div>
                            )}
                        </div>
                    </div>

                    {/* Portfolio Section */}
                    <div className="glass-panel p-8 col-span-1 lg:col-span-2 border border-gray-800">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <BookOpen size={22} className="text-green-400" /> Public Portfolio
                            </h3>
                            <button className="btn-primary py-2 px-4 text-sm flex items-center gap-2 tracking-wide shadow-lg">
                                <Code size={16} /> Add Snippet
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            {profile.portfolioSnippets && profile.portfolioSnippets.length > 0 ? profile.portfolioSnippets.map((snippet, i) => (
                                <div key={i} className="border border-gray-800 rounded-xl p-6 bg-black bg-opacity-20 hover:bg-opacity-40 hover:border-gray-600 transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-xl text-white tracking-wide group-hover:text-primary transition-colors">{snippet.title}</h4>
                                        <span className="text-xs font-mono px-3 py-1 rounded bg-blue-500 bg-opacity-10 text-blue-300 border border-blue-500 border-opacity-30">{snippet.language}</span>
                                    </div>
                                    <p className="text-muted text-md mb-4 leading-relaxed">{snippet.description}</p>
                                    <pre className="text-sm font-mono text-gray-400 p-4 bg-black bg-opacity-50 rounded-lg overflow-hidden border border-gray-900" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                                        {snippet.code}
                                    </pre>
                                </div>
                            )) : (
                                <div className="text-center py-16 text-muted border border-dashed border-gray-700 rounded-xl bg-black bg-opacity-10">
                                    <Code size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="text-lg">Your portfolio is currently empty.</p>
                                    <p className="text-sm mt-2 opacity-70">Publish snippets from your editor to show off your skills.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
