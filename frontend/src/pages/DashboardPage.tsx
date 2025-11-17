import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useBattery } from "../hooks/useBattery";
import { usePolling } from "../hooks/usePolling";
import { BackupJob, ChatMessage, VirtualFile } from "../types";
import AddFileForm from "../components/AddFileForm";
import FileList from "../components/FileList";
import ActivityChart from "../components/ActivityChart";
import RunningJobsPanel from "../components/RunningJobsPanel";
import DeletedFilesPanel from "../components/DeletedFilesPanel";
import BackupProgress from "../components/BackupProgress";
import Notifications from "../components/Notifications";
import ChatbotPanel from "../components/ChatbotPanel";
import PowerStatus from "../components/PowerStatus";

type Notification = {
  id: string;
  message: string;
  type?: "info" | "warning" | "error";
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const battery = useBattery();
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const [deleted, setDeleted] = useState<VirtualFile[]>([]);
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    const { data } = await api.get("/files");
    const active = data.files.filter((file: VirtualFile) => file.status !== "deleted");
    const removed = data.files.filter((file: VirtualFile) => file.status === "deleted");
    setFiles(active);
    setDeleted(removed);
  }, []);

  const fetchJobs = useCallback(async () => {
    const { data } = await api.get("/backups");
    setJobs(data.jobs);
  }, []);

  const fetchEvents = useCallback(async () => {
    const { data } = await api.get("/backups/events");
    setNotifications(
      data.events.map((event: any) => ({
        id: String(event.id),
        message: event.message,
        type: event.level === "error" ? "error" : "info",
      })),
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchFiles(), fetchJobs(), fetchEvents()]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchFiles, fetchJobs, fetchEvents]);

  usePolling(fetchJobs, 8000, [fetchJobs]);
  usePolling(fetchEvents, 10000, [fetchEvents]);

  const handleBackup = useCallback(
    async (fileId: number) => {
      await api.post("/backups/run", { file_id: fileId });
      fetchJobs();
    },
    [fetchJobs],
  );

  const handleDelete = useCallback(
    async (fileId: number) => {
      await api.delete(`/files/${fileId}`);
      fetchFiles();
    },
    [fetchFiles],
  );

  const handleRecover = useCallback(
    async (fileId: number) => {
      await api.post(`/files/recover/${fileId}`);
      fetchFiles();
    },
    [fetchFiles],
  );

  const handleChatSend = useCallback(
    async (text: string) => {
      const outgoing: ChatMessage = { sender: "You", text, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, outgoing]);
      try {
        const { data } = await api.post("/chatbot", { message: text });
        const incoming: ChatMessage = {
          sender: "Chitty",
          text: data.reply,
          meta: data.meta,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, incoming]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { sender: "Chitty", text: "Connection issue. Try again shortly.", timestamp: new Date().toISOString() },
        ]);
        console.error(err);
      }
    },
    [],
  );

  const progress = useMemo(() => {
    if (!jobs.length) return 0;
    const completed = jobs.filter((job) => job.status === "completed").length;
    return (completed / jobs.length) * 100;
  }, [jobs]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <header className="px-8 py-6 border-b border-gray-800 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Welcome back</p>
          <h1 className="text-2xl font-bold">SmartBackup OS</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user.email}</span>
          <button onClick={logout} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm">
            Logout
          </button>
        </div>
      </header>
      <main className="p-6 grid lg:grid-cols-[3fr_1.2fr] gap-6">
        <motion.section className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Watched Files</h2>
              <span className="text-sm text-gray-400">{files.length} files</span>
            </div>
            <AddFileForm
              onAdd={(file) => {
                setFiles((prev) => [...prev, file]);
              }}
            />
            {loading ? <p className="text-gray-500">Loading...</p> : <FileList files={files} onBackup={handleBackup} onDelete={handleDelete} />}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ActivityChart jobs={jobs} />
            <RunningJobsPanel jobs={jobs} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <DeletedFilesPanel files={deleted} onRecover={handleRecover} />
            <PowerStatus level={battery.level} charging={battery.charging} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <BackupProgress value={progress} label="Backup completion rate" />
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4">
              <p className="font-semibold mb-2">Global Notifications</p>
              <Notifications items={notifications} />
            </div>
          </div>
        </motion.section>

        <section className="min-h-[500px]">
          <ChatbotPanel messages={messages} onSend={handleChatSend} powerWarning={!battery.charging && battery.level < 0.1} />
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;

