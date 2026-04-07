import React, { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  TrophyIcon,
  CalendarIcon,
  BarChart3Icon,
  UserIcon,
  ZapIcon,
  StarIcon,
  TargetIcon,
  TrendingUpIcon,
  MapPinIcon,
  ChevronRightIcon,
  PlayCircleIcon,
  UsersIcon
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';
import PublicTeamProfile from './PublicTeamProfile';

const sidebarItems = [
  {
    icon: <HomeIcon className="w-5 h-5" />,
    label: 'Home',
    path: '/student'
  },
  {
    icon: <TrophyIcon className="w-5 h-5" />,
    label: 'Tournaments',
    path: '/student/tournaments'
  },
  {
    icon: <CalendarIcon className="w-5 h-5" />,
    label: 'Fixtures',
    path: '/student/fixtures'
  },
  {
    icon: <BarChart3Icon className="w-5 h-5" />,
    label: 'Leaderboard',
    path: '/student/leaderboard'
  },
  {
    icon: <UserIcon className="w-5 h-5" />,
    label: 'Profile',
    path: '/profile'
  }
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard }       from '../components/ui/GlassCard';
import { GradientButton }  from '../components/ui/GradientButton';
import { useAuth }         from '../context/AuthContext';
import { getMediaUrl }     from '../lib/media';

const sidebarItems = [
  { icon: <HomeIcon    className='w-5 h-5' />, label: 'Home',        path: '/student' },
  { icon: <TrophyIcon  className='w-5 h-5' />, label: 'Tournaments', path: '/student/tournaments' },
  { icon: <CalendarIcon className='w-5 h-5'/>, label: 'Fixtures',    path: '/student/fixtures'    },
  { icon: <BarChart3Icon className='w-5 h-5'/>,label: 'Leaderboard', path: '/student/leaderboard' },
  { icon: <UserIcon    className='w-5 h-5' />, label: 'Profile',     path: '/profile'             },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function StudentDashboard() {
  const { user } = useAuth();
  const [showTeamProfiles, setShowTeamProfiles] = useState(false);
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
  });

  if (showTeamProfiles) {
    return (
      <DashboardLayout
        sidebarItems={sidebarItems}
        userRole={user?.role || 'student'}
        userName={user?.fullName || 'Student'}
        userAvatar={getMediaUrl(user?.avatarUrl)}
        pageTitle="Team Profiles"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-start">
            <button
              onClick={() => setShowTeamProfiles(false)}
              className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/10 hover:bg-white/20 transition-colors"
            >
              ← Back
            </button>
          </div>

          <PublicTeamProfile />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'student'}
      userName={user?.fullName || 'Student'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Dashboard"
    >
      <motion.div
        className="space-y-6 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Welcome Banner */}
        <motion.div variants={itemVariants}>
          <GlassCard className="border-l-4 border-l-blue-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Alex'}! 👋
              </h2>
              <p className="text-slate-400 text-sm">
                {today} • Stay on top of your game
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <GradientButton variant="outline" className="whitespace-nowrap">
                View Schedule
              </GradientButton>

              <GradientButton
                variant="primary"
                className="whitespace-nowrap"
                onClick={() => setShowTeamProfiles(true)}
              >
                <UsersIcon className="w-4 h-4 mr-2" />
                View Team Profiles
              </GradientButton>
            </div>
            <GradientButton
              variant="outline"
              className="whitespace-nowrap"
              onClick={() => navigate('/student/fixtures')}
            >
              View Schedule
            </GradientButton>
          </GlassCard>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <GlassCard hover className="flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <TrophyIcon className="w-5 h-5" />
              </div>
              <span className="flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                <TrendingUpIcon className="w-3 h-3 mr-1" /> +2
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">5</h3>
            <p className="text-sm text-slate-400">Upcoming Tournaments</p>
          </GlassCard>

          <GlassCard hover className="flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <ZapIcon className="w-5 h-5" />
              </div>
              <span className="flex items-center text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-lg">
                <span className="relative flex h-2 w-2 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Live
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">2</h3>
            <p className="text-sm text-slate-400">Live Matches</p>
          </GlassCard>

          <GlassCard hover className="flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <StarIcon className="w-5 h-5" />
              </div>
              <span className="flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                <TrendingUpIcon className="w-3 h-3 mr-1" /> +180
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">1,250</h3>
            <p className="text-sm text-slate-400">Total Points</p>
          </GlassCard>

          <GlassCard hover className="flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                <TargetIcon className="w-5 h-5" />
              </div>
              <span className="flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                <TrendingUpIcon className="w-3 h-3 mr-1" /> +5%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">72%</h3>
            <p className="text-sm text-slate-400">Win Rate</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Upcoming Tournaments</h3>
//       <button
              onClick={() => navigate('/student/tournaments')}
              className='text-sm text-blue-400 hover:text-blue-300 flex items-center transition-colors'>
              View All <ChevronRightIcon className='w-4 h-4 ml-1' />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                sport: 'Basketball',
                color: 'blue',
                name: 'Inter-University Championship',
                date: 'Mar 28',
                venue: 'Sports Complex A',
                teams: 12,
                max: 16
              },
              {
                sport: 'Football',
                color: 'green',
                name: 'Premier League Spring',
                date: 'Apr 5',
                venue: 'Main Stadium',
                teams: 8,
                max: 10
              },
              {
                sport: 'Cricket',
                color: 'amber',
                name: 'T20 Blast 2024',
                date: 'Apr 12',
                venue: 'Cricket Ground B',
                teams: 6,
                max: 8
              }
            ].map((t, i) => (
              <GlassCard key={i} hover className="flex flex-col">
                <div className="mb-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-${t.color}-500/20 text-${t.color}-400 mb-2`}
                  >
              { id: 1, sport: 'Basketball', color: 'blue',  name: 'Inter-University Championship', date: 'Mar 28', venue: 'Sports Complex A',  teams: 12, max: 16 },
              { id: 2, sport: 'Football',   color: 'green', name: 'Premier League Spring',         date: 'Apr 5',  venue: 'Main Stadium',       teams: 8,  max: 10 },
              { id: 3, sport: 'Cricket',    color: 'amber', name: 'T20 Blast 2024',                date: 'Apr 12', venue: 'Cricket Ground B',   teams: 6,  max: 8  },
            ].map((t) => (
              <GlassCard key={t.id} hover className="flex flex-col">
                <div className="mb-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-${t.color}-500/20 text-${t.color}-400 mb-2`}>
                    {t.sport}
                  </span>
                  <h4 className="text-base font-bold text-white leading-tight">{t.name}</h4>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center text-sm text-slate-400">
                    <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    {t.date}
                  </div>
                  <div className="flex items-center text-sm text-slate-400">
                    <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    {t.venue}
                    <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" /> {t.date}
                  </div>
                  <div className="flex items-center text-sm text-slate-400">
                    <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" /> {t.venue}
                  </div>
                </div>

                <div className="space-y-3 mt-auto">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Registered Teams</span>
                      <span className="text-white">{t.teams}/{t.max}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{
                          width: `${(t.teams / t.max) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  <GradientButton
                    variant="primary"
                    className="w-full py-2 text-xs"
                  >
                    Register Now
                  </GradientButton>
                        style={{ width: `${(t.teams / t.max) * 100}%` }}
                      />
                    </div>
                  </div>
                    <GradientButton
                      variant='outline'
                      className='w-full py-2 text-xs'
                      onClick={() => navigate(`/student/tournaments/${t._id || t.id}`)}>
                      View Details
                    </GradientButton>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Matches & Recent Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Live Matches */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Live Matches</h3>
              <span className="flex items-center text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                <span className="relative flex h-1.5 w-1.5 mr-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span>
                Live
              </span>
            </div>

            <div className="space-y-4">
              {[
                {
                  sport: 'Basketball',
                  t1: 'Tigers',
                  t2: 'Eagles',
                  s1: 45,
                  s2: 42,
                  period: '3rd Quarter',
                  c1: 'from-orange-500 to-red-500',
                  c2: 'from-blue-500 to-cyan-500'
                },
                {
                  sport: 'Football',
                  t1: 'Warriors',
                  t2: 'Phoenix',
                  s1: 2,
                  s2: 1,
                  period: "2nd Half • 67'",
                  c1: 'from-green-500 to-emerald-500',
                  c2: 'from-purple-500 to-pink-500'
                }
              ].map((m, i) => (
                <GlassCard key={i} hover className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-50"></div>

                { sport: 'Basketball', t1: 'Tigers',   t2: 'Eagles',  s1: 45, s2: 42, period: '3rd Quarter',    c1: 'from-orange-500 to-red-500',   c2: 'from-blue-500 to-cyan-500' },
                { sport: 'Football',   t1: 'Warriors', t2: 'Phoenix', s1: 2,  s2: 1,  period: "2nd Half • 67'", c1: 'from-green-500 to-emerald-500', c2: 'from-purple-500 to-pink-500' },
              ].map((m, i) => (
                <GlassCard key={i} hover className="relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-50" />
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{m.sport}</span>
                    <span className="text-xs font-medium text-red-400 animate-pulse">{m.period}</span>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${m.c1} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                      >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${m.c1} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {m.t1.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-white">{m.t1}</span>
                    </div>

                    <div className="flex items-center justify-center gap-4 px-4">
                      <span className="text-3xl font-bold text-white">{m.s1}</span>
                      <span className="text-sm font-medium text-slate-500">vs</span>
                      <span className="text-3xl font-bold text-white">{m.s2}</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${m.c2} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                      >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${m.c2} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                        {m.t2.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-white">{m.t2}</span>
                    </div>
                  </div>

                  <GradientButton
                    variant="outline"
                    fullWidth
                    className="py-2 text-xs border-white/10 hover:bg-white/5"
                  >
                  <GradientButton variant="outline" fullWidth className="py-2 text-xs border-white/10 hover:bg-white/5">
                    <PlayCircleIcon className="w-4 h-4 mr-1.5" /> Watch Live
                  </GradientButton>
                </GlassCard>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold text-white">Recent Results</h3>

            <GlassCard className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-4 py-3 font-medium">Match</th>
                      <th className="px-4 py-3 font-medium">Score</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium text-right">Result</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {[
                      {
                        match: 'Tigers vs Lions',
                        score: '78 - 65',
                        date: 'Mar 20',
                        res: 'W',
                        color: 'green'
                      },
                      {
                        match: 'Tigers vs Sharks',
                        score: '2 - 3',
                        date: 'Mar 18',
                        res: 'L',
                        color: 'red'
                      },
                      {
                        match: 'Tigers vs Panthers',
                        score: '112 - 98',
                        date: 'Mar 15',
                        res: 'W',
                        color: 'green'
                      },
                      {
                        match: 'Tigers vs Wolves',
                        score: '1 - 1',
                        date: 'Mar 10',
                        res: 'D',
                        color: 'amber'
                      },
                      {
                        match: 'Tigers vs Bears',
                        score: '85 - 80',
                        date: 'Mar 05',
                        res: 'W',
                        color: 'green'
                      }
                    ].map((r, i) => (
                      <tr
                        key={i}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                          {r.match}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{r.score}</td>
                        <td className="px-4 py-3 text-slate-400">{r.date}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold bg-${r.color}-500/20 text-${r.color}-400`}
                          >
                      { match: 'Tigers vs Lions',   score: '78 - 65',  date: 'Mar 20', res: 'W', color: 'green' },
                      { match: 'Tigers vs Sharks',  score: '2 - 3',    date: 'Mar 18', res: 'L', color: 'red'   },
                      { match: 'Tigers vs Panthers',score: '112 - 98', date: 'Mar 15', res: 'W', color: 'green' },
                      { match: 'Tigers vs Wolves',  score: '1 - 1',    date: 'Mar 10', res: 'D', color: 'amber' },
                      { match: 'Tigers vs Bears',   score: '85 - 80',  date: 'Mar 05', res: 'W', color: 'green' },
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{r.match}</td>
                        <td className="px-4 py-3 text-slate-300">{r.score}</td>
                        <td className="px-4 py-3 text-slate-400">{r.date}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold bg-${r.color}-500/20 text-${r.color}-400`}>
                            {r.res}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
}