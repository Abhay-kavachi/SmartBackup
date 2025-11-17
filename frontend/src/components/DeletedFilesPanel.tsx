import { VirtualFile } from "../types";
import { formatDate } from "../utils/formatters";

type Props = {
  files: VirtualFile[];
  onRecover: (fileId: number) => void;
};

const DeletedFilesPanel = ({ files, onRecover }: Props) => (
  <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 space-y-3">
    <div className="flex items-center justify-between">
      <p className="font-semibold">Deleted Files</p>
      <span className="text-xs text-gray-500">{files.length}</span>
    </div>
    <div className="space-y-2 max-h-64 overflow-auto pr-2 custom-scroll">
      {files.map((file) => (
        <div key={file.id} className="flex items-center justify-between gap-3 text-sm">
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-gray-500">{formatDate(file.updated_at)}</p>
          </div>
          <button className="text-primary text-xs" onClick={() => onRecover(file.id)}>
            Recover
          </button>
        </div>
      ))}
      {!files.length && <p className="text-gray-500 text-sm">No deleted files.</p>}
    </div>
  </div>
);

export default DeletedFilesPanel;

