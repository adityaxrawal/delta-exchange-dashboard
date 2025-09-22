export default function KPICard({ title, value, hint }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}
