import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3Icon,
  ShieldCheckIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';

const sidebarItems = [
  { icon: <UsersIcon className="w-5 h-5" />, label: 'Users', path: '/admin' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/admin/tournaments' },
  { icon: <SwordsIcon className="w-5 h-5" />, label: 'Matches', path: '/admin/matches' },
  { icon: <ShieldCheckIcon className="w-5 h-5" />, label: 'Approvals', path: '/admin/approvals' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Insights', path: '/admin/insights' },
];

const insightMetrics = [
  {
    label: 'Users',
    value: '1,284',
    icon: <UsersIcon className="w-6 h-6 text-sky-400" />,
    description: 'Active platform users',
  },
  {
    label: 'Teams',
    value: '96',
    icon: <ShieldCheckIcon className="w-6 h-6 text-emerald-400" />,
    description: 'Registered teams',
  },
  {
    label: 'Tournaments',
    value: '18',
    icon: <TrophyIcon className="w-6 h-6 text-violet-400" />,
    description: 'Ongoing events',
  },
  {
    label: 'Matches',
    value: '342',
    icon: <SwordsIcon className="w-6 h-6 text-amber-400" />,
    description: 'Matches played this season',
  },
];

export function Insights() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'admin'}
      userName={user?.fullName || 'Admin'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Insights"
      showSearch={false}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <GlassCard className="border-blue-500/20">
          <div className="text-white">
            <h1 className="text-2xl font-semibold mb-2">Admin Insights</h1>
            <p className="text-sm text-slate-400">
              Track the top metrics for your sports platform in one place.
            </p>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {insightMetrics.map((metric) => (
            <div
              key={metric.label}
              onClick={() => {
                if (metric.label === 'Tournaments') navigate('/admin/tournaments-insights');
                if (metric.label === 'Users') navigate('/admin/insights-users');
                if (metric.label === 'Teams') navigate('/admin/insights-teams');
                if (metric.label === 'Matches') navigate('/admin/insights-matches');
              }}
              className={(metric.label === 'Tournaments' || metric.label === 'Users' || metric.label === 'Teams' || metric.label === 'Matches') ? 'cursor-pointer' : ''}
            >
              <GlassCard hover className="border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10">
                      {metric.icon}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">{metric.label}</p>
                    <h2 className="text-3xl font-semibold text-white">{metric.value}</h2>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">{metric.description}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
