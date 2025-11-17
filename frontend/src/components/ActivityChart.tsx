import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BackupJob } from "../types";
import { formatDate } from "../utils/formatters";

type Props = {
  jobs: BackupJob[];
};

const ActivityChart = ({ jobs }: Props) => {
  const data = useMemo(
    () =>
      jobs.slice(0, 15).map((job) => ({
        time: formatDate(job.started_at),
        duration: job.started_at && job.finished_at ? Date.parse(job.finished_at) - Date.parse(job.started_at) : 0,
      })),
    [jobs],
  );

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4">
      <p className="font-semibold mb-2">Backup Activity</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1f6feb" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#1f6feb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" stroke="#6e7681" tickLine={false} />
          <YAxis stroke="#6e7681" tickFormatter={(value) => `${Math.max(value / 1000, 0).toFixed(0)}s`} />
          <Tooltip />
          <Area type="monotone" dataKey="duration" stroke="#1f6feb" fillOpacity={1} fill="url(#colorActivity)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;

