import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTournament, addAnnouncement, cloneTournament, deleteTournament } from "../../lib/tournamentApi";
import HealthRing from "../../components/tournament/HealthRing";
import ConflictAlert from "../../components/tournament/ConflictAlert";

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState({ title: "", message: "" });
  const [posting, setPosting] = useState(false);
  const [annErrors, setAnnErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getTournament(id);
        setTournament(data);
      } catch (err) {
        alert("Failed to load: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAnnouncement = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!announcement.title || announcement.title.length < 3)
      errs.title = "Title must be at least 3 characters";
    if (!announcement.message || announcement.message.length < 10)
      errs.message = "Message must be at least 10 characters";
    if (Object.keys(errs).length > 0) { setAnnErrors(errs); return; }
    setPosting(true);
    try {
      const { data } = await addAnnouncement(id, announcement);
      setTournament(data);
      setAnnouncement({ title: "", message: "" });
      setAnnErrors({});
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleClone = async () => {
    try {
      await cloneTournament(id);
      navigate("/admin/tournaments");
    } catch (err) {
      alert("Clone failed: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${tournament.name}"?`)) return;
    try {
      await deleteTournament(id);
      navigate("/admin/tournaments");
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center">
      <p className="text-zinc-500">Loading...</p>
    </div>
  );
  if (!tournament) return null;

  const inputCls = (err) =>
    `w-full bg-[#0a0f0d] border rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors ${
      err ? "border-red-400/60" : "border-white/10 focus:border-emerald-400/50"
    }`;

  return (
    <div className="min-h-screen bg-[#0a0f0d]">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <span className="font-bold text-2xl text-emerald-400">
          U-<span className="text-white">Play</span>
        </span>
        <button onClick={() => navigate("/admin/tournaments")}
          className="text-zinc-500 text-sm hover:text-white transition-colors">
          ← Back to tournaments
        </button>
      </nav>

      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-bold text-3xl text-white">{tournament.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                tournament.status === "Ongoing"
                  ? "bg-emerald-900/30 text-emerald-400 border border-emerald-400/30"
                  : tournament.status === "Upcoming"
                  ? "bg-amber-900/30 text-amber-400 border border-amber-400/30"
                  : "bg-zinc-800/50 text-zinc-400 border border-zinc-600/30"
              }`}>{tournament.status}</span>
            </div>
            <p className="text-zinc-400 text-sm">
              {tournament.sport} · {tournament.format} · {tournament.venue}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/admin/tournaments/${id}/edit`)}
              className="px-4 py-2 rounded-lg border border-emerald-400/30 text-emerald-400 text-sm hover:bg-emerald-400/10 transition-colors">
              Edit
            </button>
            <button onClick={handleClone}
              className="px-4 py-2 rounded-lg border border-white/10 text-zinc-400 text-sm hover:bg-white/5 transition-colors">
              Clone
            </button>
            <button onClick={handleDelete}
              className="px-4 py-2 rounded-lg border border-red-400/20 text-red-400 text-sm hover:bg-red-400/10 transition-colors">
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Start date", val: new Date(tournament.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
                { label: "End date", val: new Date(tournament.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
                { label: "Reg. deadline", val: new Date(tournament.registrationDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) },
                { label: "Teams registered", val: `${tournament.registeredTeams} / ${tournament.maxTeams}` },
                { label: "Max teams", val: tournament.maxTeams },
                { label: "Format", val: tournament.format },
              ].map((item) => (
                <div key={item.label} className="bg-[#131c16] border border-white/5 rounded-xl p-4">
                  <p className="text-zinc-500 text-xs mb-1">{item.label}</p>
                  <p className="text-white text-sm font-medium">{item.val}</p>
                </div>
              ))}
            </div>

            {tournament.rules && (
              <div className="bg-[#131c16] border border-white/5 rounded-2xl p-5">
                <h2 className="font-bold text-sm text-white mb-3">Rules & description</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">{tournament.rules}</p>
              </div>
            )}

            {tournament.conflicts?.length > 0 && (
              <div className="bg-[#131c16] border border-white/5 rounded-2xl p-5">
                <h2 className="font-bold text-sm text-white mb-3">Conflicts detected</h2>
                <ConflictAlert conflicts={tournament.conflicts} />
              </div>
            )}

            <div className="bg-[#131c16] border border-white/5 rounded-2xl p-5">
              <h2 className="font-bold text-sm text-white mb-4">Announcements</h2>
              <form onSubmit={handleAnnouncement} className="space-y-3 mb-5">
                <div>
                  <input value={announcement.title}
                    onChange={(e) => { setAnnouncement({ ...announcement, title: e.target.value }); setAnnErrors({ ...annErrors, title: null }); }}
                    placeholder="Announcement title"
                    className={inputCls(annErrors.title)} />
                  {annErrors.title && <p className="text-red-400 text-xs mt-1">{annErrors.title}</p>}
                </div>
                <div>
                  <textarea value={announcement.message}
                    onChange={(e) => { setAnnouncement({ ...announcement, message: e.target.value }); setAnnErrors({ ...annErrors, message: null }); }}
                    placeholder="Write your announcement..." rows={3}
                    className={`${inputCls(annErrors.message)} resize-none`} />
                  {annErrors.message && <p className="text-red-400 text-xs mt-1">{annErrors.message}</p>}
                </div>
                <button type="submit" disabled={posting}
                  className="bg-emerald-400 text-[#0a0f0d] font-bold px-5 py-2 rounded-lg text-xs hover:bg-emerald-300 transition-colors disabled:opacity-50">
                  {posting ? "Posting..." : "Post announcement"}
                </button>
              </form>

              {tournament.announcements?.length === 0 && (
                <p className="text-zinc-600 text-sm">No announcements yet.</p>
              )}
              <div className="space-y-3">
                {tournament.announcements?.map((a, i) => (
                  <div key={i} className="border-l-2 border-emerald-400/30 pl-4">
                    <p className="text-white text-sm font-medium">{a.title}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">{a.message}</p>
                    <p className="text-zinc-600 text-xs mt-1">
                      {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-[#131c16] border border-white/5 rounded-2xl p-5 flex flex-col items-center">
              <h2 className="font-bold text-sm text-white mb-4 self-start">Tournament health</h2>
              <HealthRing score={tournament.healthScore} />
              <div className="w-full mt-5 space-y-2">
                {[
                  { label: "Registration rate", val: `${Math.round((tournament.registeredTeams / tournament.maxTeams) * 100)}%`, ok: tournament.registeredTeams / tournament.maxTeams >= 0.5 },
                  { label: "Conflicts", val: tournament.conflicts?.length || 0, ok: !tournament.conflicts?.length },
                  { label: "Status", val: tournament.status, ok: true },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-zinc-500">{item.label}</span>
                    <span className={`font-medium ${item.ok ? "text-emerald-400" : "text-amber-400"}`}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}