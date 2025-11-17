import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const colorMap = {
    info: "bg-blue-500/10 text-blue-300",
    warning: "bg-yellow-500/10 text-yellow-300",
    error: "bg-red-500/10 text-red-300",
};
const Notifications = ({ items }) => (_jsxs("div", { className: "space-y-2", children: [items.map((item) => (_jsx("div", { className: `p-3 rounded-lg text-sm ${colorMap[item.type ?? "info"]}`, children: item.message }, item.id))), !items.length && _jsx("p", { className: "text-xs text-gray-500", children: "All systems stable." })] }));
export default Notifications;
