import { BackupJob } from "../types";
import { formatDate } from "../utils/formatters";

type Props = {
  jobs: BackupJob[];
};

const RunningJobsPanel = ({ jobs }: Props) => {
  const running = jobs.filter((job) => job.status === "running");
  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Running Jobs</p>
        <span className="text-sm text-gray-400">{running.length} active</span>
      </div>
      <div className="space-y-3">
        {running.map((job) => (
          <div key={job.id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold capitalize">{job.schedule}</p>
              <p className="text-xs text-gray-500">{formatDate(job.started_at)}</p>
            </div>
            <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse" />
            </div>
          </div>
        ))}
        {!running.length && <p className="text-gray-500 text-sm">No running jobs.</p>}
      </div>
    </div>
  );
};

export default RunningJobsPanel;

