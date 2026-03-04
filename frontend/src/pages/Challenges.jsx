import React, { useState, useEffect } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Code, Clock, Shield } from "lucide-react";

const Challenges = () => {
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const res = await API.get("/challenges");
                setChallenges(res.data);
            } catch (error) {
                console.error("Failed to fetch challenges:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, []);

    const getDifficultyColor = (diff) => {
        switch (diff) {
            case "Easy": return "text-success border-success bg-success";
            case "Medium": return "text-yellow-500 border-yellow-500 bg-yellow-500";
            case "Hard": return "text-error border-error bg-error";
            default: return "text-primary border-primary bg-primary";
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full min-h-screen text-muted">Loading Challenges...</div>;
    }

    return (
        <div className="flex-col w-full h-full p-8 animate-fade-in min-h-screen" style={{ overflowY: "auto" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Trophy size={32} className="text-yellow-400" />
                            Coding Challenges
                        </h2>
                        <div className="text-muted mt-2 text-lg">Master your algorithmic skills to earn XP and unique badges.</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {challenges.length > 0 ? challenges.map((challenge) => (
                        <div key={challenge._id} className="glass-panel p-6 flex flex-col justify-between border border-gray-800 bg-black bg-opacity-20 hover:bg-opacity-40 hover:border-gray-700" style={{ transition: "all 0.3s ease", cursor: "pointer" }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div>
                                <div className="flex justify-between items-start mb-5">
                                    <h3 className="text-xl font-bold text-white tracking-wide">{challenge.title}</h3>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-opacity-10 border ${getDifficultyColor(challenge.difficulty)}`}>
                                        {challenge.difficulty}
                                    </span>
                                </div>
                                <p className="text-muted text-sm mb-6 leading-relaxed" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                    {challenge.description}
                                </p>
                            </div>
                            <div className="mt-auto pt-5 border-t border-gray-800 flex justify-between items-center">
                                <div className="flex gap-4 text-sm font-medium">
                                    <span className="flex items-center gap-1 text-blue-300 bg-blue-500 bg-opacity-10 px-2 py-1 rounded-md"><Code size={16} /> {challenge.language}</span>
                                    <span className="flex items-center gap-1 text-yellow-400 bg-yellow-500 bg-opacity-10 px-2 py-1 rounded-md"><Trophy size={16} /> {challenge.xpReward} XP</span>
                                </div>
                                <button onClick={() => navigate("/", { state: { challenge } })} className="btn-primary py-2 px-5 text-sm font-bold tracking-wide">Attempt</button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center p-16 glass-panel text-muted border border-gray-800 border-dashed">
                            <Code size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg">No challenges available yet. Check back later!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Challenges;
