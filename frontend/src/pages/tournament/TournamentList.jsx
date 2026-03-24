import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTournaments } from "../../hooks/useTournaments";
import TournamentCard from "../../components/tournament/TournamentCard";
import { generateFormat } from "../../lib/tournamentApi";

export default function TournamentList() {
  const navigate = useNavigate();
  const { tournaments, loading, error, refetch } = useTournaments();
  const [filter, setFilter] = useState("All");
  const [fgTeams, setFgTeams] = useState("");
  const [fgDays, setFgDays] = useState("");
  const [fgSport, setFgSport] = useState("");
  const [fgResult, setFgResult] = useState(null);

  const filters = ["All", "Ongoing", "Upcoming", "Completed"];
  const filtered = filter === "All"
    ? tournaments
    : tournaments.filter((t) => t.status === filter);

  const stats = {
    active: tournaments.filter((t) => t.status === "Ongoing").length,
    upcoming: tournaments.filter((t) => t.status === "Upcoming").length,
    completed: tournaments.filter((t) => t.status === "Completed").length,
    conflicts: tournaments.reduce((acc, t) => acc + (t.conflicts?.length || 0), 0),
  };

  const handleGenerate = async () => {
    if (!fgTeams || !fgDays || !fgSport) return;
    try {
      const { data } = await generateFormat({
        teams: parseInt(fgTeams),
        days: parseInt(fgDays),
        sport: fgSport,
      });
      setFgResult(data);
    } catch (err) {
      alert("Generation failed: " + err.message);
    }
  };

  const inputCls = "w-full bg-[#0a0f0d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400/50";

  return (
    <div className="min-h-screen bg-[#0a0f0d]">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-10 bg-[#0a0f0d]/95 backdrop-blur">
        <span className="font-bold text-2xl text-emerald-400 tracking-wide">
          U-<span className="text-white">Play</span>
        </span>
        <div className="flex gap-2">
          {["Dashboard", "Tournaments", "Schedule", "Templates"].map((t) => (
            <button key={t} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              t === "Tournaments"
                ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30"
                : "text-zinc-500 hover:text-white"
            }`}
            onClick={() => t === "Dashboard" && navigate("/admin")}
            >{t}</button>
          ))}
        </div>
        <button
          onClick={() => navigate("/admin/tournaments/create")}
          className="bg-emerald-400 text-[#0a0f0d] font-bold px-5 py-2 rounded-lg text-sm hover:bg-emerald-300 transition-colors"
        >
          + New tournament
        </button>
      </nav>

      <div className="px-6 py-6">
        <div className="mb-6">
          <h1 className="font-bold text-4xl text-white leading-none tracking-tight">
            Tournament <span className="text-emerald-400">Command</span> Center
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            SLIIT Inter-University Sports · Semester 1, 2026
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Active tournaments", val: stats.active, color: "emerald" },
            { label: "Upcoming", val: stats.upcoming, color: "amber" },
            { label: "Conflicts detected", val: stats.conflicts, color: "red" },
            { label: "Completed", val: stats.completed, color: "zinc" },
          ].map((s) => (
            <div key={s.label} className="bg-[#131c16] border border-white/5 rounded-xl p-4 relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${
                s.color === "emerald" ? "bg-emerald-400" :
                s.color === "amber" ? "bg-amber-400" :
                s.color === "red" ? "bg-red-400" : "bg-zinc-600"
              }`} />
              <div className="font-bold text-3xl text-white mt-1">{s.val}</div>
              <div className="text-zinc-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="flex gap-2">
              {filters.map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filter === f
                      ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                      : "border-white/5 text-zinc-500 hover:text-white hover:border-white/10"
                  }`}>{f}
                </button>
              ))}
            </div>

            {loading && <p className="text-zinc-500 text-sm text-center py-10">Loading tournaments...</p>}
            {error && <p className="text-red-400 text-sm text-center py-10">Error: {error}</p>}
            {!loading && filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-zinc-500 text-sm mb-3">No tournaments yet.</p>
                <button
                  onClick={() => navigate("/admin/tournaments/create")}
                  className="text-emerald-400 text-sm border border-emerald-400/30 px-4 py-2 rounded-lg hover:bg-emerald-400/10 transition-colors"
                >
                  Create your first tournament
                </button>
              </div>
            )}
            {filtered.map((t) => (
              <TournamentCard key={t._id} tournament={t} onRefresh={refetch} />
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-[#131c16] border border-white/5 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="font-bold text-sm text-white">Smart format generator</h2>
                <span className="text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full">AI</span>
              </div>
              <div className="p-5 space-y-3">
                <input type="number" placeholder="Number of teams"
                  value={fgTeams} onChange={(e) => setFgTeams(e.target.value)}
                  className={inputCls} min="2" max="64" />
                <select value={fgSport} onChange={(e) => setFgSport(e.target.value)} className={inputCls}>
                  <option value="">Select sport</option>
                  {["Cricket","Football","Basketball","Badminton","Volleyball"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <input type="number" placeholder="Days available"
                  value={fgDays} onChange={(e) => setFgDays(e.target.value)}
                  className={inputCls} min="1" max="60" />
                <button onClick={handleGenerate}
                  className="w-full bg-emerald-400 text-[#0a0f0d] font-bold py-2 rounded-lg text-xs hover:bg-emerald-300 transition-colors">
                  Generate format
                </button>
                {fgResult && (
                  <div className="bg-[#0a0f0d] border border-emerald-400/20 rounded-xl p-3">
                    <p className="text-emerald-400 text-xs font-semibold mb-1">
                      Recommended: {fgResult.format}
                    </p>
                    <p className="text-zinc-400 text-xs leading-relaxed">{fgResult.suggestion}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#131c16] border border-white/5 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h2 className="font-bold text-sm text-white">Quick actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                {[
                  { icon: "+", label: "New tournament", sub: "Start from scratch", action: () => navigate("/admin/tournaments/create") },
                  { icon: "⧉", label: "Use template", sub: "Pre-built formats", action: () => {} },
                ].map((a) => (
                  <button key={a.label} onClick={a.action}
                    className="bg-[#1a2720] border border-white/5 rounded-xl p-3 text-left hover:border-emerald-400/20 hover:bg-emerald-400/5 transition-all">
                    <div className="text-base mb-1 text-emerald-400">{a.icon}</div>
                    <div className="text-xs font-medium text-white">{a.label}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{a.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}