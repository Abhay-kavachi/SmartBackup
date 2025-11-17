import { useMemo } from "react";
import { VirtualFile } from "../types";
import FileCard from "./FileCard";

type Props = {
  files: VirtualFile[];
  onBackup: (fileId: number) => void;
  onDelete: (fileId: number) => void;
};

const FileList = ({ files, onBackup, onDelete }: Props) => {
  const sorted = useMemo(() => [...files].sort((a, b) => b.id - a.id), [files]);

  if (!sorted.length) {
    return <p className="text-gray-500 text-center py-10">No watched files yet.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sorted.map((file) => (
        <FileCard key={file.id} file={file} onBackup={onBackup} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default FileList;

