import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import CodeEditor from "../components/CodeEditor";
import AnalyticsView from "../components/AnalyticsView";
import { Play, LogOut, CheckCircle, AlertTriangle, Code, Activity, Trophy, User as UserIcon, Box, BookOpen, Layout } from "lucide-react";
import ChallengesView from "../components/ChallengesView";

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [code, setCode] = useState('print("Hello, World!")');
    const [language, setLanguage] = useState("python");
    const [output, setOutput] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [analysisDetails, setAnalysisDetails] = useState(null);
    const [activeTab, setActiveTab] = useState("editor");
    const [activeChallengeName, setActiveChallengeName] = useState(null);

    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.challenge) {
            handleSelectChallenge(location.state.challenge);
        }
    }, [location.state]);

    const handleSelectChallenge = (challenge) => {
        setActiveChallengeName(challenge.title);
        setLanguage(challenge.language || "python");
        setCode(challenge.starterCode || `// Starter code for ${challenge.title}\n`);
        setActiveTab("editor");
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        if (lang === "python") setCode('print("Hello, World!")');
        else if (lang === "javascript") setCode('console.log("Hello, World!");');
        else if (lang === "java") setCode('public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}');
        else if (lang === "cpp") setCode('#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}');
        else if (lang === "c") setCode('#include <stdio.h>\n\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}');
    };

    const handleRunCode = async () => {
        setIsExecuting(true);
        setOutput("");
        setAnalysisDetails(null);

        try {
            const response = await API.post("/submissions/execute", {
                code,
                language
            });

            const { status, output, rawError, analysis, timeElapsed, memory } = response.data;

            if (status === "Success") {
                setOutput(`Execution Time: ${timeElapsed}ms | Memory Used: ${memory || 'N/A'}\n\n${output}`);
                if (analysis) {
                    setAnalysisDetails({ ...analysis, isSuccess: true });
                }
            } else {
                // Remove messy ANSI color escape sequences from the terminal error string
                // eslint-disable-next-line no-control-regex
                const cleanError = (rawError || "Execution failed without output.").replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
                setOutput(`Memory Used BEFORE crash: ${memory || 'N/A'}\n\n${cleanError}`);
                if (analysis) {
                    setAnalysisDetails({ ...analysis, isSuccess: false });
                }
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message;
            setOutput(`Failed to connect to the execution engine: ${errorMsg}`);
            console.error(err);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleSaveSnippet = async () => {
        try {
            const title = prompt("Enter a title for this snippet:");
            if (!title) return;
            await API.post('/users/snippets', { title, code, language, isPublic: true });
            alert("Snippet saved to your portfolio!");
        } catch (error) {
            console.error("Failed to save snippet", error);
            alert("Failed to save snippet.");
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
                {/* Left Side: Brand and Tabs */}
                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                    <h2 className="text-primary font-bold" style={{ margin: 0, fontSize: "1.25rem", whiteSpace: "nowrap" }}>Orbit Code</h2>

                    {/* View Switcher */}
                    <div className="rounded-lg p-1" style={{ display: "flex", gap: "0.5rem", background: "rgba(0,0,0,0.4)" }}>
                        <button
                            onClick={() => setActiveTab("editor")}
                            className="px-4 py-2 rounded font-medium transition-colors"
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: activeTab === 'editor' ? 'var(--primary)' : 'transparent', color: activeTab === 'editor' ? '#fff' : 'var(--text-muted)' }}>
                            <Code size={18} /> Code Editor
                        </button>
                        <button
                            onClick={() => setActiveTab("analytics")}
                            className="px-4 py-2 rounded font-medium transition-colors"
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: activeTab === 'analytics' ? 'var(--primary)' : 'transparent', color: activeTab === 'analytics' ? '#fff' : 'var(--text-muted)' }}>
                            <Activity size={18} /> Progress Dashboard
                        </button>
                    </div>
                </div>

                {/* Right Side: Navigation and Logout */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", paddingRight: "1.5rem", borderRight: "1px solid var(--glass-border)" }}>
                        <button className="text-muted hover:text-white transition-colors text-sm font-medium"
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer" }}
                            onClick={() => navigate('/challenges')}>
                            <Trophy size={16} className="text-yellow-400" /> Challenges
                        </button>
                        <button className="text-muted hover:text-white transition-colors text-sm font-medium"
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer" }}
                            onClick={() => navigate('/leaderboard')}>
                            <Activity size={16} className="text-blue-400" /> Leaderboard
                        </button>

                        <button className="text-muted hover:text-white transition-colors text-sm font-medium"
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer" }}
                            onClick={() => navigate('/profile')}>
                            <UserIcon size={16} className="text-purple-400" /> Profile
                        </button>
                        <button className="text-muted hover:text-white transition-colors text-sm font-medium"
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer" }}
                            onClick={() => navigate('/speedtest')}>
                            <Box size={16} className="text-orange-400" /> Speed Test
                        </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span className="text-white text-sm font-medium" style={{ whiteSpace: "nowrap" }}>{user?.name}</span>
                        <button
                            onClick={logout}
                            className="btn-primary"
                            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", background: "rgba(239, 68, 68, 0.2)", color: "var(--error)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "6px", cursor: "pointer" }}
                        >
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Split Layout */}
            <main className="flex" style={{ flex: 1, height: "calc(100vh - 70px)" }}>
                {activeTab === "editor" ? (
                    <>
                        {/* Left Pane - Editor */}
                        <div className="flex-col" style={{ flex: "0 0 60%", padding: "1rem", borderRight: "1px solid var(--glass-border)" }}>
                            {activeChallengeName && (
                                <div className="mb-4 p-3 glass-panel flex items-center justify-between border border-yellow-500 border-opacity-30 bg-yellow-500 bg-opacity-5 animate-pulse-slow">
                                    <div className="flex items-center gap-3">
                                        <Trophy size={18} className="text-yellow-400" />
                                        <span className="text-sm font-bold text-white tracking-wide">Mission: <span className="text-yellow-400">{activeChallengeName}</span></span>
                                    </div>
                                    <button
                                        onClick={() => setActiveChallengeName(null)}
                                        className="text-[10px] text-muted hover:text-white uppercase tracking-widest font-bold"
                                    >
                                        Abandon
                                    </button>
                                </div>
                            )}
                            <div className="glass-panel" style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column" }}>
                                <CodeEditor code={code} setCode={setCode} language={language} onLanguageChange={handleLanguageChange} />
                                <div className="mt-4 flex justify-between">
                                    <button onClick={handleSaveSnippet} className="btn-secondary flex items-center gap-2" style={{ background: "rgba(168, 85, 247, 0.2)", color: "var(--purple-400)", border: "1px solid rgba(168, 85, 247, 0.3)", padding: "0.5rem 1rem", borderRadius: "6px" }}>
                                        <BookOpen size={16} /> Save Snippet
                                    </button>
                                    <button onClick={handleRunCode} className="btn-primary flex items-center gap-2" disabled={isExecuting}>
                                        <Play size={16} fill="white" /> {isExecuting ? "Executing..." : "Run Code"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right Pane - Output & Analysis */}
                        <div className="flex-col" style={{ flex: "0 0 40%", padding: "1rem", overflowY: "auto" }}>
                            {/* Output Section */}
                            <div className="glass-panel mb-4" style={{ padding: "1rem", minHeight: "200px" }}>
                                <h3 className="text-primary font-semibold mb-2 flex items-center gap-2 border-b border-gray-700 pb-2">
                                    <span style={{ fontSize: "1.2rem", borderBottom: "1px solid var(--glass-border)", display: "block", background: "none" }}>Execution Output</span>
                                </h3>
                                <pre className="mt-4 p-4 text-sm font-mono" style={{ background: "rgba(0,0,0,0.5)", borderRadius: "8px", minHeight: "100px", color: analysisDetails && !analysisDetails.isSuccess ? "var(--error)" : "var(--text-main)", whiteSpace: "pre-wrap", overflowX: "auto" }}>
                                    {output || "Run your code to see the output..."}
                                </pre>
                            </div>

                            {/* AI Analysis Section */}
                            <div className="glass-panel" style={{ padding: "1rem", flex: 1 }}>
                                <h3 className="text-primary font-semibold mb-2 flex items-center gap-2 border-b border-gray-700 pb-2">
                                    Analysis & Feedback
                                </h3>
                                <div className="mt-4 p-4" style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", minHeight: "150px" }}>
                                    {analysisDetails ? (
                                        <div className="animate-fade-in">
                                            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700/50">
                                                {analysisDetails.isSuccess ? (
                                                    <div className="flex items-center gap-2" style={{ color: "var(--success)" }}>
                                                        <CheckCircle size={20} /> <strong style={{ fontSize: "1.1rem" }}>Code Execution Successful</strong>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2" style={{ color: "var(--error)" }}>
                                                        <AlertTriangle size={20} /> <strong style={{ fontSize: "1.1rem" }}>Error Detected!</strong>
                                                    </div>
                                                )}

                                                {/* Code Quality Score Badge */}
                                                <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{
                                                    background: analysisDetails.codeQualityScore >= 8 ? 'rgba(16, 185, 129, 0.2)' :
                                                        analysisDetails.codeQualityScore >= 5 ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                    border: `1px solid ${analysisDetails.codeQualityScore >= 8 ? 'var(--success)' :
                                                        analysisDetails.codeQualityScore >= 5 ? '#eab308' : 'var(--error)'}`
                                                }}>
                                                    <Trophy size={14} className={analysisDetails.codeQualityScore >= 8 ? 'text-success' :
                                                        analysisDetails.codeQualityScore >= 5 ? 'text-yellow-500' : 'text-error'} />
                                                    <span className="text-sm font-bold text-white">Score: {analysisDetails.codeQualityScore || 0}/10</span>
                                                </div>
                                            </div>

                                            {/* Security Warning (If Any) */}
                                            {analysisDetails.securityVulnerabilities && analysisDetails.securityVulnerabilities !== "None detected." && analysisDetails.securityVulnerabilities !== "Unable to analyze security." && (
                                                <div className="p-3 mb-4 flex items-start gap-3" style={{ background: "rgba(239, 68, 68, 0.1)", borderLeft: "4px solid var(--error)", borderRadius: "4px" }}>
                                                    <AlertTriangle size={18} className="text-error mt-0.5" />
                                                    <div>
                                                        <strong className="text-error block mb-1">Security Vulnerability Found:</strong>
                                                        <span className="text-sm text-gray-300">{analysisDetails.securityVulnerabilities}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="p-3" style={{ background: "rgba(255, 255, 255, 0.05)", borderRadius: "6px" }}>
                                                    <p className="text-xs text-muted mb-1 uppercase tracking-wider">Time Complexity</p>
                                                    <p className="font-mono text-primary font-semibold">{analysisDetails.timeComplexity || "N/A"}</p>
                                                </div>
                                                <div className="p-3" style={{ background: "rgba(255, 255, 255, 0.05)", borderRadius: "6px" }}>
                                                    <p className="text-xs text-muted mb-1 uppercase tracking-wider">Space Complexity</p>
                                                    <p className="font-mono text-secondary font-semibold">{analysisDetails.spaceComplexity || "N/A"}</p>
                                                </div>
                                            </div>

                                            {!analysisDetails.isSuccess && (
                                                <>
                                                    <p className="mb-2"><strong>Line:</strong> {analysisDetails.line}</p>
                                                    <p className="mb-2 text-gray-300"><strong>Issue:</strong> {analysisDetails.explanation}</p>
                                                    <div className="p-3 mt-4 mb-4" style={{ background: "rgba(59, 130, 246, 0.1)", borderLeft: "4px solid var(--primary)", borderRadius: "4px" }}>
                                                        <strong className="text-primary">Suggested Fix:</strong> <br />
                                                        <span className="text-sm text-gray-300">{analysisDetails.suggestedAction}</span>
                                                    </div>
                                                </>
                                            )}

                                            {/* Edge Cases */}
                                            {analysisDetails.edgeCases && analysisDetails.edgeCases !== "Consider standard edge cases." && analysisDetails.edgeCases !== "Unable to predict edge cases." && (
                                                <div className="p-3 mb-4" style={{ background: "rgba(234, 179, 8, 0.05)", borderLeft: "4px solid #eab308", borderRadius: "4px" }}>
                                                    <strong className="text-yellow-500">Edge Cases to Consider:</strong> <br />
                                                    <span className="text-sm text-gray-300">{analysisDetails.edgeCases}</span>
                                                </div>
                                            )}

                                            {/* Optimization */}
                                            <div className="p-3 mb-4" style={{ background: "rgba(16, 185, 129, 0.1)", borderLeft: "4px solid var(--success)", borderRadius: "4px" }}>
                                                <strong className="text-success">Optimization Suggestion:</strong> <br />
                                                <span className="text-sm text-gray-300">{analysisDetails.optimizationSuggestion || "Code looks good."}</span>
                                            </div>

                                            {/* Alternative Approach */}
                                            {analysisDetails.alternativeApproach && analysisDetails.alternativeApproach !== "Current approach is standard." && analysisDetails.alternativeApproach !== "Unable to suggest alternatives." && (
                                                <div className="p-3" style={{ background: "rgba(168, 85, 247, 0.1)", borderLeft: "4px solid #a855f7", borderRadius: "4px" }}>
                                                    <strong className="text-purple-400">Alternative Approach:</strong> <br />
                                                    <span className="text-sm text-gray-300">{analysisDetails.alternativeApproach}</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted opacity-60 mt-8">
                                            <Activity size={48} className="mb-2" />
                                            <p>Run your code to see AI analysis & feedback.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : activeTab === "challenges" ? (
                    <ChallengesView onSelectChallenge={handleSelectChallenge} />
                ) : (
                    <AnalyticsView />
                )}
            </main>
        </div>
    );
};

export default Dashboard;
