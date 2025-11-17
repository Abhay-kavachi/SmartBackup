import { useState, useCallback } from "react";
import api from "../api/client";
import { VirtualFile } from "../types";

type Props = {
  onAdd: (file: VirtualFile) => void;
};

const AddFileForm = ({ onAdd }: Props) => {
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!path) return;
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.post("/files/watch", { path });
        onAdd(data.file);
        setPath("");
      } catch (err) {
        setError("Unable to watch file");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [path, onAdd],
  );

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        value={path}
        onChange={(e) => setPath(e.target.value)}
        placeholder="Path to watch"
        className="flex-1 bg-[#0d1117] border border-gray-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary outline-none"
      />
      <button
        type="submit"
        className="bg-primary px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-40"
        disabled={loading}
      >
        {loading ? "Adding..." : "Watch"}
      </button>
      {error && <span className="text-red-400 text-sm">{error}</span>}
    </form>
  );
};

export default AddFileForm;

