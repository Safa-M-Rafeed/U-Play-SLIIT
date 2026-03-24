export default function ConflictAlert({ conflicts }) {
  if (!conflicts || conflicts.length === 0) return null;
  return (
    <div className="space-y-2">
      {conflicts.map((c, i) => (
        <div key={i} className={`flex gap-3 p-3 rounded-xl border ${
          c.severity === "error"
            ? "bg-red-900/10 border-red-400/20"
            : "bg-amber-900/10 border-amber-400/20"
        }`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
            c.severity === "error"
              ? "bg-red-400/20 text-red-400"
              : "bg-amber-400/20 text-amber-400"
          }`}>
            {c.severity === "error" ? "!" : "~"}
          </div>
          <div>
            <p className="text-sm text-white font-medium capitalize">
              {c.type} conflict
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">{c.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}