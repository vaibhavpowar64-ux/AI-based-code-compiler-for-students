import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/api';
import { Save, Plus, Trash2, ArrowLeft, Clock } from 'lucide-react';

const CreateTask = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        language: 'python',
        starterCode: '',
        xpReward: 10,
        isTimeTrial: false,
        timeLimitSeconds: 0
    });

    const [testCases, setTestCases] = useState([
        { input: '', expectedOutput: '', isHidden: false }
    ]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTestCaseChange = (index, field, value) => {
        const updated = [...testCases];
        updated[index][field] = value;
        setTestCases(updated);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }]);
    };

    const removeTestCase = (index) => {
        setTestCases(testCases.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                testCases: testCases.filter(tc => tc.expectedOutput.trim() !== "") // filter out incomplete test cases
            };

            await API.post('/challenges', payload);
            alert("Challenge created successfully!");
            navigate('/admin/challenges'); // assume there's a list view or just go back to admin
        } catch (error) {
            console.error("Failed to create challenge", error);
            alert("Failed to create challenge: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-col min-h-screen" style={{ overflowY: "auto" }}>
            <header className="flex items-center p-6 border-b border-gray-800" style={{ background: "var(--glass-bg)", backdropFilter: "blur(10px)" }}>
                <button onClick={() => navigate('/admin')} className="text-muted hover:text-white mr-4 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-white">Create New Challenge Task</h1>
            </header>

            <main className="p-8 max-w-5xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Basic Info */}
                    <div className="glass-panel p-6 border border-gray-800">
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Basic Information</h2>

                        <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Challenge Title</label>
                                <input type="text" name="title" required value={formData.title} onChange={handleChange}
                                    className="w-full bg-black bg-opacity-50 border border-gray-700 rounded p-2 text-white"
                                    placeholder="e.g. Two Sum" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                                    <select name="difficulty" value={formData.difficulty} onChange={handleChange}
                                        className="w-full bg-black bg-opacity-50 border border-gray-700 rounded p-2 text-white">
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Language</label>
                                    <select name="language" value={formData.language} onChange={handleChange}
                                        className="w-full bg-black bg-opacity-50 border border-gray-700 rounded p-2 text-white">
                                        <option value="python">Python</option>
                                        <option value="javascript">JavaScript</option>
                                        <option value="java">Java</option>
                                        <option value="cpp">C++</option>
                                        <option value="c">C</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">XP Reward</label>
                                    <input type="number" name="xpReward" required value={formData.xpReward} onChange={handleChange}
                                        className="w-full bg-black bg-opacity-50 border border-gray-700 rounded p-2 text-white" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Description (Markdown Supported)</label>
                            <textarea name="description" required value={formData.description} onChange={handleChange} rows="5"
                                className="w-full bg-black bg-opacity-50 border border-gray-700 rounded p-2 text-white font-mono text-sm"
                                placeholder="Describe the problem, input format, output format, and constraints..."></textarea>
                        </div>
                    </div>

                    {/* Code & Gamification */}
                    <div className="glass-panel p-6 border border-gray-800">
                        <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Code & Mechanics</h2>

                        <div className="mb-6">
                            <label className="block text-sm text-gray-400 mb-1">Starter Code (Optional)</label>
                            <textarea name="starterCode" value={formData.starterCode} onChange={handleChange} rows="4"
                                className="w-full bg-black bg-opacity-50 border border-gray-700 rounded p-4 text-white font-mono text-sm"
                                placeholder="def solve():\n    pass"></textarea>
                        </div>

                        <div className="p-4 rounded border border-yellow-500 border-opacity-30 bg-yellow-500 bg-opacity-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock className="text-yellow-400" />
                                <div>
                                    <h3 className="text-white font-semibold">Enable Time Trial Mode</h3>
                                    <p className="text-xs text-muted">Adds a countdown timer for students</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                                    <input type="checkbox" name="isTimeTrial" checked={formData.isTimeTrial} onChange={handleChange} className="w-4 h-4" />
                                    Time Trial Active
                                </label>
                                {formData.isTimeTrial && (
                                    <div className="flex items-center gap-2">
                                        <input type="number" name="timeLimitSeconds" value={formData.timeLimitSeconds} onChange={handleChange}
                                            className="w-24 bg-black border border-gray-700 rounded p-1 text-white text-center" placeholder="Seconds" />
                                        <span className="text-sm text-gray-400">Seconds</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Test Cases */}
                    <div className="glass-panel p-6 border border-gray-800">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                            <h2 className="text-xl font-bold text-white">Unit Test Cases (I/O Validation)</h2>
                            <button type="button" onClick={addTestCase} className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center gap-1 transition-colors">
                                <Plus size={16} /> Add Case
                            </button>
                        </div>

                        <div className="space-y-4">
                            {testCases.map((tc, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded border border-gray-700 bg-black bg-opacity-30 relative group">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">STDIN Input (Optional)</label>
                                        <textarea value={tc.input} onChange={(e) => handleTestCaseChange(idx, 'input', e.target.value)} rows="2"
                                            className="w-full bg-black border border-gray-800 rounded p-2 text-white font-mono text-sm"
                                            placeholder="1 2 3\n4 5 6"></textarea>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-green-400 mb-1 uppercase tracking-wider font-semibold">Expected STDOUT</label>
                                        <textarea value={tc.expectedOutput} onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)} rows="2" required
                                            className="w-full bg-black border border-green-900 border-opacity-50 rounded p-2 text-white font-mono text-sm"
                                            placeholder="7 7 9"></textarea>
                                    </div>
                                    <div className="flex flex-col justify-between pt-6">
                                        <label className="flex flex-col items-center gap-1 cursor-pointer" title="Hide case from student">
                                            <input type="checkbox" checked={tc.isHidden} onChange={(e) => handleTestCaseChange(idx, 'isHidden', e.target.checked)} className="w-4 h-4" />
                                            <span className="text-[10px] text-gray-500 uppercase font-bold">Hidden</span>
                                        </label>
                                        <button type="button" onClick={() => removeTestCase(idx)} className="text-red-500 opacity-50 hover:opacity-100 p-1" title="Delete case">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {testCases.length === 0 && <p className="text-center text-muted italic my-4">No test cases. Submissions will only be visually verified via their own code execution.</p>}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 pb-12">
                        <button type="submit" disabled={loading} className="btn-primary py-3 px-8 text-lg font-bold flex items-center gap-3">
                            <Save size={20} />
                            {loading ? "Creating..." : "Publish Challenge Task"}
                        </button>
                    </div>

                </form>
            </main>
        </div>
    );
};

export default CreateTask;
