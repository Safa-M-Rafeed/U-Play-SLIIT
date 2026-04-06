import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deleteTournament } from "../../lib/tournamentApi";

export default function TournamentCard({ tournament, onRefresh }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user.role === "admin";
  const basePath = `/${user.role}`;

  const handleDelete = async () => {
    if (!isAdmin) return; // ✅ HARD BLOCK

    const confirmDelete = window.confirm("Delete this tournament?");
    if (!confirmDelete) return;

    try {
      await deleteTournament(tournament._id);
      onRefresh();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="bg-[#131c16] p-4 rounded-xl border border-white/5">

      {/* BASIC INFO */}
      <h3 className="text-white font-bold">{tournament.name}</h3>
      <p className="text-zinc-400 text-sm">{tournament.sport}</p>
      <p className="text-zinc-500 text-xs">{tournament.status}</p>

      {/* VIEW DETAILS (ALL ROLES) */}
      <button
        onClick={() => navigate(`${basePath}/tournaments/${tournament._id}`)}
        className="text-emerald-400 text-sm mt-2"
      >
        View Details
      </button>

      {/* ADMIN ONLY ACTIONS */}
      {isAdmin && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() =>
              navigate(`${basePath}/tournaments/${tournament._id}/edit`)
            }
            className="text-yellow-400 text-sm"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="text-red-400 text-sm"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}