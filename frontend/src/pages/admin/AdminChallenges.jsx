import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Trash2, ArrowLeft, Trophy, Clock, FileCode2 } from 'lucide-react';

const AdminChallenges = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchChallenges = async () => {
        try {
            const res = await API.get('/challenges');
            setChallenges(res.data);
        } catch (error) {
            console.error("Failed to fetch challenges:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this challenge?")) return;
        try {
            await API.delete(`/challenges/${id}`);
            setChallenges(challenges.filter(c => c._id !== id));
        } catch (error) {
            console.error("Failed to delete challenge:", error);
            alert("Failed to delete challenge.");
        }
    };

    if (user?.role !== "admin" && user?.role !== "professor") {
        navigate('/');
        return null;
    }

    return (
        <div className="flex-col min-h-screen p-8 animate-fade-in" style={{ overflowY: "auto", maxWidth: "1200px", margin: "0 auto" }}>
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/admin')} className="text-muted hover:text-white transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Trophy className="text-yellow-400" /> Manage Challenges
                        </h1>
                        <p className="text-muted text-sm mt-1">Create, edit, and orchestrate the tasks for your students.</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/challenges/new')}
                    className="btn-primary py-2 px-4 flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20"
                >
                    <Plus size={18} /> Create New Challenge
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted">Loading challenges...</div>
            ) : challenges.length === 0 ? (
                <div className="glass-panel p-12 text-center border border-dashed border-gray-700">
                    <FileCode2 size={48} className="mx-auto mb-4 opacity-50 text-gray-400" />
                    <h3 className="text-xl font-bold text-white mb-2">No Challenges Found</h3>
                    <p className="text-muted mb-6">Create your first task to see it listed here.</p>
                    <button onClick={() => navigate('/admin/challenges/new')} className="btn-secondary py-2 px-6">Get Started</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map((challenge) => (
                        <div key={challenge._id} className="glass-panel p-6 border border-gray-800 flex flex-col hover:border-blue-500 hover:border-opacity-50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white tracking-wide">{challenge.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded font-bold uppercase tracking-wider
                                        ${challenge.difficulty === 'Easy' ? 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500/30' :
                                            challenge.difficulty === 'Medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500/30' :
                                                'bg-red-500 bg-opacity-20 text-red-400 border border-red-500/30'}`}>
                                        {challenge.difficulty}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-4">
                                <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300 capitalize font-mono">{challenge.language || 'Multiple'}</span>
                                {challenge.isTimeTrial && (
                                    <span className="text-xs bg-yellow-900 bg-opacity-40 px-2 py-1 rounded text-yellow-500 flex items-center gap-1 border border-yellow-700">
                                        <Clock size={12} /> {challenge.timeLimitSeconds}s
                                    </span>
                                )}
                            </div>

                            <p className="text-muted text-sm flex-1 mb-6 truncate" title={challenge.description}>
                                {challenge.description}
                            </p>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                                <div className="text-xs text-gray-500 font-medium">
                                    Reward: <span className="text-yellow-400 font-bold ml-1">{challenge.xpReward} XP</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDelete(challenge._id)}
                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                        title="Delete Challenge"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminChallenges;
