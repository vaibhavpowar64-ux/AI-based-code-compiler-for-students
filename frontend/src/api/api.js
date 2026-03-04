import axios from "axios";

// Create an Axios instance
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api",
});

// Interceptor to add JWT token from localStorage to headers
API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
});

export default API;
