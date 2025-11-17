export type FileVersion = {
  id: number;
  delta_hash: string;
  storage_path: string;
  compressed_size: number;
  created_at: string;
};

export type VirtualFile = {
  id: number;
  path: string;
  name: string;
  size: number;
  status: string;
  updated_at?: string;
  versions: FileVersion[];
};

export type BackupJob = {
  id: number;
  status: string;
  schedule: string;
  detail?: string;
  started_at?: string;
  finished_at?: string;
};

export type ChatMessage = {
  sender: "You" | "Chitty";
  text: string;
  meta?: Record<string, unknown>;
  timestamp: string;
};

