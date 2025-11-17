import axios from "axios";
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5001/api",
    timeout: 10000,
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("smartbackup_token");
    console.log("API Request:", config.method?.toUpperCase(), config.url);
    console.log("Token exists:", !!token);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("Authorization header set");
        console.log("Token preview:", token.substring(0, 30) + "...");
    } else {
        console.log("No token found in localStorage");
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log("API Response:", response.status, response.config.url);
        return response;
    },
    (error) => {
        console.log("API Error:", error.response?.status, error.config?.url);
        console.log("Error details:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);
export default api;
