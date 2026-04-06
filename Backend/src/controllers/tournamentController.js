import Tournament from '../models/Tournament.js';
 
// ── Conflict detection ──────────────────────────────────────────────────
const detectConflicts = async (tournament) => {
  const conflicts = [];
 
  // Venue overlap check
  const overlapping = await Tournament.find({
    _id:       { $ne: tournament._id },
    venue:     tournament.venue,
    startDate: { $lte: tournament.endDate },
    endDate:   { $gte: tournament.startDate },
  });
  if (overlapping.length > 0) {
    conflicts.push({
      type: 'venue',
      message: `Venue conflict with: ${overlapping.map(t => t.name).join(', ')}`,
      severity: 'error',
    });
  }
 
  // Exam period check
  const examStart = new Date('2026-04-15');
  const examEnd   = new Date('2026-04-30');
  if (new Date(tournament.endDate) >= examStart && new Date(tournament.startDate) <= examEnd) {
    conflicts.push({
      type: 'exam',
      message: 'Tournament overlaps with exam period (Apr 15-30)',
      severity: 'warning',
    });
  }
  return conflicts;
};
 
// ── Health score calculation ─────────────────────────────────────────────
const calcHealth = (tournament, conflicts) => {
  let score = 100;
  conflicts.forEach(c => {
    if (c.severity === 'error')   score -= 25;
    if (c.severity === 'warning') score -= 10;
  });
  if (tournament.registeredTeams / tournament.maxTeams < 0.5) score -= 10;
  return Math.max(0, score);
};
 
// ── GET /api/tournaments ─────────────────────────────────────────────────
export const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
 
// ── GET /api/tournaments/:id ──────────────────────────────────────────────
export const getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.json(tournament);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
 
// ── POST /api/tournaments ────────────────────────────────────────────────
export const createTournament = async (req, res) => {
  try {
    const tournament = new Tournament(req.body);
    const conflicts  = await detectConflicts(tournament);
    tournament.conflicts   = conflicts;
    tournament.healthScore = calcHealth(tournament, conflicts);
    const saved = await tournament.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ message: err.message }); }
};
 
// ── PUT /api/tournaments/:id ──────────────────────────────────────────────
export const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Not found' });
    Object.assign(tournament, req.body);
    const conflicts        = await detectConflicts(tournament);
    tournament.conflicts   = conflicts;
    tournament.healthScore = calcHealth(tournament, conflicts);
    const updated = await tournament.save();
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};
 
// ── DELETE /api/tournaments/:id ───────────────────────────────────────────
export const deleteTournament = async (req, res) => {
  try {
    await Tournament.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tournament deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
 
// ── POST /api/tournaments/:id/clone ──────────────────────────────────────
export const cloneTournament = async (req, res) => {
  try {
    const original = await Tournament.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Not found' });
    const cloned = new Tournament({
      ...original.toObject(),
      _id:            undefined,
      name:           `${original.name} (Copy)`,
      status:         'Upcoming',
      registeredTeams: 0,
      conflicts:      [],
      announcements:  [],
      clonedFrom:     original._id,
      createdAt:      undefined,
      updatedAt:      undefined,
    });
    const saved = await cloned.save();
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ message: err.message }); }
};
 
// ── POST /api/tournaments/generate-format ────────────────────────────────
export const generateFormat = async (req, res) => {
  const { teams, days, sport } = req.body;
  let format, matches, suggestion;
 
  if (teams <= 8 && days <= 7) {
    format  = 'Single Knockout';
    matches = teams - 1;
    const rounds = Math.ceil(Math.log2(teams));
    suggestion = `${teams} teams · ${matches} matches · ${rounds} rounds · 2 matches/day recommended`;
  } else if (teams <= 16 && days >= 10) {
    format = 'Group Stage + Playoffs';
    const groups = teams <= 8 ? 2 : teams <= 12 ? 3 : 4;
    matches = Math.round((teams * (teams / groups - 1) / 2) * groups + (groups * 2 - 1));
    suggestion = `${teams} teams in ${groups} groups · Top 2 advance · ${matches} total matches`;
  } else {
    format  = 'Round Robin League';
    matches = (teams * (teams - 1)) / 2;
    suggestion = `Every team plays each other · ${matches} total matches · ${Math.ceil(matches / days)} per day`;
  }
  res.json({ format, matches, suggestion });
};
 
// ── POST /api/tournaments/:id/announcements ───────────────────────────────
export const addAnnouncement = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Not found' });
    tournament.announcements.unshift(req.body);
    await tournament.save();
    res.json(tournament);
  } catch (err) { res.status(400).json({ message: err.message }); }
};
