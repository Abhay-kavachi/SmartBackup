import { useState, useEffect } from "react";
import api from "../api/client";

const ProcessMonitor = () => {
    const [processes, setProcesses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Fetching process data...");
                const response = await api.get("/system/processes");
                console.log("Processes response:", response.data);
                
                const sortedProcesses = response.data.processes
                    .sort((a, b) => parseFloat(b.cpu_percent) - parseFloat(a.cpu_percent))
                    .slice(0, 5);
                
                console.log("Top 5 processes:", sortedProcesses);
                setProcesses(sortedProcesses);
            } catch (err) {
                console.error("Error fetching processes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4">
                <p className="font-semibold">Top 5 Running Jobs</p>
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4">
            <p className="font-semibold mb-4">Top 5 Running Jobs</p>
            <div className="space-y-2">
                {processes.map((proc) => (
                    <div key={proc.pid} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                        <div>
                            <p className="text-sm font-medium">{proc.name}</p>
                            <p className="text-xs text-gray-400">PID: {proc.pid}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-yellow-400">{proc.cpu_percent.toFixed(1)}% CPU</p>
                            <p className="text-xs text-gray-400">{proc.memory_mb.toFixed(0)}MB</p>
                        </div>
                    </div>
                ))}
                {processes.length === 0 && (
                    <p className="text-center text-gray-500">No processes found</p>
                )}
            </div>
        </div>
    );
};

export default ProcessMonitor;
