import React, { useState, useEffect } from "react";
import API from "../api/api";
import { Trophy, Medal, Award, User } from "lucide-react";

const Leaderboard = () => {
    const [leaders, setLeaders] = [null, () => { }]; // Placeholder for now, build fast

    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await API.get("/users/leaderboard");
                setPlayers(res.data);
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    if (loading) return <div className="flex items-center justify-center min-h-screen text-muted">Loading Rankings...</div>;

    return (
        <div className="flex-col w-full h-full p-8 animate-fade-in min-h-screen" style={{ overflowY: "auto" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-white flex items-center justify-center gap-3 mb-2">
                        <Trophy size={40} className="text-yellow-400" /> Global Leaderboard
                    </h2>
                    <p className="text-muted text-lg">See who is leading the pack in coding supremacy.</p>
                </div>

                <div className="glass-panel overflow-hidden border border-gray-800 shadow-2xl">
                    <div className="grid grid-cols-12 gap-4 p-5 font-bold text-muted border-b border-gray-800 bg-black bg-opacity-40 uppercase tracking-widest text-xs">
                        <div className="col-span-2 text-center">Rank</div>
                        <div className="col-span-6">Student Alias</div>
                        <div className="col-span-2 text-center">Problems Solved</div>
                        <div className="col-span-2 text-right pr-4">Total XP</div>
                    </div>

                    {players.length > 0 ? players.map((player, index) => (
                        <div key={player._id} className="grid grid-cols-12 gap-4 p-5 items-center border-b border-gray-800 bg-black bg-opacity-10 hover:bg-white hover:bg-opacity-5 transition-colors">
                            <div className="col-span-2 flex justify-center">
                                {index === 0 ? <Medal size={32} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" /> :
                                    index === 1 ? <Medal size={32} className="text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]" /> :
                                        index === 2 ? <Medal size={32} className="text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]" /> :
                                            <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>}
                            </div>
                            <div className="col-span-6 flex items-center gap-4 font-bold text-white text-xl tracking-wide">
                                <div className="w-12 h-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-primary border border-primary border-opacity-30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                    {player.name.charAt(0).toUpperCase()}
                                </div>
                                {player.name}
                            </div>
                            <div className="col-span-2 text-center text-gray-300 font-mono text-lg font-medium">
                                {player.solvedChallenges?.length || 0}
                            </div>
                            <div className="col-span-2 text-right pr-4 font-bold text-yellow-400 font-mono text-2xl drop-shadow-md">
                                {player.xp}
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center text-muted border border-dashed border-gray-800 m-4 rounded">No students ranked yet. Start solving challenges!</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
