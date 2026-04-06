import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTournament } from "../../lib/tournamentApi";

const SPORTS = ["Cricket","Football","Basketball","Badminton","Volleyball","Rugby"];
const FORMATS = ["Group Stage + Playoffs","Single Knockout","Round Robin League","Double Round Robin"];

const DEMO = {
  name: "Cricket Championship 2026",
  sport: "Cricket",
  format: "Group Stage + Playoffs",
  startDate: "2026-05-01",
  endDate: "2026-05-20",
  registrationDeadline: "2026-04-25",
  venue: "Main Stadium, SLIIT Malabe",
  maxTeams: "16",
  rules: "Standard ICC cricket rules apply. Each match is 20 overs.",
};

export default function CreateTournament() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", sport: "", format: "", startDate: "",
    endDate: "", registrationDeadline: "", venue: "", maxTeams: "", rules: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3) e.name = "At least 3 characters required";
    if (!form.sport) e.sport = "Select a sport";
    if (!form.format) e.format = "Select a format";
    if (!form.startDate) e.startDate = "Required";
    if (!form.endDate) e.endDate = "Required";
    else if (form.endDate <= form.startDate) e.endDate = "Must be after start date";
    if (!form.registrationDeadline) e.registrationDeadline = "Required";
    else if (form.registrationDeadline >= form.startDate) e.registrationDeadline = "Must be before start date";
    if (!form.venue || form.venue.length < 3) e.venue = "Enter a valid venue";
    if (!form.maxTeams || form.maxTeams < 2 || form.maxTeams > 64) e.maxTeams = "2 - 64 teams allowed";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setSubmitting(true);
    try {
      await createTournament(form);
      navigate("/admin/tournaments");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const input = (name) =>
    `w-full px-4 py-3 rounded-xl text-sm bg-white/5 border ${
      errors[name] ? "border-red-400" : "border-white/10"
    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`;

  return (
    <div className="min-h-screen bg-grid-pattern relative overflow-hidden">

      {/* Background Orbs */}
      <div className="orb orb-1 top-[-100px] left-[-100px]" />
      <div className="orb orb-2 bottom-[-120px] right-[-80px]" />

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-white/10 backdrop-blur-xl bg-black/30 sticky top-0 z-10">
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-gradient">U-Play</span>
        </h1>

        <button
          onClick={() => navigate("/admin/tournaments")}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ← Back
        </button>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Create <span className="text-gradient">Tournament</span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Configure tournament details professionally
            </p>
          </div>

          <button
            onClick={() => setForm(DEMO)}
            className="px-5 py-2 rounded-xl text-sm border border-blue-400/30 text-blue-400 hover:bg-blue-500/10 transition"
          >
            Fill Demo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1 */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div>
              <label className="text-sm text-gray-400">Tournament Name</label>
              <input name="name" value={form.name} onChange={handleChange} className={input("name")} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-400">Sport</label>
                <select name="sport" value={form.sport} onChange={handleChange} className={input("sport")}>
                  <option value="">Select</option>
                  {SPORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400">Format</label>
                <select name="format" value={form.format} onChange={handleChange} className={input("format")}>
                  <option value="">Select</option>
                  {FORMATS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">Venue</label>
              <input name="venue" value={form.venue} onChange={handleChange} className={input("venue")} />
            </div>

            <div>
              <label className="text-sm text-gray-400">Max Teams</label>
              <input type="number" name="maxTeams" value={form.maxTeams} onChange={handleChange} className={input("maxTeams")} />
            </div>
          </div>

          {/* Section 2 */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-6">
            <h2 className="text-lg font-semibold">Schedule</h2>

            <div className="grid grid-cols-2 gap-6">
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={input("startDate")} />
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className={input("endDate")} />
            </div>

            <input type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} className={input("registrationDeadline")} />
          </div>

          {/* Section 3 */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4">
            <h2 className="text-lg font-semibold">Rules</h2>

            <textarea
              name="rules"
              value={form.rules}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <p className="text-xs text-gray-500 text-right">
              {form.rules.length}/1000
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] transition transform shadow-lg"
          >
            {submitting ? "Creating..." : "Create Tournament"}
          </button>

        </form>
      </div>
    </div>
  );
}