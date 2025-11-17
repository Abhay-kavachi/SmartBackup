type Notification = {
  id: string;
  message: string;
  type?: "info" | "warning" | "error";
};

type Props = {
  items: Notification[];
};

const colorMap = {
  info: "bg-blue-500/10 text-blue-300",
  warning: "bg-yellow-500/10 text-yellow-300",
  error: "bg-red-500/10 text-red-300",
};

const Notifications = ({ items }: Props) => (
  <div className="space-y-2">
    {items.map((item) => (
      <div key={item.id} className={`p-3 rounded-lg text-sm ${colorMap[item.type ?? "info"]}`}>
        {item.message}
      </div>
    ))}
    {!items.length && <p className="text-xs text-gray-500">All systems stable.</p>}
  </div>
);

export default Notifications;

