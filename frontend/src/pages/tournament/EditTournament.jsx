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
    if (!form.name || form.name.length < 3) e.name = "Minimum 3 characters";
    if (!form.sport) e.sport = "Select a sport";
    if (!form.format) e.format = "Select a format";
    if (!form.startDate) e.startDate = "Required";
    if (!form.endDate) e.endDate = "Required";
    else if (form.endDate <= form.startDate) e.endDate = "End date must be after start date";
    if (!form.registrationDeadline) e.registrationDeadline = "Required";
    else if (form.registrationDeadline >= form.startDate) e.registrationDeadline = "Must be before start date";
    if (!form.venue || form.venue.length < 3) e.venue = "Required";
    if (!form.maxTeams || form.maxTeams < 2 || form.maxTeams > 64) e.maxTeams = "2–64 only";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

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
    `w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all ${
      errors[name]
        ? "border-red-400 focus:ring-1 focus:ring-red-400"
        : "border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
    }`;

  if (!form)
    return (
      <div className="min-h-screen flex items-center justify-center bg-grid-pattern">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-grid-pattern relative overflow-hidden">

      {/* Orbs */}
      <div className="orb orb-1 top-[-100px] left-[-100px]" />
      <div className="orb orb-2 bottom-[-100px] right-[-100px]" />

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-4 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <span className="text-2xl font-extrabold text-gradient">
          U-Play
        </span>

        <button
          onClick={() => navigate(`/admin/tournaments/${id}`)}
          className="text-sm text-zinc-400 hover:text-white transition"
        >
          ← Back
        </button>
      </nav>

      {/* FORM */}
      <div className="max-w-3xl mx-auto px-8 py-10">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">
            Edit <span className="text-gradient">Tournament</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            Update tournament details professionally
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC INFO */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">
              Basic Information
            </h2>

            <div>
              <label className="text-sm text-zinc-400">Tournament Name</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputClass("name")} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400">Sport</label>
                <select name="sport" value={form.sport} onChange={handleChange} className={inputClass("sport")}>
                  {SPORTS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-zinc-400">Format</label>
                <select name="format" value={form.format} onChange={handleChange} className={inputClass("format")}>
                  {FORMATS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400">Venue</label>
              <input name="venue" value={form.venue} onChange={handleChange} className={inputClass("venue")} />
            </div>

            <div>
              <label className="text-sm text-zinc-400">Maximum Teams</label>
              <input type="number" name="maxTeams" value={form.maxTeams} onChange={handleChange} className={inputClass("maxTeams")} />
            </div>
          </div>

          {/* SCHEDULE */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-white">
              Schedule
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400">Start Date</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputClass("startDate")} />
              </div>

              <div>
                <label className="text-sm text-zinc-400">End Date</label>
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className={inputClass("endDate")} />
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400">Registration Deadline</label>
              <input type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} className={inputClass("registrationDeadline")} />
            </div>
          </div>

          {/* RULES */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              Rules & Description
            </h2>

            <textarea
              name="rules"
              value={form.rules}
              onChange={handleChange}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />

            <p className="text-xs text-zinc-500 text-right mt-1">
              {form.rules.length}/1000
            </p>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl glow-blue transition disabled:opacity-50"
          >
            {submitting ? "Saving Changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}