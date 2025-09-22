export default function KPICard({ title, value, hint, type = "default" }) {
  const getValueColorClass = () => {
    switch (type) {
      case "profit":
        return "text-green-500";
      case "loss":
        return "text-red-500";
      default:
        return "text-text-primary";
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-lg border border-border/20 hover:bg-card-hover transition-all duration-200">
      <div className="text-sm font-medium text-text-secondary mb-2">
        {title}
      </div>
      <div
        className={`text-2xl font-bold tracking-tight ${getValueColorClass()}`}
      >
        {value}
      </div>
      {hint && (
        <div className="text-sm text-text-tertiary mt-2 font-medium">
          {hint}
        </div>
      )}
    </div>
  );
}
