export default function HealthRing({ score }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f87171";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none"
            stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle cx="50" cy="50" r={radius} fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-2xl leading-none" style={{ color }}>
            {score}
          </span>
          <span className="text-zinc-500 text-xs mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="text-zinc-400 text-xs mt-2">Health score</span>
    </div>
  );
}