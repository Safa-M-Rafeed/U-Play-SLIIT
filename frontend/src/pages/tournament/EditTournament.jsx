import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTournament, updateTournament } from "../../lib/tournamentApi";

const SPORTS = ["Cricket","Football","Basketball","Badminton","Volleyball","Rugby"];
const FORMATS = ["Group Stage + Playoffs","Single Knockout","Round Robin League","Double Round Robin"];

export default function EditTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getTournament(id);
        setForm({
          name: data.name,
          sport: data.sport,
          format: data.format,
          startDate: data.startDate?.slice(0, 10),
          endDate: data.endDate?.slice(0, 10),
          registrationDeadline: data.registrationDeadline?.slice(0, 10),
          venue: data.venue,
          maxTeams: data.maxTeams,
          rules: data.rules || "",
        });
      } catch (err) {
        alert("Failed to load: " + err.message);
      }
    };
    fetchData();
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3) e.name = "Tournament name must be at least 3 characters";
    if (!form.sport) e.sport = "Please select a sport";
    if (!form.format) e.format = "Please select a format";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.endDate) e.endDate = "End date is required";
    else if (form.endDate <= form.startDate) e.endDate = "End date must be after start date";
    if (!form.registrationDeadline) e.registrationDeadline = "Deadline is required";
    else if (form.registrationDeadline >= form.startDate) e.registrationDeadline = "Deadline must be before start date";
    if (!form.venue || form.venue.length < 3) e.venue = "Venue is required";
    if (!form.maxTeams || form.maxTeams < 2 || form.maxTeams > 64) e.maxTeams = "Must be between 2 and 64";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await updateTournament(id, form);
      navigate(`/admin/tournaments/${id}`);
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (name) =>
    `w-full bg-[#0a0f0d] border rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors ${
      errors[name] ? "border-red-400/60" : "border-white/10 focus:border-emerald-400/50"
    }`;

  if (!form) return (
    <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center">
      <p className="text-zinc-500">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f0d]">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <span className="font-bold text-2xl text-emerald-400">
          U-<span className="text-white">Play</span>
        </span>
        <button onClick={() => navigate(`/admin/tournaments/${id}`)}
          className="text-zinc-500 text-sm hover:text-white transition-colors">
          ← Back
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-bold text-3xl text-white">
            Edit <span className="text-emerald-400">tournament</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Update the tournament details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#131c16] border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-sm text-white">Basic information</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Tournament name</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputClass("name")} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Sport</label>
                <select name="sport" value={form.sport} onChange={handleChange} className={inputClass("sport")}>
                  {SPORTS.map((s) => <option key={s}>{s}</option>)}
                </select>
                {errors.sport && <p className="text-red-400 text-xs mt-1">{errors.sport}</p>}
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Format</label>
                <select name="format" value={form.format} onChange={handleChange} className={inputClass("format")}>
                  {FORMATS.map((f) => <option key={f}>{f}</option>)}
                </select>
                {errors.format && <p className="text-red-400 text-xs mt-1">{errors.format}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Venue</label>
              <input name="venue" value={form.venue} onChange={handleChange} className={inputClass("venue")} />
              {errors.venue && <p className="text-red-400 text-xs mt-1">{errors.venue}</p>}
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Maximum teams</label>
              <input name="maxTeams" type="number" value={form.maxTeams} onChange={handleChange}
                className={inputClass("maxTeams")} min="2" max="64" />
              {errors.maxTeams && <p className="text-red-400 text-xs mt-1">{errors.maxTeams}</p>}
            </div>
          </div>

          <div className="bg-[#131c16] border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-sm text-white">Schedule</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Start date</label>
                <input name="startDate" type="date" value={form.startDate}
                  onChange={handleChange} className={inputClass("startDate")} />
                {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">End date</label>
                <input name="endDate" type="date" value={form.endDate}
                  onChange={handleChange} className={inputClass("endDate")} />
                {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Registration deadline</label>
              <input name="registrationDeadline" type="date" value={form.registrationDeadline}
                onChange={handleChange} className={inputClass("registrationDeadline")} />
              {errors.registrationDeadline && <p className="text-red-400 text-xs mt-1">{errors.registrationDeadline}</p>}
            </div>
          </div>

          <div className="bg-[#131c16] border border-white/5 rounded-2xl p-6">
            <h2 className="font-bold text-sm text-white mb-4">Rules & description</h2>
            <textarea name="rules" value={form.rules} onChange={handleChange}
              rows={4} maxLength={1000}
              className="w-full bg-[#0a0f0d] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-400/50 resize-none" />
            <p className="text-zinc-600 text-xs mt-1 text-right">{form.rules.length} / 1000</p>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-emerald-400 text-[#0a0f0d] font-bold py-3.5 rounded-xl text-sm hover:bg-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}