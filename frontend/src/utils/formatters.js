export const formatBytes = (bytes) => {
    if (!bytes)
        return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};
export const formatDate = (value) => {
    if (!value)
        return "-";
    return new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric",
    }).format(new Date(value));
};
