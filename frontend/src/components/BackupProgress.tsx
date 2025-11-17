type Props = {
  value: number;
  label: string;
};

const BackupProgress = ({ value, label }: Props) => (
  <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-4 space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="font-semibold">{label}</span>
      <span className="text-gray-400">{Math.round(value)}%</span>
    </div>
    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
      <div className="h-full bg-emerald-400 transition-all" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default BackupProgress;

