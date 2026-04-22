import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BarChart3Icon,
  DownloadIcon,
  XIcon,
  ShieldCheckIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';
import { getAdminDashboard, getAdminTeams } from '../lib/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const sidebarItems = [
  { icon: <UsersIcon className="w-5 h-5" />, label: 'Users', path: '/admin' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/admin/tournaments' },
  { icon: <SwordsIcon className="w-5 h-5" />, label: 'Matches', path: '/admin/matches' },
  { icon: <ShieldCheckIcon className="w-5 h-5" />, label: 'Approvals', path: '/admin/approvals' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Insights', path: '/admin/insights' },
];

const sportColors = [
  '#38bdf8',
  '#34d399',
  '#fbbf24',
  '#a78bfa',
  '#fb7185',
  '#f97316',
  '#60a5fa',
  '#14b8a6',
  '#c084fc',
  '#f43f5e',
];

export function InsightsTeams() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamLoading, setSelectedTeamLoading] = useState(false);
  const [selectedTeamError, setSelectedTeamError] = useState('');
  const [dashboard, setDashboard] = useState({
    stats: {
      totalUsers: 0,
      activeTournaments: 0,
      matchesPlayed: 0,
      pendingApprovals: 0
    },
    users: [],
    teams: [],
    tournaments: [],
    approvals: [],
    activity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [dashboardData, teamsData] = await Promise.all([
          getAdminDashboard(token),
          getAdminTeams(token)
        ]);

        setDashboard({
          ...dashboardData,
          teams: teamsData.teams || []
        });
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      setLoading(false);
      return;
    }

    loadDashboard();
  }, [token]);

  const teams = useMemo(() => {
    return (dashboard.teams || []).map((item) => ({
      ...item,
      teamLabel: item.teamName || item.teamLabel || 'Unnamed Team',
      sportLabel: (item.sport || item.sportLabel || 'Unknown').trim() || 'Unknown',
      captainName: item.captainName || item.captain || 'Unknown',
    }));
  }, [dashboard.teams]);

  const teamStats = {
    total: teams.length,
    withSport: teams.filter((item) => item.sportLabel && item.sportLabel !== 'Unknown').length,
    active: teams.filter((item) => item.status === 'Active').length,
    uniqueSports: new Set(teams.map((item) => item.sportLabel).filter(Boolean)).size,
  };

  const sportData = useMemo(() => {
    const groups = teams.reduce((acc, team) => {
      const sport = (team.sportLabel || 'Unknown').trim() || 'Unknown';
      acc[sport] = (acc[sport] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(groups).map(([name, value], index) => ({
      name,
      value,
      color: sportColors[index % sportColors.length]
    }));
  }, [teams]);

  const teamProgressData = useMemo(() => {
    return teams.slice(0, 8).map((team) => ({
      name: team.teamLabel,
      members: team.playerCount || team.profileProgress?.completed || 0,
    }));
  }, [teams]);

  const sportOptions = useMemo(() => {
    const options = Array.from(
      new Set(teams.map((team) => (team.sportLabel || 'Unknown').trim() || 'Unknown'))
    ).sort((a, b) => a.localeCompare(b));

    return ['All', ...options];
  }, [teams]);

  const filteredTeams = useMemo(() => {
    if (selectedSport === 'All') {
      return teams;
    }

    return teams.filter((team) => team.sportLabel === selectedSport);
  }, [teams, selectedSport]);

  const normalizeTeamMembers = (team) => {
    const players = Array.isArray(team?.players) ? team.players : [];

    return players.map((player, index) => ({
      id: player._id || `${team?.id || 'team'}-${index}`,
      name: player.name || 'Unknown Player',
      studentId: player.studentId || '-',
      jerseyNumber: player.jerseyNumber ?? '-',
      position: player.position || '-',
    }));
  };

  const exportTeamPdf = (team) => {
    if (!team) {
      return;
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const startX = 40;
    let cursorY = 44;
    const members = normalizeTeamMembers(team);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('Team Details Report', startX, cursorY);

    cursorY += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Generated: ${new Date().toLocaleString()}`, startX, cursorY);

    cursorY += 24;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('Team Summary', startX, cursorY);

    cursorY += 16;
    doc.setDrawColor(226, 232, 240);
    doc.line(startX, cursorY, pageWidth - startX, cursorY);
    cursorY += 20;

    const summaryRows = [
      ['Team Name', team.teamLabel],
      ['Captain', team.captainName],
      ['Sport', team.sportLabel || 'Unknown'],
      ['Status', team.status || 'Unknown'],
      ['Organization', team.organization || 'No organization'],
      ['Members', String(members.length)],
      ['Chemistry Score', `${team.chemistryScore ?? 0}%`],
      ['Joined', team.joined || 'Unknown'],
    ];

    autoTable(doc, {
      startY: cursorY,
      body: summaryRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 6,
        textColor: [15, 23, 42],
        lineColor: [226, 232, 240],
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 140 },
        1: { cellWidth: 360 },
      },
      margin: { left: startX, right: startX },
    });

    cursorY = doc.lastAutoTable.finalY + 24;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('Team Members', startX, cursorY);

    cursorY += 16;
    doc.setDrawColor(226, 232, 240);
    doc.line(startX, cursorY, pageWidth - startX, cursorY);
    cursorY += 16;

    autoTable(doc, {
      startY: cursorY,
      head: [['Name', 'Student ID', 'Jersey', 'Position']],
      body: members.length > 0
        ? members.map((member) => [
            member.name,
            member.studentId,
            String(member.jerseyNumber),
            member.position,
          ])
        : [['No players added yet.', '-', '-', '-']],
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 6,
        textColor: [15, 23, 42],
        lineColor: [226, 232, 240],
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: startX, right: startX },
    });

    const teamSlug = String(team.teamLabel || 'team').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sportSlug = String(team.sportLabel || 'sport').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const datePart = new Date().toISOString().slice(0, 10);

    doc.save(`team-${teamSlug}-${sportSlug}-${datePart}.pdf`);
  };

  const handleTeamClick = async (team) => {
    setSelectedTeam({ ...team, players: Array.isArray(team.players) ? team.players : [] });
    setSelectedTeamError('');
    setSelectedTeamLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${team.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load team details');
      }

      setSelectedTeam((currentTeam) => ({
        ...currentTeam,
        ...data,
        id: data.id || data._id || currentTeam?.id,
        teamLabel: data.teamName || currentTeam?.teamLabel || 'Unnamed Team',
        sportLabel: (data.sport || currentTeam?.sportLabel || 'Unknown').trim() || 'Unknown',
        captainName: data.captainName || data.captain || currentTeam?.captainName || 'Unknown',
        organization: data.organization || currentTeam?.organization || '',
        status: currentTeam?.status || data.status || 'Unknown',
        joined: currentTeam?.joined,
      }));
    } catch (error) {
      console.error('Failed to load team details:', error);
      setSelectedTeamError(error.message || 'Unable to load team details');
    } finally {
      setSelectedTeamLoading(false);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'admin'}
      userName={user?.fullName || 'Admin'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Team Insights"
      showSearch={false}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <GlassCard className="border-blue-500/20">
          <div className="flex items-center gap-4 text-white">
            <button
              onClick={() => navigate('/admin/insights')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Insights
            </button>
            <div>
              <h1 className="text-2xl font-semibold mb-2">Team Insights</h1>
              <p className="text-sm text-slate-400">
                Overview of captain-led teams, sports, and registrations.
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <GlassCard hover className="border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/15">
                  <UsersIcon className="w-6 h-6 text-sky-400" />
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Teams</p>
                <h2 className="text-3xl font-semibold text-white">{teamStats.total}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Registered captain teams</p>
          </GlassCard>

          <GlassCard hover className="border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/15">
                  <ShieldCheckIcon className="w-6 h-6 text-emerald-400" />
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">With Sport</p>
                <h2 className="text-3xl font-semibold text-white">{teamStats.withSport}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Teams with a linked sport</p>
          </GlassCard>

          <GlassCard hover className="border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-500/15">
                  <TrophyIcon className="w-6 h-6 text-violet-400" />
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Sports</p>
                <h2 className="text-3xl font-semibold text-white">{teamStats.uniqueSports}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Unique team sports</p>
          </GlassCard>

          <GlassCard hover className="border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15">
                  <BarChart3Icon className="w-6 h-6 text-amber-400" />
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Active Teams</p>
                <h2 className="text-3xl font-semibold text-white">{teamStats.active}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Currently active teams</p>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <GlassCard className="border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Teams by Sport</h2>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-slate-400">Loading team data...</p>
              </div>
            ) : sportData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={sportData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={55}
                    paddingAngle={3}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sportData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-slate-400">No team data available</p>
              </div>
            )}
          </GlassCard>

          <GlassCard className="border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Team Registration Progress</h2>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-slate-400">Loading progress data...</p>
              </div>
            ) : teamProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamProgressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="members" fill="#a78bfa" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-slate-400">No registration progress available</p>
              </div>
            )}
          </GlassCard>
        </div>

        <GlassCard className="border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-white">Teams</h2>
            <div className="flex items-center gap-3">
              <label htmlFor="sport-filter" className="text-sm text-slate-300">Sport</label>
              <select
                id="sport-filter"
                value={selectedSport}
                onChange={(event) => setSelectedSport(event.target.value)}
                className="bg-slate-900/80 border border-white/15 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
              >
                {sportOptions.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-400">Loading teams...</p>
            </div>
          ) : filteredTeams.length > 0 ? (
            <div className="space-y-4">
              {filteredTeams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleTeamClick(team)}
                  className="w-full text-left flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 transition-all duration-200 hover:bg-white/10 hover:border-white/20"
                >
                  <div>
                    <p className="text-white font-medium">{team.teamLabel}</p>
                    <p className="text-sm text-slate-400">Captain: {team.captainName}</p>
                    <p className="text-sm text-slate-500">Sport: {team.sportLabel || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-slate-500/20 text-slate-300">
                      {team.status}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{team.organization || 'No organization'}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">No teams found for the selected sport</p>
            </div>
          )}
        </GlassCard>
      </div>

      {selectedTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Team details</p>
                <h3 className="mt-1 text-2xl font-semibold text-white">{selectedTeam.teamLabel}</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => exportTeamPdf(selectedTeam)}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500/15 px-4 py-2 text-sm font-medium text-sky-300 transition-colors hover:bg-sky-500/25"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Export PDF
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeam(null)}
                  className="rounded-xl border border-white/10 p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Close team details"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-84px)] p-6 space-y-6">
              {selectedTeamLoading ? (
                <GlassCard className="border-white/10">
                  <p className="text-slate-300">Loading team details...</p>
                </GlassCard>
              ) : (
                <>
                  {selectedTeamError && (
                    <GlassCard className="border-red-500/20">
                      <p className="text-red-300">{selectedTeamError}</p>
                    </GlassCard>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <GlassCard className="border-white/10">
                      <p className="text-sm text-slate-400">Captain</p>
                      <p className="mt-2 text-lg font-medium text-white">{selectedTeam.captainName}</p>
                    </GlassCard>
                    <GlassCard className="border-white/10">
                      <p className="text-sm text-slate-400">Sport</p>
                      <p className="mt-2 text-lg font-medium text-white">{selectedTeam.sportLabel || 'Unknown'}</p>
                    </GlassCard>
                    <GlassCard className="border-white/10">
                      <p className="text-sm text-slate-400">Status</p>
                      <p className="mt-2 text-lg font-medium text-white">{selectedTeam.status || 'Unknown'}</p>
                    </GlassCard>
                    <GlassCard className="border-white/10">
                      <p className="text-sm text-slate-400">Members</p>
                      <p className="mt-2 text-lg font-medium text-white">{normalizeTeamMembers(selectedTeam).length}</p>
                    </GlassCard>
                  </div>

                  <GlassCard className="border-white/10">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <h4 className="text-lg font-semibold text-white">Team Members</h4>
                      <p className="text-sm text-slate-400">{normalizeTeamMembers(selectedTeam).length} listed</p>
                    </div>

                    {normalizeTeamMembers(selectedTeam).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/10 text-slate-300">
                              <th className="py-3 pr-4 font-medium">Name</th>
                              <th className="py-3 pr-4 font-medium">Student ID</th>
                              <th className="py-3 pr-4 font-medium">Jersey</th>
                              <th className="py-3 pr-4 font-medium">Position</th>
                            </tr>
                          </thead>
                          <tbody>
                            {normalizeTeamMembers(selectedTeam).map((member) => (
                              <tr key={member.id} className="border-b border-white/5 text-slate-200 last:border-b-0">
                                <td className="py-3 pr-4">{member.name}</td>
                                <td className="py-3 pr-4">{member.studentId}</td>
                                <td className="py-3 pr-4">{member.jerseyNumber}</td>
                                <td className="py-3 pr-4">{member.position}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-slate-400">No players added yet.</p>
                    )}
                  </GlassCard>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
