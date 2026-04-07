import React, { useEffect, useState, useMemo } from 'react';
import {
  TrophyIcon,
  UsersIcon,
  SwordsIcon,
  ShieldCheckIcon,
  BarChart3Icon,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';
import { getAdminDashboard } from '../lib/api';

const sidebarItems = [
  { icon: <UsersIcon className="w-5 h-5" />, label: 'Users', path: '/admin' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/admin/tournaments' },
  { icon: <SwordsIcon className="w-5 h-5" />, label: 'Matches', path: '/admin/matches' },
  { icon: <ShieldCheckIcon className="w-5 h-5" />, label: 'Approvals', path: '/admin/approvals' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Insights', path: '/admin/insights' },
];

const colorMap = {
  'Cricket': '#3b82f6',
  'Football': '#10b981',
  'Basketball': '#f59e0b',
  'Volleyball': '#8b5cf6',
  'Tennis': '#ec4899',
  'Badminton': '#f97316',
  'Archery': '#6366f1',
  'Swimming': '#14b8a6',
  'Table Tennis': '#ea580c',
};

export function TournamentsInsights() {
  const { user, token } = useAuth();
  const [dashboard, setDashboard] = useState({
    stats: {
      totalUsers: 0,
      activeTournaments: 0,
      matchesPlayed: 0,
      pendingApprovals: 0
    },
    tournaments: [],
    approvals: [],
    activity: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedSportFilter, setSelectedSportFilter] = useState('all');git 

  const sportsCategoryData = useMemo(() => {
    if (!dashboard.tournaments || dashboard.tournaments.length === 0) {
      return [];
    }

    const sportCounts = dashboard.tournaments.reduce((acc, tournament) => {
      const sport = tournament.sport || 'Other';
      acc[sport] = (acc[sport] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(sportCounts).map(([sport, count]) => ({
      name: sport,
      value: count,
      color: colorMap[sport] || '#94a3b8'
    }));
  }, [dashboard.tournaments]);

  const filteredTournaments = useMemo(() => {
    if (!selectedSport) return [];
    return dashboard.tournaments.filter((tournament) => tournament.sport === selectedSport);
  }, [dashboard.tournaments, selectedSport]);

  const lineChartData = useMemo(() => {
    if (!dashboard.tournaments || dashboard.tournaments.length === 0) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const filtered = selectedSportFilter === 'all'
      ? dashboard.tournaments
      : dashboard.tournaments.filter((tournament) => tournament.sport === selectedSportFilter);

    // Group by date
    const grouped = filtered.reduce((acc, tournament) => {
      const dateStr = tournament.date ? new Date(tournament.date).toISOString().split('T')[0] : 'TBD';
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(tournament);
      return acc;
    }, {});

    // Sort dates
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      if (a === 'TBD') return 1;
      if (b === 'TBD') return -1;
      return new Date(a) - new Date(b);
    });

    // Create data points
    let cumulative = 0;
    return sortedDates.map(date => {
      const tournaments = grouped[date];
      cumulative += tournaments.length;
      const dateObj = date === 'TBD' ? null : new Date(date);
      let category = 'future';
      if (dateObj) {
        if (dateObj < today) category = 'past';
        else if (dateObj.toDateString() === today.toDateString()) category = 'present';
      }
      return {
        date: date === 'TBD' ? 'TBD' : dateObj.toLocaleDateString(),
        count: cumulative,
        category,
        tournaments: tournaments.map(t => t.name)
      };
    });
  }, [dashboard.tournaments, selectedSportFilter]);

  const availableSports = useMemo(() => {
    if (!dashboard.tournaments) return [];
    const sports = [...new Set(dashboard.tournaments.map(t => t.sport).filter(Boolean))];
    return sports.sort();
  }, [dashboard.tournaments]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await getAdminDashboard(token);
        setDashboard(data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadDashboard();
    }
  }, [token]);

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'admin'}
      userName={user?.fullName || 'Admin'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Tournaments Insights"
      showSearch={false}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <GlassCard className="border-violet-500/20">
          <div className="text-white">
            <h1 className="text-2xl font-semibold mb-2">Tournaments Insights</h1>
            <p className="text-sm text-slate-400">
              View tournament analytics and reporting here.
            </p>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <GlassCard hover>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-violet-500/15 p-3">
                <TrophyIcon className="w-5 h-5 text-violet-300" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Published Tournaments</p>
                <p className="text-3xl font-semibold text-white">{dashboard.tournaments?.length || 0}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard hover>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-sky-500/15 p-3">
                <UsersIcon className="w-5 h-5 text-sky-300" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Registered Teams</p>
                <p className="text-3xl font-semibold text-white">{dashboard.stats?.totalUsers || 0}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard hover>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-amber-500/15 p-3">
                <SwordsIcon className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Scheduled Matches</p>
                <p className="text-3xl font-semibold text-white">{dashboard.stats?.matchesPlayed || 0}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard hover>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-green-500/15 p-3">
                <ShieldCheckIcon className="w-5 h-5 text-green-300" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Tournaments</p>
                <p className="text-3xl font-semibold text-white">{dashboard.stats?.activeTournaments || 0}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <GlassCard className="border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Tournaments Over Time</h3>
              <div className="flex items-center gap-3">
                <label htmlFor="sport-filter" className="text-sm text-slate-300">Filter by sport</label>
                <select
                  id="sport-filter"
                  value={selectedSportFilter}
                  onChange={(event) => setSelectedSportFilter(event.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                >
                  <option value="all">All Sports</option>
                  {availableSports.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-slate-400">Loading chart data...</p>
              </div>
            ) : lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value, name, props) => [
                      `${value} tournaments`,
                      `Tournaments: ${props.payload.tournaments.join(', ')}`
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={(props) => {
                      const { payload } = props;
                      let color = '#3b82f6'; // future
                      if (payload.category === 'past') color = '#ef4444';
                      else if (payload.category === 'present') color = '#f59e0b';
                      return <circle {...props} fill={color} stroke={color} r={4} />;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-slate-400">No tournament data available</p>
              </div>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-slate-300">Past</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-slate-300">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-300">Future</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-white/10">
            <h3 className="text-lg font-semibold text-white mb-6">Tournaments by Sports Category</h3>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <p className="text-slate-400">Loading chart data...</p>
              </div>
            ) : sportsCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sportsCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sportsCategoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        cursor="pointer"
                        onClick={() => setSelectedSport(entry.name)}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value} tournament${value > 1 ? 's' : ''}`}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-slate-400">No tournament data available</p>
              </div>
            )}
          </GlassCard>
        </div>

        {selectedSport && (
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-white">{selectedSport} Tournaments</h2>
              <button
                onClick={() => setSelectedSport(null)}
                className="text-sm text-blue-400 hover:text-white transition-colors"
              >
                Clear Selection
              </button>
            </div>
            {filteredTournaments.length > 0 ? (
              <div className="space-y-4">
                {filteredTournaments.map((tournament) => {
                  const totalTeams = tournament.totalTeams || 0;
                  const registeredTeams = tournament.registeredTeams || 0;
                  const registrationPercentage = totalTeams > 0 ? Math.min((registeredTeams / totalTeams) * 100, 100) : 0;
                  const remainingTeams = Math.max(0, totalTeams - registeredTeams);

                  return (
                    <GlassCard key={tournament._id || tournament.name} className="border-white/10">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-400 mb-1">{tournament.date ? new Date(tournament.date).toLocaleDateString() : 'TBD'}</p>
                            <h3 className="text-lg font-semibold text-white">{tournament.name}</h3>
                          </div>
                          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-slate-500/20 text-slate-300">
                            {tournament.status || 'Unknown'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10">
                          <div>
                            <p className="text-xs text-slate-400 mb-2">Registered Teams</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-sky-400">{registeredTeams}</span>
                                <span className="text-xs text-slate-400">of {totalTeams}</span>
                              </div>
                              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-sky-400 transition-all"
                                  style={{ width: `${registrationPercentage}%` }}
                                />
                              </div>
                              <p className="text-xs text-slate-400">{registrationPercentage.toFixed(1)}% registered</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400 mb-2">Teams Breakdown</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">Registered:</span>
                                <span className="font-semibold text-sky-400">{registeredTeams}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-300">Remaining:</span>
                                <span className="font-semibold text-amber-400">{remainingTeams}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                                <span className="text-slate-300">Total Slots:</span>
                                <span className="font-semibold text-white">{totalTeams}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {tournament.matchesPlayed > 0 && (
                          <div className="pt-3 border-t border-white/10">
                            <p className="text-xs text-slate-400 mb-2">Matches Played</p>
                            <p className="text-lg font-semibold text-white">{tournament.matchesPlayed}</p>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            ) : (
              <GlassCard className="border-white/10">
                <div className="text-center py-8">
                  <p className="text-slate-400">No tournaments found for {selectedSport}</p>
                </div>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
