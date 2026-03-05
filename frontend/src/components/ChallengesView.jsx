import React, { useState, useEffect } from "react";
import API from "../api/api";
import { Trophy, Code, Clock, Shield, Search, Filter } from "lucide-react";

const ChallengesView = ({ onSelectChallenge }) => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDifficulty, setFilterDifficulty] = useState("All");

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const res = await API.get("/challenges");
                setChallenges(res.data);
            } catch (error) {
                console.error("Failed to fetch challenges:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, []);

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case "Easy": return "text-green-400 border-green-500/30 bg-green-500/10";
            case "Medium": return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
            case "Hard": return "text-red-400 border-red-500/30 bg-red-500/10";
            default: return "text-primary border-primary/30 bg-primary/10";
        }
    };

    const filteredChallenges = challenges.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = filterDifficulty === "All" || c.difficulty === filterDifficulty;
        return matchesSearch && matchesDifficulty;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted animate-pulse">
                <Trophy size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Scanning for challenges...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
                <Shield size={48} className="mb-4 text-error opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">Sync Error</h3>
                <p className="text-muted max-w-md mb-6">We couldn't retrieve the latest challenges from the core engine.</p>
                <div className="p-3 bg-red-900/10 border border-red-900/30 rounded text-xs px-4 mb-6 font-mono text-error">{error}</div>
                <button onClick={() => window.location.reload()} className="btn-primary py-2 px-8">Retry Sync</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-fade-in overflow-hidden p-6" style={{ background: "rgba(0,0,0,0.2)" }}>
            <div className="flex justify-between items-end mb-8 gap-4 flex-wrap">
                <div className="flex-1 min-w-[300px]">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        <Trophy size={24} className="text-yellow-400" />
                        Available Challenges
                    </h2>
                    <p className="text-muted text-sm capitalize">Staff-curated problems to test your algorithmic prowess.</p>
                </div>

                <div className="flex gap-3">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Search challenges..."
                            className="bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary outline-none transition-all w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-primary outline-none transition-all"
                        value={filterDifficulty}
                        onChange={(e) => setFilterDifficulty(e.target.value)}
                    >
                        <option value="All">All Levels</option>
                        <option value="Easy">Beginner</option>
                        <option value="Medium">Intermediate</option>
                        <option value="Hard">Advanced</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-8 custom-scrollbar">
                {filteredChallenges.length > 0 ? filteredChallenges.map((challenge) => (
                    <div
                        key={challenge._id}
                        className="glass-panel p-6 flex flex-col justify-between border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Code size={64} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter border ${getDifficultyColor(challenge.difficulty)}`}>
                                    {challenge.difficulty}
                                </span>
                                <div className="flex items-center gap-1 text-yellow-400/80 text-xs font-bold">
                                    <Trophy size={14} /> {challenge.xpReward} XP
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">{challenge.title}</h3>
                            <p className="text-muted text-xs leading-relaxed mb-6 line-clamp-3">
                                {challenge.description}
                            </p>
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                            <span className="text-[10px] uppercase font-mono tracking-widest text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20 flex items-center gap-1">
                                <Code size={12} /> {challenge.language}
                            </span>
                            <button
                                onClick={() => onSelectChallenge(challenge)}
                                className="px-4 py-1.5 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/80 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                            >
                                Attempt Mission
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-20 glass-panel border-dashed border-white/10">
                        <Search size={48} className="text-muted mb-4 opacity-20" />
                        <p className="text-lg text-muted">No tactical puzzles found matching your criteria.</p>
                        <button onClick={() => { setSearchTerm(""); setFilterDifficulty("All"); }} className="mt-4 text-primary text-sm hover:underline">Clear all scanners</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChallengesView;
