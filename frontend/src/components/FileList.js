import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import FileCard from "./FileCard";
const FileList = ({ files, onBackup, onDelete }) => {
    const sorted = useMemo(() => [...files].sort((a, b) => b.id - a.id), [files]);
    if (!sorted.length) {
        return _jsx("p", { className: "text-gray-500 text-center py-10", children: "No watched files yet." });
    }
    return (_jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: sorted.map((file) => (_jsx(FileCard, { file: file, onBackup: onBackup, onDelete: onDelete }, file.id))) }));
};
export default FileList;
