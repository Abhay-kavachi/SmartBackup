import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "../utils/formatters";
const ActivityChart = ({ jobs }) => {
    const data = useMemo(() => jobs.slice(0, 15).map((job) => ({
        time: formatDate(job.started_at),
        duration: job.started_at && job.finished_at ? Date.parse(job.finished_at) - Date.parse(job.started_at) : 0,
    })), [jobs]);
    return (_jsxs("div", { className: "bg-[#161b22] border border-gray-800 rounded-2xl p-4", children: [_jsx("p", { className: "font-semibold mb-2", children: "Backup Activity" }), _jsx(ResponsiveContainer, { width: "100%", height: 200, children: _jsxs(AreaChart, { data: data, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "colorActivity", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#1f6feb", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#1f6feb", stopOpacity: 0 })] }) }), _jsx(XAxis, { dataKey: "time", stroke: "#6e7681", tickLine: false }), _jsx(YAxis, { stroke: "#6e7681", tickFormatter: (value) => `${Math.max(value / 1000, 0).toFixed(0)}s` }), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "duration", stroke: "#1f6feb", fillOpacity: 1, fill: "url(#colorActivity)" })] }) })] }));
};
export default ActivityChart;
