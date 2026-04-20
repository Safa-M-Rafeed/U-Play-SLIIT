import React, { useMemo } from 'react';
import {
  ActivityIcon,
  BarChart3Icon,
  CalendarIcon,
  LayoutDashboardIcon,
  PieChartIcon,
  TrophyIcon,
  UsersIcon
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
  { icon: <LayoutDashboardIcon className="w-5 h-5" />, label: 'Dashboard', path: '/captain' },
  { icon: <UsersIcon className="w-5 h-5" />, label: 'My Team', path: '/captain/team' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/captain/tournaments' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Stats', path: '/captain/stats' }
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316'];

export function StatsCaptain() {
  const { user } = useAuth();

  const kpis = useMemo(
    () => [
      { label: 'Team Members', value: 12, accent: 'bg-sky-500/15 text-sky-300', icon: <UsersIcon className="w-5 h-5" /> },
      { label: 'Registrations', value: 6, accent: 'bg-violet-500/15 text-violet-300', icon: <TrophyIcon className="w-5 h-5" /> },
      { label: 'Matches Played', value: 24, accent: 'bg-emerald-500/15 text-emerald-300', icon: <ActivityIcon className="w-5 h-5" /> },
      { label: 'Win Rate', value: '68%', accent: 'bg-amber-500/15 text-amber-300', icon: <PieChartIcon className="w-5 h-5" /> }
    ],
    []
  );

  const performanceTrend = useMemo(
    () => [
      { month: 'Jan', wins: 3, losses: 1 },
      { month: 'Feb', wins: 4, losses: 2 },
      { month: 'Mar', wins: 5, losses: 1 },
      { month: 'Apr', wins: 3, losses: 2 },
      { month: 'May', wins: 4, losses: 2 },
      { month: 'Jun', wins: 5, losses: 1 }
    ],
    []
  );

  const registrationStatus = useMemo(
    () => [
      { name: 'Approved', value: 3 },
      { name: 'Pending', value: 2 },
      { name: 'Rejected', value: 1 }
    ],
    []
  );

  const winLossSplit = useMemo(
    () => [
      { name: 'Wins', value: 16 },
      { name: 'Losses', value: 8 }
    ],
    []
  );

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'captain'}
      userName={user?.fullName || 'Captain'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Team Stats"
      showSearch={false}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <GlassCard className="border-white/10">
          <div className="text-white">
            <h1 className="text-2xl font-semibold mb-2">Captain Stats</h1>
            <p className="text-sm text-slate-400">
              Demo analytics for the captain dashboard (dummy data).
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
              <h3 className="text-lg font-semibold text-white">Performance Trend</h3>
              <span className="text-xs text-slate-400">Wins vs losses</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="wins" stroke="#10b981" strokeWidth={2} dot />
                <Line type="monotone" dataKey="losses" stroke="#ef4444" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Win / Loss</h3>
              <span className="text-xs text-slate-400">Last 24 matches</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={winLossSplit}>
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
                  {winLossSplit.map((entry, index) => (
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
              <h3 className="text-lg font-semibold text-white">Tournament Registration Status</h3>
              <span className="text-xs text-slate-400">Dummy distribution</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={registrationStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {registrationStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} request${value === 1 ? '' : 's'}`}
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

