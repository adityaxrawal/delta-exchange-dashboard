export default function Loader({ progress = 0 }) {
  return (
    <div className="w-full bg-card-alt rounded h-3">
      <div
        style={{ width: `${progress}%` }}
        className="h-3 rounded bg-primary transition-all"
      ></div>
    </div>
  );
}
