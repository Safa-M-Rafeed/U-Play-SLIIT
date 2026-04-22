import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3Icon,
  ShieldCheckIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
  ArrowLeftIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
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

export function InsightsUser() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({
    stats: {
      totalUsers: 0,
      activeTournaments: 0,
      matchesPlayed: 0,
      pendingApprovals: 0
    },
    users: [],
    tournaments: [],
    approvals: [],
    activity: []
  });
  const [loading, setLoading] = useState(true);

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

  const [roleFilter, setRoleFilter] = useState('All');
  const [rangeFilter, setRangeFilter] = useState('Last 6 Months');
  const [userSearch, setUserSearch] = useState('');
  const [recentRoleFilter, setRecentRoleFilter] = useState('All');
  const [recentStatusFilter, setRecentStatusFilter] = useState('All');

  const userStats = {
    total: dashboard.users.length,
    students: dashboard.users.filter(u => u.role === 'Student').length,
    captains: dashboard.users.filter(u => u.role === 'Captain').length,
    admins: dashboard.users.filter(u => u.role === 'Admin').length,
    active: dashboard.users.filter(u => u.status === 'Active').length,
  };

  const roleData = [
    { name: 'Students', value: userStats.students, color: '#10b981' },
    { name: 'Captains', value: userStats.captains, color: '#8b5cf6' }
  ];

  const parseJoinedDate = (joined) => {
    if (!joined) return null;
    const parsed = new Date(`${joined} 1`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const registrationData = useMemo(() => {
    const groups = {};

    dashboard.users.forEach((user) => {
      if (user.role !== 'Student' && user.role !== 'Captain') return;
      const date = parseJoinedDate(user.joined);
      if (!date) return;

      const monthLabel = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });

      if (!groups[monthLabel]) {
        groups[monthLabel] = {
          month: monthLabel,
          date,
          Student: 0,
          Captain: 0
        };
      }

      groups[monthLabel][user.role] += 1;
    });

    return Object.values(groups).sort((a, b) => a.date - b.date);
  }, [dashboard.users]);

  const filteredRegistrationData = useMemo(() => {
    if (rangeFilter === 'All Time') {
      return registrationData;
    }

    const monthsMap = {
      'Last 3 Months': 3,
      'Last 6 Months': 6,
      'Last 12 Months': 12
    };

    const monthsBack = monthsMap[rangeFilter] || 6;
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);

    return registrationData.filter((item) => item.date >= startDate);
  }, [registrationData, rangeFilter]);

  const showStudent = roleFilter === 'All' || roleFilter === 'Student';
  const showCaptain = roleFilter === 'All' || roleFilter === 'Captain';

  const roleOptions = ['All', 'Student', 'Captain'];
  const rangeOptions = ['Last 3 Months', 'Last 6 Months', 'Last 12 Months', 'All Time'];

  const recentRoleOptions = useMemo(() => {
    const uniqueRoles = Array.from(new Set(dashboard.users.map((item) => item.role).filter(Boolean)));
    return ['All', ...uniqueRoles.sort((a, b) => a.localeCompare(b))];
  }, [dashboard.users]);

  const recentStatusOptions = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(dashboard.users.map((item) => item.status).filter(Boolean)));
    return ['All', ...uniqueStatuses.sort((a, b) => a.localeCompare(b))];
  }, [dashboard.users]);

  const filteredRecentUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();

    return dashboard.users.filter((item) => {
      const matchesSearch =
        !term ||
        item.name?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term);

      const matchesRole = recentRoleFilter === 'All' || item.role === recentRoleFilter;
      const matchesStatus = recentStatusFilter === 'All' || item.status === recentStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [dashboard.users, userSearch, recentRoleFilter, recentStatusFilter]);

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'admin'}
      userName={user?.fullName || 'Admin'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="User Insights"
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
              <h1 className="text-2xl font-semibold mb-2">User Insights</h1>
              <p className="text-sm text-slate-400">
                Detailed analysis of platform users and their activity.
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
                <p className="text-sm text-slate-400">Total Users</p>
                <h2 className="text-3xl font-semibold text-white">{userStats.total}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">All registered users</p>
          </GlassCard>

          <GlassCard hover className="border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/15">
                  <ShieldCheckIcon className="w-6 h-6 text-emerald-400" />
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Students</p>
                <h2 className="text-3xl font-semibold text-white">{userStats.students}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Student participants</p>
          </GlassCard>

          <GlassCard hover className="border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-500/15">
                  <TrophyIcon className="w-6 h-6 text-violet-400" />
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Captains</p>
                <h2 className="text-3xl font-semibold text-white">{userStats.captains}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Team leaders</p>
          </GlassCard>

          <GlassCard hover className="border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15">
                  <BarChart3Icon className="w-6 h-6 text-amber-400" />
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Active Users</p>
                <h2 className="text-3xl font-semibold text-white">{userStats.active}</h2>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Currently active</p>
          </GlassCard>
        </div>

        <GlassCard className="border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">User Role Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                  formatter={(value, name) => [`${value}`, name]}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="border-white/10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Registrations Over Time</h2>
                <p className="text-sm text-slate-400 mt-1">Track new student and captain sign-ups by month.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 w-full sm:w-auto">
                <label className="text-sm text-slate-400">
                  Role Filter
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>{role === 'All' ? 'All Roles' : role}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-slate-400">
                  Time Range
                  <select
                    value={rangeFilter}
                    onChange={(e) => setRangeFilter(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    {rangeOptions.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="h-96">
              {filteredRegistrationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredRegistrationData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
                    <YAxis tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff' }} labelStyle={{ color: '#94a3b8' }} />
                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                    {showStudent && <Bar dataKey="Student" name="Students" fill="#10b981" />}
                    {showCaptain && <Bar dataKey="Captain" name="Captains" fill="#8b5cf6" />}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  No registration data available for the selected range.
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-white/10">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">Recent Users</h2>
              <p className="text-sm text-slate-400">Showing {filteredRecentUsers.length} users</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
              />

              <select
                value={recentRoleFilter}
                onChange={(e) => setRecentRoleFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              >
                {recentRoleOptions.map((role) => (
                  <option key={role} value={role}>{role === 'All' ? 'All Roles' : role}</option>
                ))}
              </select>

              <select
                value={recentStatusFilter}
                onChange={(e) => setRecentStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              >
                {recentStatusOptions.map((status) => (
                  <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-400">Loading user data...</p>
            </div>
          ) : filteredRecentUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredRecentUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => navigate(`/admin/insights-users/${user.id}`, { state: { user } })}
                  className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 text-left transition-all duration-200 hover:bg-white/10 hover:border-white/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-slate-500/20 text-slate-300">
                      {user.role}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{user.joined}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400">No users match the selected filters</p>
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}