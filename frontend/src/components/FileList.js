import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import FileCard from "./FileCard";

const FileList = ({ files, onBackup, onDelete }) => {
    const sorted = useMemo(() => [...files].sort((a, b) => b.id - a.id), [files]);
    
    if (!sorted.length) {
        return _jsx("div", { className: "bg-[#161b22] border border-gray-800 rounded-2xl p-8 text-center", children: _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "text-4xl", children: "📁" }), _jsx("p", { className: "text-gray-400 text-lg font-medium", children: "No files being watched" }), _jsx("p", { className: "text-gray-500 text-sm", children: "Add files to start monitoring for backup" })] }) });
    }
    
    return (_jsxs("div", { className: "bg-[#161b22] border border-gray-800 rounded-2xl p-4 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Upload Files" }), _jsxs("span", { className: "text-sm text-gray-400", children: [sorted.length, " files"] })] }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: sorted.map((file) => (_jsx(FileCard, { file: file, onBackup: onBackup, onDelete: onDelete }, file.id))) })] }));
};

export default FileList;
