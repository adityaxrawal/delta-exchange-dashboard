export default function Loader({ progress = 0 }) {
  return (
    <div className="w-full bg-gray-200 rounded h-3">
      <div
        style={{ width: `${progress}%` }}
        className="h-3 rounded bg-blue-500 transition-all"
      ></div>
    </div>
  );
}
