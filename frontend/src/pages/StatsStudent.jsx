import React, { useMemo } from 'react';
import {
  ActivityIcon,
  BarChart3Icon,
  CalendarIcon,
  HomeIcon,
  PieChartIcon,
  TrophyIcon,
  UserIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';

const sidebarItems = [
  { icon: <HomeIcon className="w-5 h-5" />, label: 'Home', path: '/student' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/student/tournaments' },
  { icon: <CalendarIcon className="w-5 h-5" />, label: 'Fixtures', path: '/student/fixtures' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Leaderboard', path: '/student/leaderboard' },
  { icon: <ActivityIcon className="w-5 h-5" />, label: 'Stats', path: '/student/stats' },
  { icon: <UserIcon className="w-5 h-5" />, label: 'Profile', path: '/profile' }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316'];

export function StatsStudent() {
  const { user } = useAuth();

  const kpis = useMemo(
    () => [
      { label: 'Matches Played', value: 18, accent: 'bg-sky-500/15 text-sky-300', icon: <ActivityIcon className="w-5 h-5" /> },
      { label: 'Win Rate', value: '61%', accent: 'bg-emerald-500/15 text-emerald-300', icon: <BarChart3Icon className="w-5 h-5" /> },
      { label: 'Tournaments Joined', value: 5, accent: 'bg-violet-500/15 text-violet-300', icon: <TrophyIcon className="w-5 h-5" /> },
      { label: 'Best Sport Rank', value: '#3', accent: 'bg-amber-500/15 text-amber-300', icon: <PieChartIcon className="w-5 h-5" /> }
    ],
    []
  );

  const activityData = useMemo(
    () => [
      { month: 'Jan', matches: 2, points: 120 },
      { month: 'Feb', matches: 3, points: 180 },
      { month: 'Mar', matches: 5, points: 260 },
      { month: 'Apr', matches: 4, points: 230 },
      { month: 'May', matches: 2, points: 140 },
      { month: 'Jun', matches: 2, points: 160 }
    ],
    []
  );

  const resultBreakdown = useMemo(
    () => [
      { name: 'Wins', value: 11 },
      { name: 'Draws', value: 2 },
      { name: 'Losses', value: 5 }
    ],
    []
  );

  const sportSplit = useMemo(
    () => [
      { name: 'Football', value: 8 },
      { name: 'Basketball', value: 5 },
      { name: 'Cricket', value: 3 },
      { name: 'Volleyball', value: 2 }
    ],
    []
  );

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'student'}
      userName={user?.fullName || 'Student'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Stats"
      showSearch={false}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <GlassCard className="border-white/10">
          <div className="text-white">
            <h1 className="text-2xl font-semibold mb-2">Your Stats</h1>
            <p className="text-sm text-slate-400">
              Demo analytics for the student dashboard (dummy data).
            </p>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <GlassCard key={kpi.label} hover className="border-white/10">
              <div className="flex items-center gap-4">
                <div className={`rounded-2xl p-3 ${kpi.accent}`}>
                  {kpi.icon}
                </div>
                <div>
                  <p className="text-sm text-slate-400">{kpi.label}</p>
                  <p className="text-3xl font-semibold text-white">{kpi.value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Monthly Activity</h3>
              <span className="text-xs text-slate-400">Matches & points</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="matches" stroke="#3b82f6" strokeWidth={2} dot />
                <Line type="monotone" dataKey="points" stroke="#10b981" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Results Breakdown</h3>
              <span className="text-xs text-slate-400">Last 18 matches</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={resultBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {resultBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <GlassCard className="border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Sport Participation</h3>
              <span className="text-xs text-slate-400">Dummy distribution</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sportSplit}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {sportSplit.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} match${value === 1 ? '' : 'es'}`}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

