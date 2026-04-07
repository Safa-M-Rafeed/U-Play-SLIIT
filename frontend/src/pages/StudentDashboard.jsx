import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  TrophyIcon,
  CalendarIcon,
  BarChart3Icon,
  UserIcon,
  ZapIcon,
  StarIcon,
  TargetIcon,
  ImageIcon,
  ChevronRightIcon,
  XIcon
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';
import { getLeaderboard, getMatches } from '../services/matchService';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = "http://localhost:5000";

const sidebarItems = [
  { icon: <HomeIcon className="w-5 h-5" />, label: 'Home', path: '/student' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/student/tournaments' },
  { icon: <CalendarIcon className="w-5 h-5" />, label: 'Fixtures', path: '/student/fixtures' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Leaderboard', path: '/student/leaderboard' },
  { icon: <UserIcon className="w-5 h-5" />, label: 'Profile', path: '/profile' },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Gallery State
  const [selectedGallery, setSelectedGallery] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lbData, allMatches] = await Promise.all([
          getLeaderboard(),
          getMatches()
        ]);
        setLeaderboard(lbData);
        const filtered = allMatches
          .filter(m => m.status === 'Live' || (m.images && m.images.length > 0))
          .sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate))
          .slice(0, 3);
        setRecentMatches(filtered);
      } catch (err) {
        console.error("Dashboard data load failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const userTeam = leaderboard[0] || { points: 0, won: 0, played: 0 };
  const winRate = userTeam.played > 0 ? Math.round((userTeam.won / userTeam.played) * 100) : 0;

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'student'}
      userName={user?.fullName || 'Student'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Dashboard">

      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Statistics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<TrophyIcon />} label="Tournaments" value="Active" color="blue" />
          <StatCard icon={<ZapIcon />} label="Live Now" value={recentMatches.filter(m => m.status === 'Live').length} color="purple" isLive />
          <StatCard icon={<StarIcon />} label="Team Points" value={userTeam.points} color="amber" />
          <StatCard icon={<TargetIcon />} label="Win Rate" value={`${winRate}%`} color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Match Highlights Card */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Match Highlights</h3>
            <div className="space-y-4">
              {recentMatches.map((m) => (
                <GlassCard key={m._id} className="relative overflow-hidden group min-h-[160px]">
                  {/* Backdrop */}
                  {m.images?.length > 0 && (
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={`${BACKEND_URL}${m.images[0]}`} 
                        className="w-full h-full object-cover opacity-20" 
                        alt="bg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
                    </div>
                  )}

                  <div className="relative z-10 p-4">
                    <div className="flex justify-between items-center mb-6">
                       <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/5 px-2 py-1 rounded">{m.venue}</span>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded ${m.status === 'Live' ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-slate-500 bg-white/5'}`}>
                         {m.status}
                       </span>
                    </div>

                    <div className="flex items-center justify-between text-center mb-6">
                      <p className="flex-1 text-sm font-bold text-white uppercase">{m.homeTeam}</p>
                      <div className="px-4 py-1 bg-white/10 rounded-lg border border-white/10 mx-2">
                        <span className="text-xl font-black text-white">{m.scores?.home} : {m.scores?.away}</span>
                      </div>
                      <p className="flex-1 text-sm font-bold text-white uppercase">{m.awayTeam}</p>
                    </div>

                    {/* PHOTO VIEW TRIGGER */}
                    {m.images?.length > 0 && (
                      <button 
                        onClick={() => setSelectedGallery(m)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity bg-blue-500/10 p-2 rounded-lg border border-blue-500/20"
                      >
                        <div className="flex -space-x-2">
                          {m.images.slice(0, 3).map((img, i) => (
                            <img key={i} src={`${BACKEND_URL}${img}`} className="w-6 h-6 rounded-full border-2 border-slate-900 object-cover" />
                          ))}
                        </div>
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">View {m.images.length} Photos</span>
                      </button>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Standings section remains same... */}
          <div className="space-y-4">
             <h3 className="text-lg font-bold text-white">Top Teams</h3>
             <GlassCard className="p-0 overflow-hidden">
                <table className="w-full text-sm text-left">
                   <tbody className="divide-y divide-white/5">
                      {leaderboard.slice(0, 5).map((team, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                           <td className="px-4 py-3 font-bold text-slate-500">{i+1}</td>
                           <td className="px-4 py-3 text-white">{team.team}</td>
                           <td className="px-4 py-3 text-right font-bold text-blue-400">{team.points} PTS</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </GlassCard>
          </div>
        </div>
      </div>

      {/* --- PHOTO GALLERY MODAL --- */}
      <AnimatePresence>
        {selectedGallery && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10"
          >
            <button 
              onClick={() => setSelectedGallery(null)}
              className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors bg-white/10 p-2 rounded-full"
            >
              <XIcon className="w-8 h-8" />
            </button>

            <div className="max-w-5xl w-full h-full flex flex-col">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-white uppercase">{selectedGallery.homeTeam} vs {selectedGallery.awayTeam}</h2>
                <p className="text-slate-400 text-sm">Match Gallery • {selectedGallery.images.length} Photos</p>
              </div>

              {/* Scrollable Photo Grid */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedGallery.images.map((img, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="aspect-video rounded-xl overflow-hidden border border-white/10"
                    >
                      <img 
                        src={`${BACKEND_URL}${img}`} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in" 
                        alt="match"
                        onClick={() => window.open(`${BACKEND_URL}${img}`, '_blank')}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value, color, isLive }) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/20 text-amber-400',
    green: 'bg-green-500/20 text-green-400'
  };
  return (
    <GlassCard className="flex flex-col p-4">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{React.cloneElement(icon, { className: 'w-5 h-5' })}</div>
        {isLive && value > 0 && <span className="text-[10px] font-bold text-red-500 animate-pulse bg-red-500/10 px-2 py-1 rounded">LIVE</span>}
      </div>
      <h3 className="text-2xl font-black text-white">{value}</h3>
      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{label}</p>
    </GlassCard>
  );
}