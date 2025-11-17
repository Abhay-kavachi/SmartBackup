import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
const ChatbotPanel = ({ messages, onSend, powerWarning }) => {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const lastMessageRef = useRef(null);
    const scrollContainerRef = useRef(null);
    useLayoutEffect(() => {
        if (lastMessageRef.current && scrollContainerRef.current) {
            const scrollContainer = scrollContainerRef.current;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [messages]);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!text.trim())
            return;
        setLoading(true);
        await onSend(text);
        setText("");
        setLoading(false);
    };
    return (_jsxs(motion.div, { className: "bg-[#0f1520] border border-gray-800 rounded-2xl h-[400px] flex flex-col overflow-hidden", initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 }, children: [_jsxs("div", { className: "p-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0", children: [_jsx("p", { className: "font-semibold", children: "Chitty Assistant" }), powerWarning && _jsx("span", { className: "text-xs text-yellow-300", children: "Low battery: backups paused" })] }), _jsxs("div", { ref: scrollContainerRef, className: "flex-1 overflow-y-auto space-y-4 p-4 custom-scroll", children: [messages.map((message, index) => (_jsx("div", { className: `flex ${message.sender === "You" ? "justify-end" : "justify-start"}`, children: _jsxs("div", { ref: index === messages.length - 1 ? lastMessageRef : null, className: `max-w-[80%] rounded-2xl px-4 py-2 text-sm ${message.sender === "You" ? "bg-primary text-white" : "bg-[#161b22] text-gray-100"}`, children: [_jsxs("p", { className: "text-xs text-gray-300 mb-1", children: [message.sender, ":"] }), _jsx("p", { children: message.text }), message.meta && (_jsx("pre", { className: "mt-2 text-[10px] text-gray-300 whitespace-pre-wrap", children: JSON.stringify(message.meta, null, 2) }))] }) }, message.timestamp))), !messages.length && _jsx("p", { className: "text-center text-gray-500 text-sm", children: "Ask Chitty for stats or schedules." })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-4 border-t border-gray-800 flex gap-2 flex-shrink-0", children: [_jsx("input", { value: text, onChange: (e) => setText(e.target.value), placeholder: "Type a command...", className: "flex-1 bg-[#161b22] px-3 py-2 rounded-xl border border-gray-700 outline-none focus:ring-2 focus:ring-primary" }), _jsx("button", { className: "bg-primary px-4 py-2 rounded-xl text-white font-semibold disabled:opacity-40", disabled: loading, children: "Send" })] })] }));
};
export default ChatbotPanel;
