import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTournaments } from "../../hooks/useTournaments";
import TournamentCard from "../../components/tournament/TournamentCard";
import { generateFormat } from "../../lib/tournamentApi";
import { useAuth } from "../../context/AuthContext";

export default function TournamentList() {
  const navigate = useNavigate();
  const { tournaments, loading, error, refetch } = useTournaments();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  const [filter, setFilter] = useState("All");
  const [fgTeams, setFgTeams] = useState("");
  const [fgDays, setFgDays] = useState("");
  const [fgSport, setFgSport] = useState("");
  const [fgResult, setFgResult] = useState(null);

  const filters = ["All", "Ongoing", "Upcoming", "Completed"];

  const filtered =
    filter === "All"
      ? tournaments
      : tournaments.filter((t) => t.status === filter);

  const stats = {
    active: tournaments.filter((t) => t.status === "Ongoing").length,
    upcoming: tournaments.filter((t) => t.status === "Upcoming").length,
    completed: tournaments.filter((t) => t.status === "Completed").length,
    conflicts: tournaments.reduce(
      (acc, t) => acc + (t.conflicts?.length || 0),
      0
    ),
  };

  const handleGenerate = async () => {
    if (!isAdmin) return;

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

  const inputCls =
    "w-full bg-[#0a0f0d] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400/50";

  return (
    <div className="min-h-screen bg-[#0a0f0d]">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 z-10 bg-[#0a0f0d]/95 backdrop-blur">
        <span className="font-bold text-2xl text-emerald-400 tracking-wide">
          U-<span className="text-white">Play</span>
        </span>

        <div className="flex gap-2">
          {["Dashboard", "Tournaments", "Schedule", "Templates"].map((t) => (
            <button
              key={t}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                t === "Tournaments"
                  ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30"
                  : "text-zinc-500 hover:text-white"
              }`}
              onClick={() =>
                t === "Dashboard" &&
                navigate(`/${user?.role || "admin"}`)
              }
            >
              {t}
            </button>
          ))}
        </div>

        {isAdmin && (
          <button
            onClick={() => navigate("/admin/tournaments/create")}
            className="bg-emerald-400 text-[#0a0f0d] font-bold px-5 py-2 rounded-lg text-sm hover:bg-emerald-300 transition-colors"
          >
            + New tournament
          </button>
        )}
      </nav>

      <div className="px-6 py-6">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="font-bold text-4xl text-white leading-none tracking-tight">
            Tournament <span className="text-emerald-400">Command</span> Center
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            SLIIT Inter-University Sports · Semester 1, 2026
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Active tournaments", val: stats.active, color: "emerald" },
            { label: "Upcoming", val: stats.upcoming, color: "amber" },
            { label: "Conflicts detected", val: stats.conflicts, color: "red" },
            { label: "Completed", val: stats.completed, color: "zinc" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#131c16] border border-white/5 rounded-xl p-4 relative overflow-hidden"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 ${
                  s.color === "emerald"
                    ? "bg-emerald-400"
                    : s.color === "amber"
                    ? "bg-amber-400"
                    : s.color === "red"
                    ? "bg-red-400"
                    : "bg-zinc-600"
                }`}
              />
              <div className="font-bold text-3xl text-white mt-1">
                {s.val}
              </div>
              <div className="text-zinc-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="col-span-2 space-y-4">
            <div className="flex gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filter === f
                      ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                      : "border-white/5 text-zinc-500 hover:text-white hover:border-white/10"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {loading && (
              <p className="text-zinc-500 text-sm text-center py-10">
                Loading tournaments...
              </p>
            )}
            {error && (
              <p className="text-red-400 text-sm text-center py-10">
                Error: {error}
              </p>
            )}

            {filtered.map((t) => (
              <TournamentCard
                key={t._id}
                tournament={t}
                onRefresh={refetch}
              />
            ))}
          </div>

          {/* RIGHT (ADMIN ONLY) */}
          {isAdmin && (
            <div className="space-y-4">
              {/* SMART GENERATOR */}
              <div className="bg-[#131c16] border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <h2 className="font-bold text-sm text-white">
                    Smart format generator
                  </h2>
                </div>

                <div className="p-5 space-y-3">
                  <input
                    type="number"
                    placeholder="Number of teams"
                    value={fgTeams}
                    onChange={(e) => setFgTeams(e.target.value)}
                    className={inputCls}
                  />

                  <select
                    value={fgSport}
                    onChange={(e) => setFgSport(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select sport</option>
                    <option>Cricket</option>
                    <option>Football</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Days available"
                    value={fgDays}
                    onChange={(e) => setFgDays(e.target.value)}
                    className={inputCls}
                  />

                  <button
                    onClick={handleGenerate}
                    className="w-full bg-emerald-400 text-black py-2 rounded"
                  >
                    Generate format
                  </button>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="bg-[#131c16] border border-white/5 rounded-2xl p-4">
                <h2 className="text-white text-sm mb-2">Quick actions</h2>

                <button
                  onClick={() =>
                    navigate("/admin/tournaments/create")
                  }
                  className="text-emerald-400 text-sm"
                >
                  + New tournament
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}