import React, { createContext, useState, useEffect } from "react";
import API from "../api/api";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("user"));
        if (userInfo) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(userInfo);
        }
        setLoading(false);
    }, []);

    const login = async (identifier, password, expectedRole) => {
        try {
            const response = await API.post("/auth/login", { identifier, password, expectedRole });
            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Login failed",
            };
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const response = await API.post("/auth/register", {
                name,
                email,
                password,
                role,
            });
            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Registration failed",
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
