import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  TrophyIcon,
  CalendarIcon,
  BarChart3Icon,
  ActivityIcon,
  UserIcon,
  SearchIcon,
  MedalIcon
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { getLeaderboard } from '../services/matchService';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';

// Sidebar items for navigation
const sidebarItems = [
  { icon: <HomeIcon className="w-5 h-5" />, label: 'Home', path: '/student' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/student/tournaments' },
  { icon: <CalendarIcon className="w-5 h-5" />, label: 'Fixtures', path: '/student/fixtures' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Leaderboard', path: '/student/leaderboard' },
  { icon: <ActivityIcon className="w-5 h-5" />, label: 'Stats', path: '/student/stats' },
  { icon: <UserIcon className="w-5 h-5" />, label: 'Profile', path: '/profile' }
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // Filter teams based on search input
  const filteredTeams = leaderboard.filter(team => 
    team.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'student'}
      userName={user?.fullName || 'Student'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Leaderboard Standings"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Search & Filter Bar */}
        <GlassCard className="flex flex-col md:flex-row gap-4 justify-between items-center p-6">
          <div className="relative w-full md:w-96">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search for a team..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            Total Teams: {leaderboard.length}
          </div>
        </GlassCard>

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-0 overflow-hidden border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
  <thead>
    <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
      <th className="px-4 py-3">Pos</th>
      <th className="px-4 py-3">Team</th>
      <th className="px-4 py-3 text-center">P</th>
      <th className="px-4 py-3 text-center">W</th>
      <th className="px-4 py-3 text-center">D</th>
      <th className="px-4 py-3 text-center">L</th>
      {/* NEW COLUMNS */}
      <th className="px-4 py-3 text-center text-blue-400">GF</th>
      <th className="px-4 py-3 text-center text-red-400">GA</th>
      <th className="px-4 py-3 text-center font-black text-white">GD</th>
      <th className="px-4 py-3 text-center text-blue-500">Pts</th>
    </tr>
  </thead>
  <tbody>
    {leaderboard.map((team, index) => (
      <tr key={team.team} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
        <td className="px-4 py-4 text-xs font-bold text-slate-400">{index + 1}</td>
        <td className="px-4 py-4 text-xs font-black text-white uppercase">{team.team}</td>
        <td className="px-4 py-4 text-xs text-center text-slate-300">{team.played}</td>
        <td className="px-4 py-4 text-xs text-center text-slate-300">{team.win}</td>
        <td className="px-4 py-4 text-xs text-center text-slate-300">{team.draw}</td>
        <td className="px-4 py-4 text-xs text-center text-slate-300">{team.loss}</td>
        {/* NEW DATA CELLS */}
        <td className="px-4 py-4 text-xs text-center text-slate-400">{team.gf}</td>
        <td className="px-4 py-4 text-xs text-center text-slate-400">{team.ga}</td>
        <td className="px-4 py-4 text-xs text-center font-bold text-white">
          {team.gd > 0 ? `+${team.gd}` : team.gd}
        </td>
        <td className="px-4 py-4 text-sm text-center font-black text-blue-500">{team.points}</td>
      </tr>
    ))}
  </tbody>
</table>
            </div>
            
            {filteredTeams.length === 0 && !loading && (
              <div className="py-20 text-center">
                <p className="text-slate-500 italic">No teams found matching "{searchTerm}"</p>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}