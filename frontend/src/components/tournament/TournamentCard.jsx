import { useNavigate } from "react-router-dom";
import { cloneTournament, deleteTournament } from "../../lib/tournamentApi";

const statusStyles = {
  Ongoing: "bg-emerald-900/30 text-emerald-400 border border-emerald-400/30",
  Upcoming: "bg-amber-900/30 text-amber-400 border border-amber-400/30",
  Completed: "bg-zinc-800/50 text-zinc-400 border border-zinc-600/30",
};

const barColor = {
  Ongoing: "bg-emerald-400",
  Upcoming: "bg-amber-400",
  Completed: "bg-zinc-600",
};

export default function TournamentCard({ tournament, onRefresh }) {
  const navigate = useNavigate();

  const handleClone = async (e) => {
    e.stopPropagation();
    try {
      await cloneTournament(tournament._id);
      onRefresh();
    } catch (err) {
      alert("Clone failed: " + err.message);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${tournament.name}"?`)) return;
    try {
      await deleteTournament(tournament._id);
      onRefresh();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const regPct = Math.round(
    (tournament.registeredTeams / tournament.maxTeams) * 100
  );

  return (
    <div
      onClick={() => navigate(`/admin/tournaments/${tournament._id}`)}
      className="relative bg-[#131c16] border border-white/5 rounded-2xl p-5 cursor-pointer hover:bg-[#1a2720] hover:border-emerald-400/20 transition-all duration-200 group"
    >
      <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${
        tournament.status === "Ongoing" ? "bg-emerald-400" :
        tournament.status === "Upcoming" ? "bg-amber-400" : "bg-zinc-600"
      }`} />

      <div className="flex items-start justify-between mb-3 pl-3">
        <div className="flex-1 pr-4">
          <h3 className="font-bold text-lg text-white leading-tight">
            {tournament.name}
          </h3>
          <p className="text-zinc-400 text-xs mt-1">
            {tournament.sport} · {tournament.format}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[tournament.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            tournament.status === "Ongoing" ? "bg-emerald-400" :
            tournament.status === "Upcoming" ? "bg-amber-400" : "bg-zinc-500"
          }`} />
          {tournament.status}
        </span>
      </div>

      <div className="flex gap-4 text-xs text-zinc-500 mb-3 pl-3">
        <span>
          {new Date(tournament.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          {" – "}
          {new Date(tournament.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </span>
        <span>{tournament.venue}</span>
        <span>{tournament.registeredTeams} / {tournament.maxTeams} teams</span>
      </div>

      <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-3 mx-3">
        <div
          className={`h-full rounded-full transition-all ${barColor[tournament.status]}`}
          style={{ width: `${regPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between pl-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Health</span>
          <span className={`text-xs font-semibold ${
            tournament.healthScore >= 80 ? "text-emerald-400" :
            tournament.healthScore >= 60 ? "text-amber-400" : "text-red-400"
          }`}>{tournament.healthScore}%</span>
          {tournament.conflicts?.length > 0 && (
            <span className="bg-red-900/30 text-red-400 border border-red-400/20 text-xs px-2 py-0.5 rounded-full">
              {tournament.conflicts.length} conflict{tournament.conflicts.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/tournaments/${tournament._id}/edit`); }}
            className="text-xs px-3 py-1 rounded-lg border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 transition-colors"
          >Edit</button>
          <button onClick={handleClone}
            className="text-xs px-3 py-1 rounded-lg border border-white/10 text-zinc-400 hover:bg-white/5 transition-colors"
          >Clone</button>
          <button onClick={handleDelete}
            className="text-xs px-3 py-1 rounded-lg border border-red-400/20 text-red-400 hover:bg-red-400/10 transition-colors"
          >Delete</button>
        </div>
      </div>
    </div>
  );
}