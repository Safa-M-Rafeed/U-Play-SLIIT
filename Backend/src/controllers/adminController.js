import PDFDocument from 'pdfkit';
import User from '../models/User.js';
import Team from '../models/Team.js';
import Tournament from '../models/Tournament.js';
import Approval from '../models/Approval.js';
import Activity from '../models/Activity.js';

const seedTournaments = [
  {
    name: 'Inter-University Basketball Championship',
    sport: 'Basketball',
    format: 'Knockout',
    startDate: new Date('2026-03-28'),
    endDate: new Date('2026-04-05'),
    registrationDeadline: new Date('2026-03-20'),
    venue: 'Main Sports Complex',
    maxTeams: 16,
    registeredTeams: 14,
    matchesPlayed: 42,
    status: 'Ongoing'
  },
  {
    name: 'Football Premier League',
    sport: 'Football',
    format: 'League',
    startDate: new Date('2026-04-05'),
    endDate: new Date('2026-04-20'),
    registrationDeadline: new Date('2026-03-25'),
    venue: 'Football Ground A',
    maxTeams: 10,
    registeredTeams: 8,
    matchesPlayed: 28,
    status: 'Upcoming'
  },
  {
    name: 'Cricket T20 Blast',
    sport: 'Cricket',
    format: 'T20',
    startDate: new Date('2026-04-12'),
    endDate: new Date('2026-04-18'),
    registrationDeadline: new Date('2026-04-01'),
    venue: 'Cricket Stadium',
    maxTeams: 8,
    registeredTeams: 6,
    matchesPlayed: 18,
    status: 'Upcoming'
  }
];

const seedApprovals = [
  {
    title: 'Team "Thunder Hawks"',
    subtitle: 'Basketball Championship registration by Sarah Chen',
    type: 'team',
    status: 'Pending'
  },
  {
    title: 'New tournament "Badminton Open"',
    subtitle: 'Creation request by Prof. Kumar',
    type: 'tournament',
    status: 'Pending'
  }
];

const seedActivities = [
  { text: 'Admin dashboard initialized', color: 'bg-blue-500' },
  { text: 'Waiting for approval actions', color: 'bg-amber-500' }
];

const formatRelativeTime = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const getProfileCompletionFields = (user) => {
  const baseFields = [
    Boolean(user.fullName?.trim()),
    Boolean(user.email?.trim()),
    Boolean(user.phone?.trim()),
    Boolean(user.avatarUrl?.trim())
  ];

  if (user.role === 'student') {
    return [
      ...baseFields,
      Boolean(user.identifier?.trim()),
      Boolean(user.department?.trim()),
      Boolean(user.yearOfStudy?.trim()),
      Boolean(user.emergencyContact?.trim()),
      Boolean(user.sport?.trim()),
      Boolean(user.medicalClearance?.trim())
    ];
  }

  if (user.role === 'captain') {
    return [
      ...baseFields,
      Boolean(user.identifier?.trim()),
      Boolean(user.organization?.trim()),
      Boolean(user.teamName?.trim()),
      Boolean(user.sport?.trim()),
      Boolean(user.leadershipSince?.trim())
    ];
  }

  return [
    ...baseFields,
    Boolean(user.designation?.trim()),
    Boolean(user.officeLocation?.trim())
  ];
};

const getProfileProgress = (user) => {
  const fields = getProfileCompletionFields(user);
  const completed = fields.filter(Boolean).length;
  const total = fields.length;
  const missing = total - completed;

  return {
    percent: total ? Math.round((completed / total) * 100) : 0,
    completed,
    total,
    missing
  };
};

const formatUser = (user) => ({
  id: user._id,
  name: user.fullName,
  email: user.email,
  role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
  status: user.status || 'Active',
  joined: new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  }),
  avatarUrl: user.avatarUrl || '',
  teamName: user.teamName || '',
  sport: user.sport || '',
  organization: user.organization || '',
  profileProgress: getProfileProgress(user)
});

const formatCaptainTeam = (user) => ({
  id: user._id,
  captainName: user.fullName,
  teamName: user.teamName || user.fullName,
  sport: user.sport || 'Unknown',
  organization: user.organization || '',
  status: user.status || 'Active',
  joined: new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  }),
  profileProgress: getProfileProgress(user)
});

const formatTeam = (team) => ({
  id: team._id,
  teamName: team.teamName,
  captainName: team.captain,
  sport: team.sport || 'Unknown',
  playerCount: Array.isArray(team.players) ? team.players.length : 0,
  chemistryScore: team.chemistryScore || 0,
  logo: team.logo || '',
  joined: new Date(team.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  })
});

const getTournamentCapacity = (tournament) => {
  const candidates = [
    tournament.maxTeams,
    tournament.totalTeams,
    tournament.teamSlots,
    tournament.slots
  ];

  for (const candidate of candidates) {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 0;
};

const formatTournament = (tournament) => ({
  _id: tournament._id,
  name: tournament.name,
  sport: tournament.sport,
  date: tournament.date || tournament.startDate || null,
  registeredTeams: Number(tournament.registeredTeams) || 0,
  totalTeams: getTournamentCapacity(tournament),
  maxTeams: getTournamentCapacity(tournament),
  matchesPlayed: tournament.matchesPlayed || 0,
  status: tournament.status || 'Upcoming'
});

const formatApproval = (approval) => ({
  id: approval._id,
  title: approval.title,
  subtitle: approval.subtitle,
  time: formatRelativeTime(approval.createdAt),
  type: approval.type,
  status: approval.status
});

const formatActivity = (activity) => ({
  id: activity._id,
  text: activity.text,
  time: formatRelativeTime(activity.createdAt),
  color: activity.color
});

const createActivity = async (text, color = 'bg-blue-500') => {
  await Activity.create({ text, color });
};

const drawTextRow = (doc, label, value, x, y, labelWidth = 170) => {
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#64748b')
    .text(label, x, y, { width: labelWidth });

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#0f172a')
    .text(String(value ?? '-'), x + labelWidth, y, { width: 180 });
};

const ensureSpace = (doc, cursorY, requiredHeight = 80) => {
  if (cursorY + requiredHeight <= doc.page.height - 50) {
    return cursorY;
  }

  doc.addPage();
  return 50;
};

const drawSectionHeading = (doc, title, y) => {
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor('#0f172a')
    .text(title, 50, y);

  doc
    .moveTo(50, y + 22)
    .lineTo(545, y + 22)
    .lineWidth(1)
    .strokeColor('#dbe4f0')
    .stroke();

  return y + 34;
};

const ensureSeedData = async () => {
  const [tournamentCount, approvalCount, activityCount] = await Promise.all([
    Tournament.countDocuments(),
    Approval.countDocuments(),
    Activity.countDocuments()
  ]);

  if (tournamentCount === 0) {
    await Tournament.insertMany(seedTournaments);
  }

  if (approvalCount === 0) {
    await Approval.insertMany(seedApprovals);
  }

  if (activityCount === 0) {
    await Activity.insertMany(seedActivities);
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    await ensureSeedData();

    const [users, teams, tournaments, approvals, activity] = await Promise.all([
      User.find().sort({ createdAt: -1 }),
      Team.find().sort({ createdAt: -1 }),
      Tournament.find().sort({ createdAt: -1 }),
      Approval.find({ status: 'Pending' }).sort({ createdAt: -1 }),
      Activity.find().sort({ createdAt: -1 }).limit(8)
    ]);

    const activeStatuses = new Set(['Active', 'Ongoing', 'Registration Open']);

    const stats = {
      totalUsers: users.length,
      totalTeams: teams.length,
      activeTournaments: tournaments.filter((item) => activeStatuses.has(item.status)).length,
      matchesPlayed: tournaments.reduce((sum, item) => sum + (item.matchesPlayed || 0), 0),
      pendingApprovals: approvals.length
    };

    res.json({
      stats,
      users: users.map(formatUser),
      captainTeams: users.filter((user) => user.role === 'captain').map(formatCaptainTeam),
      teams: teams.map(formatTeam),
      tournaments: tournaments.map(formatTournament),
      approvals: approvals.map(formatApproval),
      activity: activity.map(formatActivity)
    });
  } catch (error) {
    console.error('getAdminDashboard error:', error);
    res.status(500).json({ message: 'Unable to load admin dashboard' });
  }
};

export const getAdminTeams = async (req, res) => {
  try {
    await ensureSeedData();

    const teams = await Team.find().sort({ createdAt: -1 });

    res.json({
      teams: teams.map(formatTeam)
    });
  } catch (error) {
    console.error('getAdminTeams error:', error);
    res.status(500).json({ message: 'Unable to load teams' });
  }
};

export const downloadAdminReport = async (req, res) => {
  try {
    await ensureSeedData();

    const [users, tournaments] = await Promise.all([
      User.find().sort({ createdAt: -1 }),
      Tournament.find().sort({ createdAt: -1 })
    ]);

    const activeStatuses = new Set(['Active', 'Ongoing', 'Registration Open']);

    const stats = {
      totalUsers: users.length,
      activeTournaments: tournaments.filter((item) => activeStatuses.has(item.status)).length,
      matchesPlayed: tournaments.reduce((sum, item) => sum + (item.matchesPlayed || 0), 0)
    };

    const reportDate = new Date().toISOString().slice(0, 10);
    const generatedAt = new Date().toLocaleString('en-US');
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Admin Report ${reportDate}`,
        Author: 'UPlay Admin Dashboard'
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="admin-report-${reportDate}.pdf"`);

    doc.pipe(res);

    doc.rect(0, 0, doc.page.width, 150).fill('#0f172a');
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(28).text('UPlay Admin Report', 50, 42);
    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor('#cbd5e1')
      .text('Operational dashboard export for users, tournaments, and platform activity.', 50, 82, {
        width: 320
      });

    doc
      .roundedRect(400, 36, 145, 74, 14)
      .fill('#1e293b');
    doc
      .fillColor('#93c5fd')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Generated', 418, 52);
    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(reportDate, 418, 68);
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#cbd5e1')
      .text(generatedAt, 418, 90, { width: 110 });

    let y = 180;
    y = drawSectionHeading(doc, 'Executive Summary', y);

    const statCards = [
      { label: 'Total Users', value: stats.totalUsers, accent: '#2563eb' },
      { label: 'Active Tournaments', value: stats.activeTournaments, accent: '#7c3aed' },
      { label: 'Matches Played', value: stats.matchesPlayed, accent: '#16a34a' }
    ];

    statCards.forEach((card, index) => {
      const x = 50 + index * 165;
      doc.roundedRect(x, y, 145, 82, 14).fill('#f8fafc');
      doc.roundedRect(x, y, 145, 6, 14).fill(card.accent);
      doc
        .fillColor('#64748b')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(card.label, x + 16, y + 22, { width: 110 });
      doc
        .fillColor('#0f172a')
        .font('Helvetica-Bold')
        .fontSize(24)
        .text(String(card.value), x + 16, y + 42, { width: 110 });
    });

    y += 110;
    y = drawSectionHeading(doc, 'User Directory', y);

    users.slice(0, 12).forEach((userItem, index) => {
      y = ensureSpace(doc, y, 66);
      doc.roundedRect(50, y, 495, 54, 12).fill(index % 2 === 0 ? '#f8fafc' : '#eef4fb');
      drawTextRow(doc, 'Name', userItem.fullName, 66, y + 12, 70);
      drawTextRow(doc, 'Role', userItem.role, 290, y + 12, 50);
      drawTextRow(doc, 'Email', userItem.email, 66, y + 30, 70);
      drawTextRow(doc, 'Status', userItem.status || 'Active', 290, y + 30, 50);
      y += 66;
    });

    if (users.length > 12) {
      y = ensureSpace(doc, y, 30);
      doc
        .font('Helvetica-Oblique')
        .fontSize(9)
        .fillColor('#64748b')
        .text(`Showing first 12 of ${users.length} users in this PDF summary.`, 50, y);
      y += 24;
    }

    y = ensureSpace(doc, y, 120);
    y = drawSectionHeading(doc, 'Tournament Snapshot', y);

    tournaments.slice(0, 8).forEach((tournament, index) => {
      y = ensureSpace(doc, y, 72);
      doc.roundedRect(50, y, 495, 60, 12).fill(index % 2 === 0 ? '#f8fafc' : '#eef4fb');
      drawTextRow(doc, 'Tournament', tournament.name, 66, y + 12, 90);
      drawTextRow(doc, 'Sport', tournament.sport, 340, y + 12, 45);
      drawTextRow(doc, 'Date', new Date(tournament.date).toLocaleDateString('en-US'), 66, y + 32, 90);
      drawTextRow(doc, 'Status', tournament.status, 340, y + 32, 45);
      y += 72;
    });

    y = ensureSpace(doc, y, 80);
    doc
      .font('Helvetica-Oblique')
      .fontSize(9)
      .fillColor('#64748b')
      .text('Generated from live MongoDB data through the admin dashboard export endpoint.', 50, y);

    doc.end();
  } catch (error) {
    console.error('downloadAdminReport error:', error);
    res.status(500).json({ message: 'Unable to generate admin report' });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid user status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await createActivity(`User ${user.fullName} status changed to ${status}`, 'bg-blue-500');

    res.json({
      message: 'User status updated successfully',
      user: formatUser(user)
    });
  } catch (error) {
    console.error('updateUserStatus error:', error);
    res.status(500).json({ message: 'Unable to update user status' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.userId);
    await createActivity(`User ${user.fullName} was deleted`, 'bg-red-500');

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ message: 'Unable to delete user' });
  }
};

export const createTournament = async (req, res) => {
  try {
    const { name, sport, date, maxTeams, registeredTeams, matchesPlayed, status } = req.body;

    if (!name || !sport || !date) {
      return res.status(400).json({ message: 'Name, sport, and date are required' });
    }

    const tournament = await Tournament.create({
      name: name.trim(),
      sport: sport.trim(),
      date,
      maxTeams: Number(maxTeams) || 0,
      registeredTeams: Number(registeredTeams) || 0,
      matchesPlayed: Number(matchesPlayed) || 0,
      status: status || 'Upcoming'
    });

    await createActivity(`Tournament ${tournament.name} was created`, 'bg-purple-500');

    res.status(201).json({
      message: 'Tournament created successfully',
      tournament: formatTournament(tournament)
    });
  } catch (error) {
    console.error('createTournament error:', error);
    res.status(500).json({ message: 'Unable to create tournament' });
  }
};

export const updateTournament = async (req, res) => {
  try {
    const { name, sport, date, maxTeams, registeredTeams, matchesPlayed, status } = req.body;

    const tournament = await Tournament.findByIdAndUpdate(
      req.params.tournamentId,
      {
        $set: {
          name: name?.trim(),
          sport: sport?.trim(),
          date,
          maxTeams: Number(maxTeams) || 0,
          registeredTeams: Number(registeredTeams) || 0,
          matchesPlayed: Number(matchesPlayed) || 0,
          status
        }
      },
      { new: true, runValidators: true }
    );

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    await createActivity(`Tournament ${tournament.name} was updated`, 'bg-amber-500');

    res.json({
      message: 'Tournament updated successfully',
      tournament: formatTournament(tournament)
    });
  } catch (error) {
    console.error('updateTournament error:', error);
    res.status(500).json({ message: 'Unable to update tournament' });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.tournamentId);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    await createActivity(`Tournament ${tournament.name} was deleted`, 'bg-red-500');

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('deleteTournament error:', error);
    res.status(500).json({ message: 'Unable to delete tournament' });
  }
};

export const updateApprovalStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }

    const approval = await Approval.findByIdAndUpdate(
      req.params.approvalId,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!approval) {
      return res.status(404).json({ message: 'Approval not found' });
    }

    await createActivity(`${approval.title} was ${status.toLowerCase()}`, status === 'Approved' ? 'bg-green-500' : 'bg-red-500');

    res.json({
      message: `Approval ${status.toLowerCase()} successfully`,
      approval: formatApproval(approval)
    });
  } catch (error) {
    console.error('updateApprovalStatus error:', error);
    res.status(500).json({ message: 'Unable to update approval status' });
  }
};
