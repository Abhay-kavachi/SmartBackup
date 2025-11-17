import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useBattery } from "../hooks/useBattery";
import { usePolling } from "../hooks/usePolling";
import AddFileForm from "../components/AddFileForm";
import FileList from "../components/FileList";
import ActivityChart from "../components/ActivityChart";
import RunningJobsPanel from "../components/RunningJobsPanel";
import DeletedFilesPanel from "../components/DeletedFilesPanel";
import BackupProgress from "../components/BackupProgress";
import Notifications from "../components/Notifications";
import ChatbotPanel from "../components/ChatbotPanel";
import PowerStatus from "../components/PowerStatus";
const DashboardPage = () => {
    const { user, logout } = useAuth();
    const battery = useBattery();
    const [files, setFiles] = useState([]);
    const [deleted, setDeleted] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchFiles = useCallback(async () => {
        const { data } = await api.get("/files");
        const active = data.files.filter((file) => file.status !== "deleted");
        const removed = data.files.filter((file) => file.status === "deleted");
        setFiles(active);
        setDeleted(removed);
    }, []);
    const fetchJobs = useCallback(async () => {
        const { data } = await api.get("/backups");
        setJobs(data.jobs);
    }, []);
    const fetchEvents = useCallback(async () => {
        const { data } = await api.get("/backups/events");
        setNotifications(data.events.map((event) => ({
            id: String(event.id),
            message: event.message,
            type: event.level === "error" ? "error" : "info",
        })));
    }, []);
    useEffect(() => {
        const load = async () => {
            try {
                await Promise.all([fetchFiles(), fetchJobs(), fetchEvents()]);
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [fetchFiles, fetchJobs, fetchEvents]);
    usePolling(fetchJobs, 8000, [fetchJobs]);
    usePolling(fetchEvents, 10000, [fetchEvents]);
    const handleBackup = useCallback(async (fileId) => {
        await api.post("/backups/run", { file_id: fileId });
        fetchJobs();
    }, [fetchJobs]);
    const handleDelete = useCallback(async (fileId) => {
        await api.delete(`/files/${fileId}`);
        fetchFiles();
    }, [fetchFiles]);
    const handleRecover = useCallback(async (fileId) => {
        await api.post(`/files/recover/${fileId}`);
        fetchFiles();
    }, [fetchFiles]);
    const handleChatSend = useCallback(async (text) => {
        const outgoing = { sender: "You", text, timestamp: new Date().toISOString() };
        setMessages((prev) => [...prev, outgoing]);
        try {
            const { data } = await api.post("/chatbot", { message: text });
            const incoming = {
                sender: "Chitty",
                text: data.reply,
                meta: data.meta,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, incoming]);
        }
        catch (err) {
            setMessages((prev) => [
                ...prev,
                { sender: "Chitty", text: "Connection issue. Try again shortly.", timestamp: new Date().toISOString() },
            ]);
            console.error(err);
        }
    }, []);
    const progress = useMemo(() => {
        if (!jobs.length)
            return 0;
        const completed = jobs.filter((job) => job.status === "completed").length;
        return (completed / jobs.length) * 100;
    }, [jobs]);
    if (!user)
        return null;
    return (_jsxs("div", { className: "min-h-screen bg-[#0d1117] text-white", children: [_jsxs("header", { className: "px-8 py-6 border-b border-gray-800 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-400", children: "Welcome back" }), _jsx("h1", { className: "text-2xl font-bold", children: "SmartBackup OS" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "text-sm text-gray-400", children: user.email }), _jsx("button", { onClick: logout, className: "px-4 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm", children: "Logout" })] })] }), _jsxs("main", { className: "p-6 grid lg:grid-cols-[3fr_1.2fr] gap-6", children: [_jsxs(motion.section, { className: "space-y-6", initial: { opacity: 0 }, animate: { opacity: 1 }, children: [_jsxs("div", { className: "bg-[#161b22] border border-gray-800 rounded-2xl p-4 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Watched Files" }), _jsxs("span", { className: "text-sm text-gray-400", children: [files.length, " files"] })] }), _jsx(AddFileForm, { onAdd: (file) => {
                                            setFiles((prev) => [...prev, file]);
                                        } }), loading ? _jsx("p", { className: "text-gray-500", children: "Loading..." }) : _jsx(FileList, { files: files, onBackup: handleBackup, onDelete: handleDelete })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsx(ActivityChart, { jobs: jobs }), _jsx(RunningJobsPanel, { jobs: jobs })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsx(DeletedFilesPanel, { files: deleted, onRecover: handleRecover }), _jsx(PowerStatus, { level: battery.level, charging: battery.charging })] }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsx(BackupProgress, { value: progress, label: "Backup completion rate" }), _jsxs("div", { className: "bg-[#161b22] border border-gray-800 rounded-2xl p-4", children: [_jsx("p", { className: "font-semibold mb-2", children: "Global Notifications" }), _jsx(Notifications, { items: notifications })] })] })] }), _jsx("section", { className: "min-h-[500px]", children: _jsx(ChatbotPanel, { messages: messages, onSend: handleChatSend, powerWarning: !battery.charging && battery.level < 0.1 }) })] })] }));
};
export default DashboardPage;
