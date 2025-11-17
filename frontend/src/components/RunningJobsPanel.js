import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatDate } from "../utils/formatters";
const RunningJobsPanel = ({ jobs }) => {
    const running = jobs.filter((job) => job.status === "running");
    return (_jsxs("div", { className: "bg-[#161b22] border border-gray-800 rounded-2xl p-4 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "font-semibold", children: "Running Jobs" }), _jsxs("span", { className: "text-sm text-gray-400", children: [running.length, " active"] })] }), _jsxs("div", { className: "space-y-3", children: [running.map((job) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold capitalize", children: job.schedule }), _jsx("p", { className: "text-xs text-gray-500", children: formatDate(job.started_at) })] }), _jsx("div", { className: "w-24 h-2 bg-gray-800 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-primary animate-pulse" }) })] }, job.id))), !running.length && _jsx("p", { className: "text-gray-500 text-sm", children: "No running jobs." })] })] }));
};
export default RunningJobsPanel;
