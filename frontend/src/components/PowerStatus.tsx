type Props = {
  level: number;
  charging: boolean;
};

const PowerStatus = ({ level, charging }: Props) => {
  const percentage = Math.round(level * 100);
  const statusColor = charging ? "text-emerald-300" : percentage < 10 ? "text-red-400" : "text-yellow-300";

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Power Monitor</p>
        <span className={`text-sm ${statusColor}`}>{charging ? "Charging" : "On battery"}</span>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-gray-400 text-sm">{percentage}% remaining</p>
    </div>
  );
};

export default PowerStatus;

