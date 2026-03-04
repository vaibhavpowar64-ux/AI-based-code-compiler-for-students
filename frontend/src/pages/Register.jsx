import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

const Register = () => {
    const { register } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await register(name, email, password, role);
        setIsLoading(false);

        if (result.success) {
            window.location.href = "/";
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
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4 text-primary">
                        <UserPlus size={48} />
                    </div>
                    <h2>Create Account</h2>
                    <p className="text-muted mt-2">Join to start coding today</p>
                </div>

                {error && (
                    <div className="mb-4" style={{ color: "var(--error)", padding: "10px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", border: "1px solid var(--error)", fontSize: "0.9rem" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex-col">
                    <div className="mb-4">
                        <label className="text-muted mb-2 block font-medium">Full Name</label>
                        <input
                            type="text"
                            className="input-glass"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-muted mb-2 block font-medium">Email</label>
                        <input
                            type="email"
                            className="input-glass"
                            placeholder="student@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-muted mb-2 block font-medium">Password</label>
                        <input
                            type="password"
                            className="input-glass"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="text-muted mb-2 block font-medium">Role</label>
                        <select
                            className="input-glass"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "var(--text-main)" }}
                        >
                            <option value="student">Student</option>
                            <option value="professor">Staff / Professor</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary w-full" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-muted mt-6" style={{ fontSize: "0.9rem" }}>
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-medium" style={{ textDecoration: "none" }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
