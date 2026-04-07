import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  TrophyIcon, 
  CalendarIcon, 
  BarChart3Icon, 
  UserIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutGridIcon,
  ListIcon
} from 'lucide-react';

// Date handling
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';

import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { getMatches, getLeaderboard } from '../services/matchService'; 
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';
import { calculatePrediction } from '../utils/predictionEngine'; 

const sidebarItems = [
  { icon: <HomeIcon className="w-5 h-5" />, label: 'Home', path: '/student' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/student/tournaments' },
  { icon: <CalendarIcon className="w-5 h-5" />, label: 'Fixtures', path: '/student/fixtures' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Leaderboard', path: '/student/leaderboard' },
  { icon: <UserIcon className="w-5 h-5" />, label: 'Profile', path: '/profile' }
];

export default function FixturesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); 
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

useEffect(() => {
  const fetchData = async () => {
    try {
      const [matchData, leaderboardData] = await Promise.all([
        getMatches(),
        getLeaderboard()
      ]);
      setMatches(matchData);
      setLeaderboard(leaderboardData || []); 
    } catch (err) {
      console.error("Failed to fetch page data", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData(); // Initial load

  // Set up polling every 30 seconds for LIVE updates
  const interval = setInterval(fetchData, 30000); 

  return () => clearInterval(interval); // Cleanup on unmount
}, []);

  const filteredMatches = matches.filter(m => {
    const matchesSearch = m.homeTeam?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.awayTeam?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'student'}
      userName={user?.fullName || 'Student'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Match Schedule"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Toolbar */}
        <GlassCard className="flex flex-col md:flex-row gap-4 justify-between items-center p-6">
          <div className="relative w-full md:w-80">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search teams..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGridIcon className="w-4 h-4" />
            </button>
          </div>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-lg py-2 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="All">All Matches</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Live">Live Now</option>
            <option value="Completed">Completed</option>
          </select>
        </GlassCard>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading fixtures...</div>
        ) : viewMode === 'list' ? (
          <div className="space-y-8">
            <section>
              <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Live & Upcoming
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMatches.filter(m => m.status !== 'Completed').map(m => (
                  <MatchCard key={m._id} m={m} leaderboard={leaderboard} />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">Recent Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMatches.filter(m => m.status === 'Completed').map(m => (
                  <MatchCard key={m._id} m={m} leaderboard={leaderboard} />
                ))}
              </div>
            </section>
          </div>
        ) : (
          <CalendarView matches={matches} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
        )}
      </div>
    </DashboardLayout>
  );
}

function MatchCard({ m, leaderboard }) {
  // 1. Calculate prediction immediately
  const prediction = calculatePrediction(m.homeTeam, m.awayTeam, leaderboard || []) || { homeWinProb: 50, awayWinProb: 50 };

  // 2. Identify if the match is currently Live
  const isLive = m.status?.toLowerCase() === 'live';

  return (
    <GlassCard className={`hover:border-blue-500/30 transition-colors group p-5 ${isLive ? 'border-red-500/50 bg-red-500/5' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded font-bold uppercase">
            {m.tournamentId?.name || "Tournament"}
          </span>
          
          {/* LIVE BADGE - Only shows if status is 'Live' */}
          {isLive && (
            <motion.span 
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-[10px] bg-red-500 text-white px-2 py-1 rounded font-black uppercase flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Live
            </motion.span>
          )}
        </div>

        <div className="text-right">
          <p className="text-white font-bold text-xs">{format(new Date(m.matchDate), 'MMM dd')}</p>
          <p className="text-slate-500 text-[10px]">{m.time || 'TBD'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-center gap-2">
        <p className="flex-1 text-xs font-black text-white uppercase truncate">{m.homeTeam}</p>
        
        {/* Score Box - Turns Red if Live */}
        <div className={`px-3 py-1 rounded border min-w-[60px] ${isLive ? 'bg-red-500/20 border-red-500/50' : 'bg-white/5 border-white/5'}`}>
          <span className={`text-sm font-black ${isLive ? 'text-red-400' : 'text-white'}`}>
            {m.scores?.home ?? 0} : {m.scores?.away ?? 0}
          </span>
        </div>

        <p className="flex-1 text-xs font-black text-white uppercase truncate">{m.awayTeam}</p>
      </div>
      
      <p className="mt-4 text-[10px] text-slate-500 text-center italic">{m.venue || 'Venue TBD'}</p>

      {/* WIN PREDICTION - No 'if' check, so it never disappears */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            {isLive ? 'Live Probability' : 'Win Prediction'}
          </span>
          <span className={`text-[9px] font-black uppercase ${isLive ? 'text-red-400' : 'text-blue-400'}`}>
            {prediction.homeWinProb}% {isLive ? 'To Win' : 'Chance'}
          </span>
        </div>
        
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${prediction.homeWinProb}%` }}
            className={`h-full ${isLive ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'}`} 
          />
          <div className="h-full bg-slate-700 flex-1" />
        </div>
      </div>
    </GlassCard>
  );
}

function CalendarView({ matches, currentMonth, setCurrentMonth }) {
  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-black text-white uppercase tracking-tighter">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <div className="flex gap-2">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayMatches = matches.filter(m => isSameDay(new Date(m.matchDate), cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[100px] p-2 border border-white/5 transition-colors ${
              !isSameMonth(day, monthStart) ? 'opacity-20' : 'hover:bg-white/[0.02]'
            } ${isSameDay(day, new Date()) ? 'bg-blue-500/5 border-blue-500/20' : ''}`}
          >
            <span className={`text-xs font-bold ${isSameDay(day, new Date()) ? 'text-blue-400' : 'text-slate-500'}`}>
              {formattedDate}
            </span>
            <div className="mt-2 space-y-1">
              {dayMatches.map(m => (
                <div key={m._id} className="text-[8px] p-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/20 truncate font-bold uppercase">
                  {m.homeTeam} vs {m.awayTeam}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day.getTime()}>{days}</div>);
      days = [];
    }
    return <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.01]">{rows}</div>;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </motion.div>
  );
}