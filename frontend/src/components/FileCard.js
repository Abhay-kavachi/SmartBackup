import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatBytes, formatDate } from "../utils/formatters";

const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconClass = "w-8 h-8 flex items-center justify-center rounded-lg";
    
    switch (extension) {
        case 'pdf':
            return _jsx("div", { className: `${iconClass} bg-red-500/20 text-red-400`, children: "📄" });
        case 'doc':
        case 'docx':
            return _jsx("div", { className: `${iconClass} bg-blue-500/20 text-blue-400`, children: "📝" });
        case 'xls':
        case 'xlsx':
            return _jsx("div", { className: `${iconClass} bg-green-500/20 text-green-400`, children: "📊" });
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
            return _jsx("div", { className: `${iconClass} bg-purple-500/20 text-purple-400`, children: "🖼️" });
        case 'mp4':
        case 'avi':
        case 'mov':
            return _jsx("div", { className: `${iconClass} bg-orange-500/20 text-orange-400`, children: "🎬" });
        case 'mp3':
        case 'wav':
        case 'flac':
            return _jsx("div", { className: `${iconClass} bg-pink-500/20 text-pink-400`, children: "🎵" });
        case 'zip':
        case 'rar':
        case '7z':
            return _jsx("div", { className: `${iconClass} bg-yellow-500/20 text-yellow-400`, children: "📦" });
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
            return _jsx("div", { className: `${iconClass} bg-yellow-500/20 text-yellow-400`, children: "⚡" });
        case 'py':
            return _jsx("div", { className: `${iconClass} bg-blue-500/20 text-blue-400`, children: "🐍" });
        case 'html':
        case 'css':
            return _jsx("div", { className: `${iconClass} bg-orange-500/20 text-orange-400`, children: "🌐" });
        default:
            return _jsx("div", { className: `${iconClass} bg-gray-500/20 text-gray-400`, children: "📄" });
    }
};

const FileCard = ({ file, onBackup, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    return (_jsxs(motion.div, { layout: true, className: "bg-[#161b22] border border-gray-800 rounded-xl p-4 space-y-3 hover:border-gray-700 transition-all duration-200", initial: { opacity: 0.7 }, animate: { opacity: 1 }, children: [_jsxs("div", { className: "flex items-start gap-3", children: [getFileIcon(file.name), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-semibold text-sm text-white truncate", children: file.name }), _jsx("p", { className: "text-xs text-gray-400 truncate mt-1", children: file.path })] }), _jsxs("div", { className: "flex flex-col items-end gap-1", children: [_jsx("span", { className: "text-xs text-gray-300 font-medium", children: formatBytes(file.size) }), _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium capitalize ${file.status === "pending" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`, children: file.status })] })] }), _jsxs("div", { className: "flex items-center gap-2 pt-2 border-t border-gray-800/50", children: [_jsx("button", { className: "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors duration-200 border border-primary/20", onClick: () => onBackup(file.id), children: [_jsx("span", { children: "💾" }), _jsx("span", { children: "Backup" })] }), _jsx("button", { className: "flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors duration-200 border border-red-500/20", onClick: () => onDelete(file.id), children: [_jsx("span", { children: "🗑️" }), _jsx("span", { children: "Delete" })] }), _jsx("button", { className: "ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 text-xs font-medium transition-colors duration-200 border border-gray-500/20", onClick: () => setExpanded((value) => !value), children: [_jsx("span", { children: expanded ? "📕" : "📗" }), _jsx("span", { children: expanded ? "Hide" : "Versions" })] })] }), _jsx(AnimatePresence, { children: expanded && (_jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "overflow-hidden", children: _jsxs("div", { className: "space-y-2 border-t border-gray-800 pt-3", children: [_jsx("p", { className: "text-xs font-medium text-gray-300 mb-2", children: "Version History" }), file.versions.map((version) => (_jsxs("div", { className: "flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors duration-200", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-gray-400 font-mono bg-gray-900/50 px-2 py-1 rounded", children: version.delta_hash.slice(0, 8) }), _jsx("span", { className: "text-xs text-gray-300", children: formatDate(version.created_at) })] }), _jsx("button", { className: "text-xs text-primary hover:text-primary/80 transition-colors duration-200", children: "View" })] }, version.id)))] }) })) })] }));
};

export default memo(FileCard);
