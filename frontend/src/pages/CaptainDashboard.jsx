import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  LayoutDashboardIcon,
  UsersIcon,
  UserPlusIcon,
  ClipboardListIcon,
  CheckCircleIcon,
  TrophyIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  XCircleIcon,
} from 'lucide-react';

import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';

import TeamDashboard from './TeamDashboard';
import AddPlayerPage from './AddPlayerPage';
import TeamDetails from './TeamDetails';

const sidebarItems = [
  { icon: <LayoutDashboardIcon className='w-5 h-5' />, label: 'Dashboard', path: '/captain' },
  { icon: <UsersIcon className='w-5 h-5' />, label: 'My Team', path: '/captain/team' },
  { icon: <UserPlusIcon className='w-5 h-5' />, label: 'Players', path: '/captain/players' },
  { icon: <TrophyIcon className='w-5 h-5' />, label: 'Tournaments', path: '/captain/tournaments' },
  { icon: <ClipboardListIcon className='w-5 h-5' />, label: 'Register Tournament', path: '/captain/register-tournament' },
  { icon: <CheckCircleIcon className='w-5 h-5' />, label: 'Status', path: '/captain/status' },
];

export function CaptainDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [activePanel, setActivePanel] = useState('dashboard');
  const [loadingTeam, setLoadingTeam] = useState(false);

  const currentCaptainId =
    user?.id || user?._id || user?.email || user?.username || '';

  const fetchCaptainTeam = async () => {
    if (!currentCaptainId) return;

    try {
      setLoadingTeam(true);

      const response = await fetch(
        `http://localhost:5000/api/teams/captain/${encodeURIComponent(currentCaptainId)}`
      );

      if (response.status === 404) {
        setTeam(null);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch team');
      }

      setTeam(data);
    } catch (error) {
      console.error('Error fetching team:', error.message);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    fetchCaptainTeam();
  }, [currentCaptainId]);

  const teamMembersCount = team?.players?.length || 0;
  const tournamentsEnteredCount = team?.registrations?.length || 0;
  const approvedCount =
    team?.registrations?.filter((item) => item.status === 'Approved').length || 0;
  const pendingCount =
    team?.registrations?.filter((item) => item.status === 'Pending').length || 0;

  const teamInitials = useMemo(() => {
    if (!team?.teamName) return 'TM';
    const words = team.teamName.trim().split(' ').filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }, [team?.teamName]);

  const getRegistrationBadgeClass = (status) => {
    if (status === 'Approved') return 'bg-green-500/10 text-green-400';
    if (status === 'Rejected') return 'bg-red-500/10 text-red-400';
    return 'bg-amber-500/10 text-amber-400';
  };

  const getRegistrationIcon = (status) => {
    if (status === 'Approved') return <CheckCircleIcon className='w-4 h-4' />;
    if (status === 'Rejected') return <XCircleIcon className='w-4 h-4' />;
    return <ClockIcon className='w-4 h-4' />;
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'captain'}
      userName={user?.fullName || 'Captain'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle='Captain Dashboard'
    >
      <motion.div className='space-y-6 max-w-7xl mx-auto'>

        {/* TEAM HEADER */}
        <GlassCard className='flex items-center justify-between'>
          <div className='flex items-center gap-5'>
            <div className='w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl text-white'>
              {team?.logo ? (
                <img src={team.logo} alt='' className='w-full h-full object-cover' />
              ) : (
                teamInitials
              )}
            </div>

            <div>
              <h2 className='text-xl text-white font-bold'>
                {team?.teamName || 'No Team'}
              </h2>
              <p className='text-slate-400 text-sm'>
                {team?.sport || 'No sport selected'}
              </p>
            </div>
          </div>

          <GradientButton onClick={() => setActivePanel('editTeam')}>
            <PencilIcon className='w-4 h-4 mr-2' /> Edit Team
          </GradientButton>
        </GlassCard>

        {/* STATS */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <GlassCard>Members: {teamMembersCount}</GlassCard>
          <GlassCard>Tournaments: {tournamentsEnteredCount}</GlassCard>
          <GlassCard>Approved: {approvedCount}</GlassCard>
          <GlassCard>Pending: {pendingCount}</GlassCard>
        </div>

        {/* REGISTRATION STATUS */}
        <GlassCard>
          <h3 className='text-white mb-3'>Registrations</h3>
          <ul>
            {team?.registrations?.length ? (
              team.registrations.map((r, i) => (
                <li key={i} className='flex justify-between py-2'>
                  <span>{r.tournament}</span>
                  <span className={getRegistrationBadgeClass(r.status)}>
                    {getRegistrationIcon(r.status)} {r.status}
                  </span>
                </li>
              ))
            ) : (
              <p className='text-slate-400'>No registrations yet</p>
            )}
          </ul>
        </GlassCard>

      </motion.div>
    </DashboardLayout>
  );
}