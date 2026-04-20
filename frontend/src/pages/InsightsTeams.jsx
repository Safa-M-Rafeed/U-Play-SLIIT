import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BarChart3Icon,
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
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';
import { getAdminDashboard, getAdminTeams } from '../lib/api';

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
                <div key={team.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">No teams found for the selected sport</p>
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
