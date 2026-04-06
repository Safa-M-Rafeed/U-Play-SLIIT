import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTournament,
  addAnnouncement,
  cloneTournament,
  deleteTournament,
} from "../../lib/tournamentApi";
import HealthRing from "../../components/tournament/HealthRing";
import ConflictAlert from "../../components/tournament/ConflictAlert";
import { useAuth } from "../../context/AuthContext";

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const basePath = `/${user?.role}`;

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState({
    title: "",
    message: "",
  });
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getTournament(id);
        setTournament(data);
      } catch (err) {
        alert("Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!isAdmin) return;

    if (!window.confirm("Delete this tournament?")) return;

    await deleteTournament(id);
    navigate(`${basePath}/tournaments`);
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (!tournament) return null;

  return (
    <div className="min-h-screen bg-[#0a0f0d] p-6">
      <button
        onClick={() => navigate(`${basePath}/tournaments`)}
        className="text-zinc-400 mb-4"
      >
        ← Back
      </button>

      <h1 className="text-white text-3xl font-bold mb-2">
        {tournament.name}
      </h1>

      <p className="text-zinc-400 mb-6">
        {tournament.sport} · {tournament.format}
      </p>

      {/* RULES */}
      {tournament.rules && (
        <div className="bg-[#131c16] p-4 rounded mb-4">
          <h2 className="text-white text-sm mb-2">
            Rules & description
          </h2>
          <p className="text-zinc-400 text-sm">
            {tournament.rules}
          </p>
        </div>
      )}

      {/* CONFLICTS (ADMIN ONLY) */}
      {isAdmin && tournament.conflicts?.length > 0 && (
        <ConflictAlert conflicts={tournament.conflicts} />
      )}

      {/* ANNOUNCEMENTS (ADMIN ONLY) */}
      {isAdmin && (
        <div className="mt-6">
          <h2 className="text-white text-sm mb-2">
            Announcements
          </h2>

          <form className="space-y-2">
            <input
              placeholder="Title"
              className="w-full p-2 bg-black text-white"
            />
            <textarea
              placeholder="Message"
              className="w-full p-2 bg-black text-white"
            />
            <button className="bg-emerald-400 px-4 py-2">
              Post
            </button>
          </form>
        </div>
      )}

      {/* ADMIN ACTIONS */}
      {isAdmin && (
        <div className="mt-6 flex gap-2">
          <button className="text-yellow-400">Edit</button>
          <button onClick={handleDelete} className="text-red-400">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}