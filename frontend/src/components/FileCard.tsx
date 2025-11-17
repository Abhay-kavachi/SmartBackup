import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VirtualFile } from "../types";
import { formatBytes, formatDate } from "../utils/formatters";

type Props = {
  file: VirtualFile;
  onBackup: (fileId: number) => void;
  onDelete: (fileId: number) => void;
};

const FileCard = ({ file, onBackup, onDelete }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="bg-[#161b22] border border-gray-800 rounded-xl p-4 space-y-3"
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-lg">{file.name}</p>
          <p className="text-sm text-gray-400">{file.path}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">{formatBytes(file.size)}</span>
          <span
            className={`px-2 py-1 rounded-full text-xs capitalize ${
              file.status === "pending" ? "bg-yellow-500/20 text-yellow-300" : "bg-emerald-500/20 text-emerald-300"
            }`}
          >
            {file.status}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-sm" onClick={() => onBackup(file.id)}>
          Backup now
        </button>
        <button className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 text-sm" onClick={() => onDelete(file.id)}>
          Delete
        </button>
        <button className="ml-auto text-sm text-gray-400" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Hide versions" : "Show versions"}
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 border-t border-gray-800 pt-2 text-sm"
          >
            {file.versions.map((version) => (
              <li key={version.id} className="flex justify-between text-gray-400">
                <span>{version.delta_hash.slice(0, 10)}...</span>
                <span>{formatDate(version.created_at)}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default memo(FileCard);

