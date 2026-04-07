import React from 'react';
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
  XCircleIcon } from
'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';
const sidebarItems = [
{
  icon: <LayoutDashboardIcon className="w-5 h-5" />,
  label: 'Dashboard',
  path: '/captain'
},
{
  icon: <UsersIcon className="w-5 h-5" />,
  label: 'My Team',
  path: '/captain/team'
},
{
  icon: <UserPlusIcon className="w-5 h-5" />,
  label: 'Players',
  path: '/captain/players'
},
{
  icon: <ClipboardListIcon className="w-5 h-5" />,
  label: 'Register Tournament',
  path: '/captain/register'
},
{
  icon: <CheckCircleIcon className="w-5 h-5" />,
  label: 'Status',
  path: '/captain/status'
}];

const containerVariants = {
  hidden: {
    opacity: 0
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};
export default function CaptainDashboard() {
  const { user } = useAuth();
  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'captain'}
      userName={user?.fullName || 'Captain'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Captain Dashboard">
      
      <motion.div
        className="space-y-6 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show">
        
        {/* Team Overview Card */}
        <motion.div variants={itemVariants}>
          <GlassCard className="flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="flex items-center gap-5 z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
                TH
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white">
                    Thunder Hawks
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400">
                    Active
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-2">
                  Basketball • Established Sep 2024
                </p>
                <div className="flex gap-4 text-sm">
                  <span className="text-slate-300">
                    <strong className="text-white">12</strong> Members
                  </span>
                  <span className="text-slate-300">
                    <strong className="text-white">4</strong> Tournaments
                  </span>
                  <span className="text-slate-300">
                    <strong className="text-white">75%</strong> Win Rate
                  </span>
                </div>
              </div>
            </div>

            <div className="z-10 w-full md:w-auto">
              <GradientButton variant="outline" className="w-full md:w-auto">
                <PencilIcon className="w-4 h-4 mr-2" /> Edit Team
              </GradientButton>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <GlassCard hover className="flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <UsersIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">12</h3>
            <p className="text-sm text-slate-400 mb-2">Team Members</p>
            <p className="text-xs text-blue-400 mt-auto">2 new this month</p>
          </GlassCard>

          <GlassCard hover className="flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                <TrophyIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">4</h3>
            <p className="text-sm text-slate-400 mb-2">Tournaments Entered</p>
            <p className="text-xs text-purple-400 mt-auto">1 upcoming</p>
          </GlassCard>

          <GlassCard hover className="flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">18</h3>
            <p className="text-sm text-slate-400 mb-2">Total Wins</p>
            <p className="text-xs text-green-400 mt-auto">+3 this month</p>
          </GlassCard>

          <GlassCard hover className="flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <CalendarIcon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">Mar 25</h3>
            <p className="text-sm text-slate-400 mb-2">Next Match</p>
            <p className="text-xs text-amber-400 mt-auto">vs Eagles</p>
          </GlassCard>
        </motion.div>

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
                    <th className="px-6 py-4 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                  {
                    name: 'Marcus Johnson',
                    email: 'marcus.j@uni.edu',
                    pos: 'Guard',
                    num: '7',
                    status: 'Active',
                    color: 'green'
                  },
                  {
                    name: 'Priya Patel',
                    email: 'priya.p@uni.edu',
                    pos: 'Forward',
                    num: '12',
                    status: 'Active',
                    color: 'green'
                  },
                  {
                    name: 'James Wilson',
                    email: 'james.w@uni.edu',
                    pos: 'Center',
                    num: '23',
                    status: 'Injured',
                    color: 'red'
                  },
                  {
                    name: 'David Kim',
                    email: 'david.k@uni.edu',
                    pos: 'Guard',
                    num: '4',
                    status: 'Active',
                    color: 'green'
                  },
                  {
                    name: 'Michael Chang',
                    email: 'm.chang@uni.edu',
                    pos: 'Forward',
                    num: '15',
                    status: 'Benched',
                    color: 'amber'
                  },
                  {
                    name: 'Sarah Chen',
                    email: 'sarah.c@uni.edu',
                    pos: 'Point Guard',
                    num: '1',
                    status: 'Active',
                    color: 'green'
                  }].
                  map((p, i) =>
                  <tr
                    key={i}
                    className="hover:bg-white/[0.02] transition-colors group">
                    
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {p.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{p.pos}</td>
                      <td className="px-6 py-4 text-slate-300 font-mono">
                        {p.num}
                      </td>
                      <td className="px-6 py-4">
                        <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${p.color}-500/10 text-${p.color}-400`}>
                        
                          <span
                          className={`w-1.5 h-1.5 rounded-full bg-${p.color}-400`}>
                        </span>
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
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tournament Registration */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold text-white">
              Available Tournaments
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {[
              {
                name: 'Spring Basketball Cup',
                date: 'Mar 30',
                fee: 'Free',
                slots: 4
              },
              {
                name: 'Regional Championship',
                date: 'Apr 15',
                fee: '$50',
                slots: 2
              }].
              map((t, i) =>
              <GlassCard
                key={i}
                hover
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                  <div>
                    <h4 className="font-bold text-white mb-1">{t.name}</h4>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                      <span className="flex items-center">
                        <CalendarIcon className="w-3 h-3 mr-1" /> {t.date}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span>
                        Fee: <strong className="text-slate-300">{t.fee}</strong>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-400">
                        {t.slots} slots left
                      </span>
                    </div>
                  </div>
                  <GradientButton
                  variant="primary"
                  className="py-2 px-4 text-sm whitespace-nowrap">
                  
                    Register Team
                  </GradientButton>
                </GlassCard>
              )}
            </div>
          </motion.div>

          {/* Registration Status */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-bold text-white">
              Registration Status
            </h3>
            <GlassCard className="p-0 overflow-hidden">
              <ul className="divide-y divide-white/5">
                {[
                {
                  name: 'University Basketball League',
                  date: 'Submitted Mar 10',
                  status: 'Approved',
                  icon: <CheckCircleIcon className="w-4 h-4" />,
                  color: 'green'
                },
                {
                  name: 'Summer 3v3 Tournament',
                  date: 'Submitted Mar 18',
                  status: 'Pending',
                  icon: <ClockIcon className="w-4 h-4" />,
                  color: 'amber'
                },
                {
                  name: 'Inter-College Cup',
                  date: 'Submitted Feb 28',
                  status: 'Rejected',
                  icon: <XCircleIcon className="w-4 h-4" />,
                  color: 'red'
                }].
                map((s, i) =>
                <li
                  key={i}
                  className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                  
                    <div>
                      <h4 className="font-medium text-white text-sm mb-1">
                        {s.name}
                      </h4>
                      <p className="text-xs text-slate-500">{s.date}</p>
                    </div>
                    <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${s.color}-500/10 text-${s.color}-400`}>
                    
                      {s.icon} {s.status}
                    </span>
                  </li>
                )}
              </ul>
            </GlassCard>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

