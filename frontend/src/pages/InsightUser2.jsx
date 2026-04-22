import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ActivityIcon,
  BarChart3Icon,
  CalendarIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
  TrophyIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';
import { getAdminDashboard } from '../lib/api';

const sidebarItems = [
  { icon: <UsersIcon className="w-5 h-5" />, label: 'Users', path: '/admin' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/admin/tournaments' },
  { icon: <ShieldCheckIcon className="w-5 h-5" />, label: 'Approvals', path: '/admin/approvals' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Insights', path: '/admin/insights' },
];

const activityColors = {
  status: '#10b981',
  deleted: '#ef4444',
  created: '#8b5cf6',
  updated: '#f59e0b',
  approved: '#22c55e',
  rejected: '#f43f5e',
  other: '#38bdf8',
};

const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getActivityType = (text = '') => {
  const value = text.toLowerCase();

  if (value.includes('status changed')) return 'status';
  if (value.includes('was deleted')) return 'deleted';
  if (value.includes('was created')) return 'created';
  if (value.includes('was updated')) return 'updated';
  if (value.includes('approved')) return 'approved';
  if (value.includes('rejected')) return 'rejected';
  return 'other';
};

const parseActivityDate = (timeLabel) => {
  if (!timeLabel) return null;

  const match = String(timeLabel).match(/(\d+)\s+(min|hour|hours|day|days) ago/i);
  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const now = new Date();

  if (unit.startsWith('min')) {
    return new Date(now.getTime() - amount * 60 * 1000);
  }

  if (unit.startsWith('hour')) {
    return new Date(now.getTime() - amount * 60 * 60 * 1000);
  }

  return new Date(now.getTime() - amount * 24 * 60 * 60 * 1000);
};

const formatFallbackTime = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const addMonths = (date, months) => {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
};

const parseJoinedMonth = (joined) => {
  if (!joined) return null;

  const parsed = new Date(`${joined} 1`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildFallbackActivities = (user) => {
  const joinedDate = parseJoinedMonth(user?.joined) || new Date();
  const completion = countProfileCompletion(user);
  const completionPercent = Math.round((completion.completed / Math.max(completion.total, 1)) * 100);
  const baseDate = new Date(joinedDate);

  return [
    {
      id: `${user?.id || 'user'}-joined`,
      text: `${user?.name || 'User'} joined the platform`,
      time: formatFallbackTime(baseDate),
      activityType: 'created',
      date: baseDate,
    },
    {
      id: `${user?.id || 'user'}-profile`,
      text: `Profile completion reached ${completionPercent}%`,
      time: formatFallbackTime(addMonths(baseDate, 1)),
      activityType: 'updated',
      date: addMonths(baseDate, 1),
    },
    {
      id: `${user?.id || 'user'}-role`,
      text: `Account role set to ${user?.role || 'Unknown'}`,
      time: formatFallbackTime(addMonths(baseDate, 2)),
      activityType: 'status',
      date: addMonths(baseDate, 2),
    },
    {
      id: `${user?.id || 'user'}-status`,
      text: `Current status is ${user?.status || 'Unknown'}`,
      time: formatFallbackTime(new Date()),
      activityType: 'status',
      date: new Date(),
    },
  ];
};

const countProfileCompletion = (user) => {
  const fields = [
    user?.name,
    user?.email,
    user?.role,
    user?.status,
    user?.joined,
    user?.avatarUrl,
    user?.teamName,
    user?.sport,
    user?.organization,
  ];

  return {
    completed: fields.filter(Boolean).length,
    total: fields.length,
  };
};

export function InsightUser2() {
  const { user: authUser, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [dashboard, setDashboard] = useState({ users: [], activity: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await getAdminDashboard(token);
        setDashboard(data);
      } catch (err) {
        console.error('Failed to load user insights:', err);
        setError(err.message || 'Unable to load user details');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [token]);

  const selectedUser = useMemo(() => {
    const fromState = location.state?.user;
    const fromDashboard = dashboard.users.find((item) => String(item.id) === String(id));
    return fromState || fromDashboard || null;
  }, [dashboard.users, id, location.state]);

  const userActivities = useMemo(() => {
    if (!selectedUser) return [];

    const name = String(selectedUser.name || '').trim();
    const email = String(selectedUser.email || '').trim();
    const tokens = [name, email].filter(Boolean);

    return (dashboard.activity || [])
      .filter((entry) => {
        const text = String(entry.text || '').toLowerCase();
        return tokens.some((tokenValue) => text.includes(tokenValue.toLowerCase()));
      })
      .map((entry) => ({
        ...entry,
        activityType: getActivityType(entry.text),
        date: parseActivityDate(entry.time),
      }));
  }, [dashboard.activity, selectedUser]);

  const fallbackActivities = useMemo(() => buildFallbackActivities(selectedUser), [selectedUser]);
  const displayActivities = userActivities.length > 0 ? userActivities : fallbackActivities;

  const activityDistribution = useMemo(() => {
    const groups = displayActivities.reduce((acc, item) => {
      acc[item.activityType] = (acc[item.activityType] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(groups).map(([name, value]) => ({
      name,
      value,
      color: activityColors[name] || activityColors.other,
    }));
  }, [displayActivities]);

  const activityTrend = useMemo(() => {
    const groups = {};

    displayActivities.forEach((item) => {
      if (!item.date) return;
      const monthLabel = item.date.toLocaleDateString('en-US', { month: 'short' });
      if (!groups[monthLabel]) {
        groups[monthLabel] = 0;
      }
      groups[monthLabel] += 1;
    });

    return monthOrder
      .filter((month) => groups[month])
      .map((month) => ({ month, activities: groups[month] }));
  }, [displayActivities]);

  const profileCompletion = useMemo(() => countProfileCompletion(selectedUser), [selectedUser]);

  const summaryCards = [
    { label: 'Activities', value: displayActivities.length, icon: <ActivityIcon className="w-5 h-5" />, accent: 'bg-sky-500/15 text-sky-300' },
    { label: 'Profile Completion', value: `${Math.round((profileCompletion.completed / Math.max(profileCompletion.total, 1)) * 100)}%`, icon: <UserIcon className="w-5 h-5" />, accent: 'bg-emerald-500/15 text-emerald-300' },
    { label: 'Role', value: selectedUser?.role || 'Unknown', icon: <ShieldCheckIcon className="w-5 h-5" />, accent: 'bg-violet-500/15 text-violet-300' },
    { label: 'Status', value: selectedUser?.status || 'Unknown', icon: <BarChart3Icon className="w-5 h-5" />, accent: 'bg-amber-500/15 text-amber-300' },
  ];

  const safeCompletionValue = Math.round((profileCompletion.completed / Math.max(profileCompletion.total, 1)) * 100);

  if (loading) {
    return (
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole={authUser?.role || 'admin'}
        userName={authUser?.fullName || 'Admin'}
        userAvatar={getMediaUrl(authUser?.avatarUrl)}
        pageTitle="User Detail"
        showSearch={false}
      >
        <div className="max-w-6xl mx-auto">
          <GlassCard className="border-white/10">
            <p className="text-slate-300">Loading user details...</p>
          </GlassCard>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !selectedUser) {
    return (
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole={authUser?.role || 'admin'}
        userName={authUser?.fullName || 'Admin'}
        userAvatar={getMediaUrl(authUser?.avatarUrl)}
        pageTitle="User Detail"
        showSearch={false}
      >
        <div className="max-w-6xl mx-auto">
          <GlassCard className="border-white/10">
            <div className="flex items-center gap-4 text-white">
              <button
                type="button"
                onClick={() => navigate('/admin/insights-users')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Users
              </button>
              <div>
                <h1 className="text-2xl font-semibold mb-2">User not found</h1>
                <p className="text-sm text-slate-400">{error || 'The selected user could not be loaded.'}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={authUser?.role || 'admin'}
      userName={authUser?.fullName || 'Admin'}
      userAvatar={getMediaUrl(authUser?.avatarUrl)}
      pageTitle="User Detail"
      showSearch={false}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <GlassCard className="border-blue-500/20">
          <div className="flex items-center gap-4 text-white">
            <button
              type="button"
              onClick={() => navigate('/admin/insights-users')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Users
            </button>
            <div>
              <h1 className="text-2xl font-semibold mb-2">{selectedUser.name}</h1>
              <p className="text-sm text-slate-400">
                {selectedUser.email} • {selectedUser.role} • Joined {selectedUser.joined}
              </p>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <GlassCard key={card.label} hover className="border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${card.accent}`}>
                    {card.icon}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">{card.label}</p>
                  <h2 className="text-2xl font-semibold text-white">{card.value}</h2>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <GlassCard className="border-white/10">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">User Activity Trend</h2>
                <p className="text-sm text-slate-400">Activity occurrences grouped by month.</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile completion</p>
                <p className="text-2xl font-semibold text-white">{safeCompletionValue}%</p>
              </div>
            </div>
            <div className="h-80">
              {activityTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} />
                    <YAxis tick={{ fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Line type="monotone" dataKey="activities" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  Activity trend data will appear once the user has more history.
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard className="border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Activity Breakdown</h2>
            <div className="h-80">
              {activityDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={55}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {activityDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  Activity breakdown will appear once more records are available.
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <GlassCard className="border-white/10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Activities</h2>
              <p className="text-sm text-slate-400">Matched admin activity feed, with profile-derived fallback events when needed.</p>
            </div>
            <div className="rounded-2xl bg-white/5 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Activities found</p>
              <p className="text-2xl font-semibold text-white">{displayActivities.length}</p>
            </div>
          </div>

          {displayActivities.length > 0 ? (
            <div className="space-y-4">
              {displayActivities.map((entry) => (
                <div key={`${entry.id}-${entry.text}`} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                    <ActivityIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium">{entry.text}</p>
                    <p className="mt-1 text-sm text-slate-400">{entry.time || 'Recently'}</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300 capitalize">
                    {entry.activityType}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </GlassCard>

        <GlassCard className="border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">Profile Snapshot</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Email</p>
              <p className="mt-2 break-words">{selectedUser.email}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Role</p>
              <p className="mt-2">{selectedUser.role}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Status</p>
              <p className="mt-2">{selectedUser.status || 'Unknown'}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}

export default InsightUser2;
