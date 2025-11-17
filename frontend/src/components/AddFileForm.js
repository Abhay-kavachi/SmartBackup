import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import api from "../api/client";
const AddFileForm = ({ onAdd }) => {
    const [path, setPath] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = useCallback(async (event) => {
        event.preventDefault();
        if (!path)
            return;
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.post("/files/watch", { path });
            onAdd(data.file);
            setPath("");
        }
        catch (err) {
            setError("Unable to watch file");
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    }, [path, onAdd]);
    return (_jsxs("form", { onSubmit: handleSubmit, className: "flex gap-2 items-center", children: [_jsx("input", { value: path, onChange: (e) => setPath(e.target.value), placeholder: "Path to watch", className: "flex-1 bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none" }), _jsx("button", { type: "submit", className: "bg-primary px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-40", disabled: loading, children: loading ? "Adding..." : "Watch" }), error && _jsx("span", { className: "text-red-400 text-sm", children: error })] }));
};
export default AddFileForm;
