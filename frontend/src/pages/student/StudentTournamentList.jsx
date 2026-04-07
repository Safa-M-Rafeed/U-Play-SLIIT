import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTournamentContext } from "../../context/TournamentContext";

export default function StudentTournamentList() {
  const navigate = useNavigate();
  const { tournaments, loading, error, fetchTournaments } = useTournamentContext();
  const [filter, setFilter] = useState("All");

  // Fetch tournaments on component mount
  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const filters = ["All", "Ongoing", "Upcoming", "Completed"];

  const filtered =
    filter === "All"
      ? tournaments
      : tournaments.filter((t) => t.status === filter);

  return (
    <div className="min-h-screen bg-[var(--color-navy)]">

      {/* 🔷 Top Header */}
      <div className="border-b border-[var(--color-border)] px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Tournaments
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Browse and participate in available tournaments
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs rounded-lg border transition ${
                filter === f
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 🔷 Content */}
      <div className="p-6">

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-[var(--color-text-muted)]">
            Loading tournaments...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16 text-red-400">
            {error}
          </div>
        )}

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {filtered.map((t) => (
            <div
              key={t._id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-blue-400/30 transition-all"
            >

              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-md font-semibold text-white">
                    {t.name}
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {t.sport}
                  </p>
                </div>

                <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-[var(--color-text-muted)]">
                  {t.status}
                </span>
              </div>

              {/* Info */}
              <div className="text-xs text-[var(--color-text-muted)] space-y-1 mb-4">
                <p>📍 {t.venue}</p>
                <p>
                  Teams: {t.registeredTeams} / {t.maxTeams}
                </p>
              </div>

              {/* Progress */}
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)]"
                  style={{
                    width: `${Math.min(
                      (t.registeredTeams / t.maxTeams) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>

              {/* Action */}
              <button 
                onClick={() => navigate(`/student/tournaments/${t._id}`)}
                className="mt-4 w-full text-xs py-2 rounded-lg border border-[var(--color-border)] text-white hover:bg-white/5 transition"
              >
                View Details
              </button>
            </div>
          ))}

        </div>

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--color-text-muted)]">
            No tournaments found.
          </div>
        )}

      </div>
    </div>
  );
}