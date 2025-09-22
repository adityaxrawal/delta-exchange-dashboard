export default function KPICard({ title, value, hint }) {
  return (
    <div className="bg-card p-6 rounded-xl shadow-lg border border-border hover:bg-card-hover transition-all duration-200">
      <div className="text-sm font-medium text-text-secondary mb-2">
        {title}
      </div>
      <div className="text-2xl font-bold text-text-primary tracking-tight">
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
