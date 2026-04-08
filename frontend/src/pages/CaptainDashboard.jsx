<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import React from 'react';
=======
import React, { useEffect, useMemo, useState } from 'react';
>>>>>>> ab355e2 (Updated team management component)
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboardIcon,
  ClipboardListIcon,
  PlusSquareIcon,
  FolderKanbanIcon,
  EyeIcon,
  UserPlusIcon
} from "lucide-react";

import { DashboardLayout } from "../components/layout/DashboardLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuth } from "../context/AuthContext";
import { getMediaUrl } from "../lib/media";

import CreateTeam from "./CreateTeam";
import TeamDashboard from "./TeamDashboard";
import TeamDetails from "./TeamDetails";
import AddPlayerPage from "./AddPlayerPage";
import RegisterTournamentPage from "./RegisterTournamentPage";

const sidebarItems = [
  {
    icon: <LayoutDashboardIcon className="w-5 h-5" />,
    label: "Dashboard",
    path: "/captain"
  },
  {
    icon: <ClipboardListIcon className="w-5 h-5" />,
    label: "Register Tournament",
    path: "/captain/register"
  }
];

export function CaptainDashboard() {
  const { user } = useAuth();

  const [activeView, setActiveView] = useState("dashboard");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const currentCaptainId =
    user?.id || user?._id || user?.email || user?.username || "";

  const refreshTeamFromServer = async () => {
    if (!currentCaptainId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/teams/captain/${encodeURIComponent(currentCaptainId)}`
      );

      if (response.status === 404) {
        setTeams([]);
        setSelectedTeam(null);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch team");
      }

      setTeams([data]);
      setSelectedTeam((prev) => {
        if (!prev) return data;
        return prev._id === data._id || prev.id === data._id ? data : prev;
      });
    } catch (error) {
      console.error("Error fetching captain team:", error.message);
    }
  };

  useEffect(() => {
    refreshTeamFromServer();
  }, [currentCaptainId]);

  const captainTeams = teams;

  const handleAddTeam = (team) => {
    setTeams([team]);
    setSelectedTeam(team);
    setActiveView("create");
  };

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setActiveView("details");
  };

  const handleUpdateTeam = async (updatedTeam, stayOnCurrentView = false) => {
    setTeams([updatedTeam]);
    setSelectedTeam(updatedTeam);

    if (!stayOnCurrentView) {
      setActiveView("details");
    }

    await refreshTeamFromServer();
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete team");
      }

      setTeams([]);
      setSelectedTeam(null);
      setActiveView("manage");
      alert("Team deleted successfully ✅");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleQuickAction = (actionKey) => {
    if (actionKey === "create") {
      setActiveView("create");
      return;
    }

    if (captainTeams.length === 0) {
      alert("Please create a team first");
      return;
    }

    const currentTeam = selectedTeam || captainTeams[0];
    setSelectedTeam(currentTeam);

    if (actionKey === "manage") {
      setActiveView("manage");
      return;
    }

    if (actionKey === "details") {
      setActiveView("details");
      return;
    }

    if (actionKey === "addPlayer") {
      setActiveView("addPlayer");
      return;
    }

    if (actionKey === "register") {
      setActiveView("register");
    }
  };

  const renderContent = () => {
    if (activeView === "create") {
      return <CreateTeam addTeam={handleAddTeam} />;
    }

    if (activeView === "manage") {
      return (
        <TeamDashboard
          teams={captainTeams}
          onSelectTeam={handleSelectTeam}
          onUpdateTeam={handleUpdateTeam}
          onDeleteTeam={handleDeleteTeam}
        />
      );
    }

    if (activeView === "details") {
      if (!selectedTeam) {
        return (
          <div className="text-center text-slate-300 mt-10">
            Please select your team from Manage Team.
          </div>
        );
      }

      return (
        <TeamDetails
          team={selectedTeam}
          onBack={() => setActiveView("manage")}
          onUpdateTeam={handleUpdateTeam}
        />
      );
    }

    if (activeView === "addPlayer") {
      if (!selectedTeam) {
        return (
          <div className="text-center text-slate-300 mt-10">
            Please select your team first.
          </div>
        );
      }

      return (
        <AddPlayerPage
          team={selectedTeam}
          onBack={() => setActiveView("details")}
          onUpdateTeam={handleUpdateTeam}
        />
      );
    }

    if (activeView === "register") {
      if (!selectedTeam) {
        return (
          <div className="text-center text-slate-300 mt-10">
            Please select your team first.
          </div>
        );
      }

      return <RegisterTournamentPage team={selectedTeam} />;
    }

    return (
      <GlassCard>
        <div className="text-slate-300">
          <p className="text-lg font-semibold text-white mb-2">
            Welcome to Team Management
          </p>
          <p>
            Use the action cards above to create your team, manage your team,
            view team details, add players, and use the sidebar to register for
            tournaments.
          </p>
        </div>
      </GlassCard>
    );
  };
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

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
    return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
  }, [team?.teamName]);

  const getTeamStatus = () => {
    if (!team) return 'No Team';
    if ((team.registrations?.length || 0) > 0) return 'Active';
    return 'Ready';
  };

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

  const handleUpdateTeam = async (updatedTeam) => {
    try {
      const teamId = updatedTeam._id || updatedTeam.id;

      const response = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: updatedTeam.teamName,
          sport: updatedTeam.sport,
          logo: updatedTeam.logo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update team');
      }

      setTeam(data.team);
      setActivePanel('dashboard');
      alert('Team updated successfully ✅');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete team');
      }

      setTeam(null);
      setActivePanel('dashboard');
      alert('Team deleted successfully ✅');
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePlayerAdded = async (updatedTeam) => {
    setTeam(updatedTeam);
    setActivePanel('dashboard');
    await fetchCaptainTeam();
  };

  const handleTeamDetailsUpdate = async (updatedTeam) => {
    setTeam(updatedTeam);
    await fetchCaptainTeam();
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || "captain"}
      userName={user?.fullName || user?.name || "Captain"}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle='Captain Dashboard'
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <button
            onClick={() => handleQuickAction("create")}
            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-6 text-left shadow-lg"
          >
            <div className="text-blue-400 mb-4">
              <PlusSquareIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-white">Create Team</h3>
          </button>

          <button
            onClick={() => handleQuickAction("manage")}
            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-6 text-left shadow-lg"
          >
            <div className="text-purple-400 mb-4">
              <FolderKanbanIcon className="w-7 h-7" />
      <motion.div
        className='space-y-6 max-w-7xl mx-auto'
        variants={containerVariants}
        initial='hidden'
        animate='show'
      >
        {activePanel === 'editTeam' ? (
          <motion.div variants={itemVariants}>
            <TeamDashboard
              teams={team ? [team] : []}
              onUpdateTeam={handleUpdateTeam}
              onDeleteTeam={handleDeleteTeam}
              onBack={() => setActivePanel('dashboard')}
            />
          </motion.div>
        ) : activePanel === 'addPlayer' ? (
          <motion.div variants={itemVariants}>
            <AddPlayerPage
              team={team}
              onBack={() => setActivePanel('dashboard')}
              onUpdateTeam={handlePlayerAdded}
            />
          </motion.div>
        ) : activePanel === 'teamDetails' ? (
          <motion.div variants={itemVariants}>
            <TeamDetails
              team={team}
              onBack={() => setActivePanel('dashboard')}
              onUpdateTeam={handleTeamDetailsUpdate}
            />
          </motion.div>
        ) : (
          <>
            <motion.div variants={itemVariants}>
              <GlassCard className='flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden'>
                <div className='absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none' />

<<<<<<< HEAD
        {/* Stats Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <GlassCard hover className="flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <UsersIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white">Manage Team</h3>
          </button>

          <button
            onClick={() => handleQuickAction("details")}
            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-6 text-left shadow-lg"
          >
            <div className="text-green-400 mb-4">
              <EyeIcon className="w-7 h-7" />
        {/* Player Management Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Team Roster</h3>
            <GradientButton variant="secondary" className="py-2 px-4 text-sm">
              <UserPlusIcon className="w-4 h-4 mr-2" /> Add Player
            </GradientButton>
          </div>
          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-medium">Player</th>
                    <th className="px-6 py-4 font-medium">Position</th>
                    <th className="px-6 py-4 font-medium">Jersey #</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: 'Marcus Johnson', email: 'marcus.j@uni.edu', pos: 'Guard',       num: '7',  status: 'Active',  color: 'green' },
                    { name: 'Priya Patel',    email: 'priya.p@uni.edu',  pos: 'Forward',     num: '12', status: 'Active',  color: 'green' },
                    { name: 'James Wilson',   email: 'james.w@uni.edu',  pos: 'Center',      num: '23', status: 'Injured', color: 'red'   },
                    { name: 'David Kim',      email: 'david.k@uni.edu',  pos: 'Guard',       num: '4',  status: 'Active',  color: 'green' },
                    { name: 'Michael Chang',  email: 'm.chang@uni.edu',  pos: 'Forward',     num: '15', status: 'Benched', color: 'amber' },
                    { name: 'Sarah Chen',     email: 'sarah.c@uni.edu',  pos: 'Point Guard', num: '1',  status: 'Active',  color: 'green' },
                  ].map((p, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{p.pos}</td>
                      <td className="px-6 py-4 text-slate-300 font-mono">{p.num}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${p.color}-500/10 text-${p.color}-400`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-${p.color}-400`} />
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="text-lg font-semibold text-white">Team Details</h3>
          </button>

          <button
            onClick={() => handleQuickAction("addPlayer")}
            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all p-6 text-left shadow-lg"
          >
            <div className="text-amber-400 mb-4">
              <UserPlusIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-white">Add Player</h3>
          </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Available Tournaments */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Available Tournaments</h3>
              <button
                onClick={() => navigate('/captain/tournaments')}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center transition-colors"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { id: 1, name: 'Spring Basketball Cup',  date: 'Mar 30', fee: 'Free', slots: 4 },
                { id: 2, name: 'Regional Championship',  date: 'Apr 15', fee: '$50',  slots: 2 },
              ].map((t) => (
                <GlassCard
                  key={t.id}
                  hover
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-white mb-1">{t.name}</h4>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                      <span className="flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" /> {t.date}
=======
                <div className='flex items-center gap-5 z-10 w-full'>
                  <div className='w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-500/20 flex-shrink-0 overflow-hidden'>
                    {team?.logo ? (
                      <img
                        src={team.logo}
                        alt=''
                        className='w-full h-full object-cover'
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      teamInitials
                    )}
                  </div>

                  <div className='min-w-0'>
                    <div className='flex items-center gap-3 mb-1 flex-wrap'>
                      <h2 className='text-2xl font-bold text-white'>
                        {team?.teamName || 'No Team Created'}
                      </h2>
                      <span className='px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400'>
                        {getTeamStatus()}
                      </span>
                    </div>

                    <p className='text-slate-400 text-sm mb-2'>
                      {team?.sport || 'No Sport Selected'} • Captain{' '}
                      {team?.captain || user?.fullName || 'Captain'}
                    </p>

                    <div className='flex gap-4 text-sm flex-wrap'>
                      <span className='text-slate-300'>
                        <strong className='text-white'>{teamMembersCount}</strong> Members
                      </span>
                      <span className='text-slate-300'>
                        <strong className='text-white'>{tournamentsEnteredCount}</strong>{' '}
                        Tournaments
                      </span>
                      <span className='text-slate-300'>
                        <strong className='text-white'>{team?.chemistryScore || 0}%</strong>{' '}
                        Chemistry
>>>>>>> ab355e2 (Updated team management component)
                      </span>
                    </div>
                  </div>
<<<<<<< HEAD
                //   <GradientButton
                        variant='primary'
                        className='py-2 px-4 text-sm whitespace-nowrap'
                        onClick={() => navigate(`/captain/tournaments/${t._id || t.id}`)}>
                        View & Register
                    </GradientButton>
=======
                </div>

                <div className='z-10 w-full md:w-auto'>
                  <GradientButton
                    variant='outline'
                    className='w-full md:w-auto'
                    onClick={() => {
                      if (!team) {
                        alert('Please create a team first');
                        return;
                      }
                      setActivePanel('editTeam');
                    }}
                  >
                    <PencilIcon className='w-4 h-4 mr-2' /> Edit Team
                  </GradientButton>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
            >
              <GlassCard hover className='flex flex-col'>
                <div className='flex items-start justify-between mb-4'>
                  <div className='w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400'>
                    <UsersIcon className='w-5 h-5' />
                  </div>
                </div>
                <h3 className='text-2xl font-bold text-white mb-1'>{teamMembersCount}</h3>
                <p className='text-sm text-slate-400 mb-2'>Team Members</p>
                <p className='text-xs text-blue-400 mt-auto'>Current roster</p>
              </GlassCard>

              <GlassCard hover className='flex flex-col'>
                <div className='flex items-start justify-between mb-4'>
                  <div className='w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400'>
                    <TrophyIcon className='w-5 h-5' />
                  </div>
                </div>
                <h3 className='text-2xl font-bold text-white mb-1'>{tournamentsEnteredCount}</h3>
                <p className='text-sm text-slate-400 mb-2'>Tournaments Entered</p>
                <p className='text-xs text-purple-400 mt-auto'>{pendingCount} pending</p>
              </GlassCard>

              <GlassCard hover className='flex flex-col'>
                <div className='flex items-start justify-between mb-4'>
                  <div className='w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400'>
                    <CheckCircleIcon className='w-5 h-5' />
                  </div>
                </div>
                <h3 className='text-2xl font-bold text-white mb-1'>{approvedCount}</h3>
                <p className='text-sm text-slate-400 mb-2'>Approved Entries</p>
                <p className='text-xs text-green-400 mt-auto'>Registration approvals</p>
              </GlassCard>

              <GlassCard hover className='flex flex-col'>
                <div className='flex items-start justify-between mb-4'>
                  <div className='w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400'>
                    <CalendarIcon className='w-5 h-5' />
                  </div>
                </div>
                <h3 className='text-2xl font-bold text-white mb-1'>
                  {team?.registrations?.[0]?.tournament ? 'Ready' : '--'}
                </h3>
                <p className='text-sm text-slate-400 mb-2'>Registration State</p>
                <p className='text-xs text-amber-400 mt-auto'>
                  {team?.registrations?.length ? 'Tournament added' : 'No entries yet'}
                </p>
              </GlassCard>
            </motion.div>

            <motion.div variants={itemVariants} className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-bold text-white'>Team Roster</h3>
                <GradientButton
                  variant='secondary'
                  className='py-2 px-4 text-sm'
                  onClick={() => {
                    if (!team) {
                      alert('Please create a team first');
                      return;
                    }
                    setActivePanel('addPlayer');
                  }}
                >
                  <UserPlusIcon className='w-4 h-4 mr-2' /> Add Player
                </GradientButton>
              </div>

              <GlassCard className='p-0 overflow-hidden'>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm text-left'>
                    <thead className='text-xs text-slate-400 uppercase bg-white/5 border-b border-white/5'>
                      <tr>
                        <th className='px-6 py-4 font-medium'>Player</th>
                        <th className='px-6 py-4 font-medium'>Position</th>
                        <th className='px-6 py-4 font-medium'>Jersey #</th>
                        <th className='px-6 py-4 font-medium'>Status</th>
                        <th className='px-6 py-4 font-medium text-right'>Actions</th>
                      </tr>
                    </thead>

                    <tbody className='divide-y divide-white/5'>
                      {team?.players?.length ? (
                        team.players.map((p, i) => (
                          <tr
                            key={i}
                            className='hover:bg-white/[0.02] transition-colors group'
                          >
                            <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='flex items-center gap-3'>
                                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white'>
                                  {p.name?.charAt(0) || 'P'}
                                </div>
                                <div>
                                  <div className='font-medium text-white'>{p.name}</div>
                                  <div className='text-xs text-slate-500'>
                                    {p.studentId || 'No Student ID'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className='px-6 py-4 text-slate-300'>{p.position}</td>
                            <td className='px-6 py-4 text-slate-300 font-mono'>
                              {p.jerseyNumber}
                            </td>
                            <td className='px-6 py-4'>
                              <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400'>
                                <span className='w-1.5 h-1.5 rounded-full bg-green-400' />
                                Active
                              </span>
                            </td>
                            <td className='px-6 py-4 text-right'>
                              <div className='flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                                <button
                                  className='p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors'
                                  onClick={() => {
                                    if (!team) return;
                                    setActivePanel('teamDetails');
                                  }}
                                >
                                  <PencilIcon className='w-4 h-4' />
                                </button>
                                <button
                                  className='p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors'
                                  onClick={() => {
                                    if (!team) return;
                                    setActivePanel('teamDetails');
                                  }}
                                >
                                  <TrashIcon className='w-4 h-4' />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan='5' className='px-6 py-8 text-center text-slate-400'>
                            {loadingTeam
                              ? 'Loading team roster...'
                              : 'No players added yet. Click Add Player to continue.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <motion.div variants={itemVariants} className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-bold text-white'>Available Tournaments</h3>
                  <button
                    onClick={() => navigate('/captain/tournaments')}
                    className='text-sm text-blue-400 hover:text-blue-300 flex items-center transition-colors'
                  >
                    View All
                  </button>
                </div>

                <div className='grid grid-cols-1 gap-4'>
                  {[
                    { id: 1, name: 'Spring Basketball Cup', date: 'Mar 30', fee: 'Free', slots: 4 },
                    { id: 2, name: 'Regional Championship', date: 'Apr 15', fee: '$50', slots: 2 },
                  ].map((t) => (
                    <GlassCard
                      key={t.id}
                      hover
                      className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'
                    >
                      <div>
                        <h4 className='font-bold text-white mb-1'>{t.name}</h4>
                        <div className='flex flex-wrap gap-3 text-xs text-slate-400'>
                          <span className='flex items-center'>
                            <CalendarIcon className='w-3 h-3 mr-1' /> {t.date}
                          </span>
                          <span className='text-slate-600'>•</span>
                          <span>
                            Fee: <strong className='text-slate-300'>{t.fee}</strong>
                          </span>
                          <span className='text-slate-600'>•</span>
                          <span className='text-amber-400'>{t.slots} slots left</span>
                        </div>
                      </div>

                      <GradientButton
                        variant='primary'
                        className='py-2 px-4 text-sm whitespace-nowrap'
                        onClick={() => navigate('/captain/tournaments')}
                      >
                        View & Register
                      </GradientButton>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className='space-y-4'>
                <h3 className='text-lg font-bold text-white'>Registration Status</h3>

                <GlassCard className='p-0 overflow-hidden'>
                  <ul className='divide-y divide-white/5'>
                    {team?.registrations?.length ? (
                      team.registrations.map((s, i) => (
                        <li
                          key={i}
                          className='p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors'
                        >
                          <div>
                            <h4 className='font-medium text-white text-sm mb-1'>
                              {s.tournament}
                            </h4>
                            <p className='text-xs text-slate-500'>Saved in database</p>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRegistrationBadgeClass(
                              s.status
                            )}`}
                          >
                            {getRegistrationIcon(s.status)} {s.status}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className='p-6 text-sm text-slate-400 text-center'>
                        No registrations yet.
                      </li>
                    )}
                  </ul>
>>>>>>> ab355e2 (Updated team management component)
                </GlassCard>
              </motion.div>
            </div>
<<<<<<< HEAD
          </motion.div>

          {/* Registration Status */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold text-white">Registration Status</h3>
            <GlassCard className="p-0 overflow-hidden">
              <ul className="divide-y divide-white/5">
                {[
                  { name: 'University Basketball League', date: 'Submitted Mar 10', status: 'Approved', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'green' },
                  { name: 'Summer 3v3 Tournament',        date: 'Submitted Mar 18', status: 'Pending',  icon: <ClockIcon       className="w-4 h-4" />, color: 'amber' },
                  { name: 'Inter-College Cup',            date: 'Submitted Feb 28', status: 'Rejected', icon: <XCircleIcon     className="w-4 h-4" />, color: 'red'   },
                ].map((s, i) => (
                  <li key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div>
                      <h4 className="font-medium text-white text-sm mb-1">{s.name}</h4>
                      <p className="text-xs text-slate-500">{s.date}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${s.color}-500/10 text-${s.color}-400`}>
                      {s.icon} {s.status}
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>

        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {renderContent()}
        </motion.div>
      </div>
=======
          </>
        )}
      </motion.div>
>>>>>>> ab355e2 (Updated team management component)
    </DashboardLayout>
  );
}