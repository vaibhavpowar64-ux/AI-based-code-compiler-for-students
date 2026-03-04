import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { LogIn, GraduationCap, Briefcase } from "lucide-react";

const Login = () => {
    const { login } = useContext(AuthContext);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("student"); // "student" or "professor"

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await login(identifier, password, activeTab);
        setIsLoading(false);

        if (result.success) {
            // Once login is successful, check local storage to decide where to route
            const savedUser = JSON.parse(localStorage.getItem("user"));
            if (savedUser?.role === "admin" || savedUser?.role === "staff" || savedUser?.role === "professor") {
                window.location.href = "/admin"; // Route Staff directly to their dashboard
            } else {
                window.location.href = "/"; // Route Students directly to the IDE
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div
                className="glass-panel animate-fade-in"
                style={{ padding: "3rem", width: "100%", maxWidth: "420px" }}
            >
                {/* Tab Switcher */}
                <div className="flex mb-6 bg-[rgba(0,0,0,0.3)] rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab("student");
                            setError("");
                        }}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === "student" ? "bg-primary text-white shadow-md" : "text-muted hover:text-white"}`}
                    >
                        <GraduationCap size={16} />
                        Student
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab("professor");
                            setError("");
                        }}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === "professor" ? "bg-accent text-white shadow-md" : "text-muted hover:text-white"}`}
                    >
                        <Briefcase size={16} />
                        Staff / Professor
                    </button>
                </div>

                <div className="text-center mb-6">
                    <div className={`flex justify-center mb-4 ${activeTab === "student" ? "text-primary" : "text-accent"}`}>
                        <LogIn size={48} />
                    </div>
                    <h2>{activeTab === "student" ? "Student Portal" : "Staff Portal"}</h2>
                    <p className="text-muted mt-2">Sign in to continue your journey</p>
                </div>

                {error && (
                    <div className="mb-4" style={{ color: "var(--error)", padding: "10px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", border: "1px solid var(--error)", fontSize: "0.9rem" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex-col">
                    <div className="mb-4">
                        <label className="text-muted mb-2 block font-medium">Name or Email</label>
                        <input
                            type="text"
                            className="input-glass"
                            placeholder={activeTab === "student" ? "student@example.com" : "staff@example.com"}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="text-muted mb-2 block font-medium">Password</label>
                        <input
                            type="password"
                            className="input-glass"
                            placeholder="•••••••• (Optional for existing users)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                        style={{
                            background: activeTab === "student" ? "var(--primary)" : "var(--accent)",
                            color: "white",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "12px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                            border: "none",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-muted mt-6" style={{ fontSize: "0.9rem" }}>
                    Don't have an account?{" "}
                    <Link to="/register" className={activeTab === "student" ? "text-primary" : "text-accent"} style={{ textDecoration: "none", fontWeight: "500" }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
