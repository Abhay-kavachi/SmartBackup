import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
const LoginPage = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post("/auth/login", { email, password });
            login(data.token, data.user);
        }
        catch (err) {
            setError("Invalid credentials");
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-secondary", children: _jsxs(motion.form, { className: "bg-[#161b22] p-10 rounded-2xl max-w-md w-full shadow-xl space-y-6", onSubmit: handleSubmit, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 }, children: [_jsx("h1", { className: "text-3xl font-bold text-center text-primary", children: "SmartBackup OS" }), _jsx("p", { className: "text-center text-gray-400", children: "Log in to manage your backups" }), error && _jsx("p", { className: "text-red-400 text-center", children: error }), _jsxs("div", { className: "space-y-4", children: [_jsx("input", { type: "email", className: "w-full rounded-lg bg-[#0d1117] px-4 py-3 focus:ring-2 focus:ring-primary outline-none", placeholder: "Email", value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx("input", { type: "password", className: "w-full rounded-lg bg-[#0d1117] px-4 py-3 focus:ring-2 focus:ring-primary outline-none", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }), _jsx("button", { type: "submit", className: "w-full bg-primary hover:bg-blue-600 transition text-white font-semibold py-3 rounded-lg disabled:opacity-50", disabled: loading, children: loading ? "Signing in..." : "Sign In" }), _jsxs("p", { className: "text-center text-gray-400", children: ["No account?", " ", _jsx(Link, { className: "text-primary font-semibold", to: "/register", children: "Register" })] })] }) }));
};
export default LoginPage;
