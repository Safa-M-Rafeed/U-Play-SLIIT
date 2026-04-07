import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  TrophyIcon,
  CalendarIcon,
  BarChart3Icon,
  UserIcon,
  UsersIcon,
  ZapIcon,
  StarIcon,
  TargetIcon,
  ChevronRightIcon,
  PlayCircleIcon
} from 'lucide-react';

import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';

const sidebarItems = [
  { icon: <HomeIcon className="w-5 h-5" />, label: 'Home', path: '/student' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/student/tournaments' },
  { icon: <CalendarIcon className="w-5 h-5" />, label: 'Fixtures', path: '/student/fixtures' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Leaderboard', path: '/student/leaderboard' },
  { icon: <UserIcon className="w-5 h-5" />, label: 'Profile', path: '/profile' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showTeamProfiles, setShowTeamProfiles] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

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

        {/* Welcome */}
        <motion.div variants={itemVariants}>
          <GlassCard className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Student'} 👋
              </h2>
              <p className="text-slate-400 text-sm">{today}</p>
            </div>

            <div className="flex gap-3">
              <GradientButton onClick={() => navigate('/student/fixtures')}>
                View Schedule
              </GradientButton>

              <GradientButton
                variant="outline"
                onClick={() => setShowTeamProfiles(true)}
              >
                <UsersIcon className="w-4 h-4 mr-2" />
                Teams
              </GradientButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard icon={<TrophyIcon />} label="Tournaments" value="5" />
          <StatCard icon={<ZapIcon />} label="Live Matches" value="2" />
          <StatCard icon={<StarIcon />} label="Points" value="1250" />
          <StatCard icon={<TargetIcon />} label="Win Rate" value="72%" />
        </motion.div>

        {/* Tournaments */}
        <motion.div variants={itemVariants}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Upcoming Tournaments</h3>
            <button
              onClick={() => navigate('/student/tournaments')}
              className="text-blue-400 text-sm flex items-center"
            >
              View All <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((t) => (
              <GlassCard key={t}>
                <h4 className="text-white font-bold mb-2">Tournament {t}</h4>
                <p className="text-sm text-slate-400 mb-3">March 28</p>

                <GradientButton
                  className="w-full"
                  onClick={() => navigate(`/student/tournaments/${t}`)}
                >
                  View Details
                </GradientButton>
              </GlassCard>
            ))}
          </div>
        </motion.div>

        {/* Live Matches */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-bold text-white mb-4">Live Matches</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((m) => (
              <GlassCard key={m}>
                <div className="flex justify-between mb-4">
                  <span className="text-red-400 text-xs">LIVE</span>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-white">Team A</span>
                  <span className="text-xl font-bold text-white">2 : 1</span>
                  <span className="text-white">Team B</span>
                </div>

                <GradientButton className="w-full">
                  <PlayCircleIcon className="w-4 h-4 mr-2" />
                  Watch
                </GradientButton>
              </GlassCard>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}

/* Small reusable stat card */
function StatCard({ icon, label, value }) {
  return (
    <GlassCard>
      <div className="flex justify-between mb-3">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{value}</h3>
      <p className="text-sm text-slate-400">{label}</p>
    </GlassCard>
  );
}