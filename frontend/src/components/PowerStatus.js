import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const PowerStatus = ({ level, charging }) => {
    const percentage = Math.round(level * 100);
    const statusColor = charging ? "text-emerald-300" : percentage < 10 ? "text-red-400" : "text-yellow-300";
    return (_jsxs("div", { className: "bg-[#161b22] border border-gray-800 rounded-2xl p-4 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "font-semibold", children: "Power Monitor" }), _jsx("span", { className: `text-sm ${statusColor}`, children: charging ? "Charging" : "On battery" })] }), _jsx("div", { className: "w-full h-2 bg-gray-800 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-primary", style: { width: `${percentage}%` } }) }), _jsxs("p", { className: "text-gray-400 text-sm", children: [percentage, "% remaining"] })] }));
};
export default PowerStatus;
