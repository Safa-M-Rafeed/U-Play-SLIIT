import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, MapPinIcon, SwordsIcon, TrendingUpIcon, 
  SearchIcon, LayoutGridIcon, ListIcon, Calendar as CalendarDays,
  ImageIcon, Maximize2Icon, XIcon 
} from 'lucide-react';
import Calendar from 'react-calendar'; 
import 'react-calendar/dist/Calendar.css'; 
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { getMatches, getLeaderboard } from '../services/matchService'; 
import { useAuth } from '../context/AuthContext';

// --- 1. ENHANCED PREDICTION ALGORITHM ---
const getPrediction = (match, standings = []) => {
  const homeScore = Number(match.scores?.home ?? 0);
  const awayScore = Number(match.scores?.away ?? 0);
  const safeStandings = Array.isArray(standings) ? standings : [];
  
  const hStats = safeStandings.find(s => (s.team || s.teamName)?.toLowerCase() === (match.homeTeam || "").toLowerCase());
  const aStats = safeStandings.find(s => (s.team || s.teamName)?.toLowerCase() === (match.awayTeam || "").toLowerCase());
  
  const hPts = Number(hStats?.points || 0);
  const aPts = Number(aStats?.points || 0);

  const scoreWeight = (homeScore - awayScore) * 15; 
  const pointsWeight = (hPts - aPts) * 3;
  let probability = 55 + scoreWeight + pointsWeight;
  const finalProb = Math.max(5, Math.min(95, probability));
  
  if (finalProb > 50) return { winner: match.homeTeam, percent: Math.round(finalProb) };
  if (finalProb < 50) return { winner: match.awayTeam, percent: Math.round(100 - finalProb) };
  return { winner: "Even Match", percent: 50 };
};

// --- 2. THEME OVERRIDES ---
const calendarStyles = `
  .custom-tournament-calendar { background: transparent !important; border: none !important; width: 100% !important; color: white !important; }
  .custom-tournament-calendar .react-calendar__tile { padding: 1.5em 0.5em !important; color: #94a3b8 !important; }
  .custom-tournament-calendar .react-calendar__tile--active { background: #6366f1 !important; border-radius: 12px !important; box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
  .custom-tournament-calendar .react-calendar__tile--now { background: rgba(255,255,255,0.05) !important; border: 1px solid #6366f1 !important; border-radius: 12px; }
  .has-match { position: relative; color: white !important; }
  .has-match::after { content: ''; position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; background: #10b981; border-radius: 50%; }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
`;

export default function MatchSchedule() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); 
  const [selectedImage, setSelectedImage] = useState(null);

  const sidebarItems = [{ icon: <SwordsIcon className="w-5 h-5" />, label: 'Schedule', path: '/matches' }];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [m, l] = await Promise.all([getMatches(), getLeaderboard()]);
        setMatches(m || []);
        setLeaderboard(l || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadData();
  }, []);

  const filteredMatches = matches.filter(match => {
    const teamSearch = (match.homeTeam + match.awayTeam).toLowerCase().includes(searchQuery.toLowerCase());
    const status = (match.status || "").toLowerCase();
    if (activeTab === 'live') return teamSearch && status === 'live';
    if (activeTab === 'upcoming') return teamSearch && (status === 'scheduled' || status === 'upcoming');
    if (activeTab === 'completed') return teamSearch && status === 'completed';
    return teamSearch;
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems} pageTitle="Tournament Schedule" userRole={user?.role}>
      <style>{calendarStyles}</style>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 cursor-zoom-out">
            <XIcon className="absolute top-6 right-6 w-8 h-8 text-white cursor-pointer" />
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={selectedImage} className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-10 px-4 mb-20">
        
        {/* CONTROL PANEL */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" placeholder="Search teams, venues..."
              className="w-full bg-slate-950/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
            {[{ id: 'grid', icon: <LayoutGridIcon className="w-4 h-4" /> },
              { id: 'list', icon: <ListIcon className="w-4 h-4" /> },
              { id: 'calendar', icon: <CalendarDays className="w-4 h-4" /> }].map(btn => (
              <button key={btn.id} onClick={() => setViewMode(btn.id)}
                className={`p-2.5 rounded-xl transition-all ${viewMode === btn.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
              >{btn.icon}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-500 font-medium">Syncing live match data...</div>
        ) : (
          <AnimatePresence mode='wait'>
            {viewMode === 'calendar' ? (
              <motion.div key="cal" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col lg:flex-row gap-8">
                <div className="flex-[2] bg-slate-900/40 border border-white/5 p-10 rounded-[40px] shadow-2xl">
                  <Calendar className="custom-tournament-calendar" tileClassName={({ date, view }) => {
                    if (view === 'month' && matches.some(m => new Date(m.matchDate).toDateString() === date.toDateString())) return 'has-match';
                  }} />
                </div>
                <div className="flex-1 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-3">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] px-2 mb-4">Upcoming Fixtures</h3>
                  {matches.map(m => (
                    <div key={m._id} className="p-5 bg-slate-900/80 border border-white/5 rounded-[24px] hover:border-indigo-500/30 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-slate-500">{new Date(m.matchDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-md">{m.status}</span>
                      </div>
                      <p className="text-md font-black text-white">{m.homeTeam} <span className="text-slate-600 font-medium">v</span> {m.awayTeam}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-12">
                {/* TABS */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {['all', 'live', 'upcoming', 'completed'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === tab ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-900/50 border-white/5 text-slate-500 hover:text-white hover:bg-slate-800'}`}
                    >{tab}</button>
                  ))}
                </div>
                
                {/* MATCH CARDS */}
                <motion.div layout className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "max-w-4xl mx-auto space-y-6"}>
                  {filteredMatches.map((match) => {
                    const prediction = getPrediction(match, leaderboard);
                    const isLive = match.status?.toLowerCase() === 'live';
                    return (
                      <motion.div layout key={match._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <GlassCard className={`relative p-8 border-t-4 transition-all duration-300 ${isLive ? 'border-red-500 bg-red-500/5' : 'border-indigo-500/40 bg-indigo-500/5 hover:border-indigo-500'}`}>
                          <div className="flex justify-between items-center mb-6">
                            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${isLive ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>{match.status}</span>
                            <span className="text-[10px] text-slate-600 font-mono font-bold tracking-widest uppercase">ID: {match._id.slice(-6)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-8">
                            <div className="text-center flex-1">
                              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{match.homeTeam}</h3>
                              <span className="text-5xl font-black text-indigo-500">{match.scores?.home || 0}</span>
                            </div>
                            <div className="px-6 text-slate-700 font-black italic text-sm">VS</div>
                            <div className="text-center flex-1">
                              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{match.awayTeam}</h3>
                              <span className="text-5xl font-black text-purple-500">{match.scores?.away || 0}</span>
                            </div>
                          </div>

                          {/* CLICKABLE PHOTOS ON THE CARD */}
                          {match.images && match.images.length > 0 && (
                            <div className="mb-8 space-y-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" /> Highlights
                              </p>
                              <div className="grid grid-cols-3 gap-2">
                                {match.images.map((url, idx) => (
                                  <div key={idx} onClick={() => setSelectedImage(`http://localhost:5000${url}`)}
                                    className="group relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-slate-900 cursor-zoom-in">
                                    <img src={`http://localhost:5000${url}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="match" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Maximize2Icon className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                              <CalendarIcon className="w-4 h-4 text-indigo-400" />
                              <span className="text-xs font-bold text-slate-300">{new Date(match.matchDate).toLocaleDateString([], { dateStyle: 'medium' })}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                              <MapPinIcon className="w-4 h-4 text-indigo-400" />
                              <span className="text-xs font-bold text-slate-300 truncate">{match.venue}</span>
                            </div>
                          </div>

                          {/* PREDICTION BAR */}
                          <div className="bg-slate-950/80 p-5 rounded-[24px] border border-white/5">
                            <div className="flex justify-between items-end mb-3">
                              <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-black text-indigo-500 tracking-widest mb-1 flex items-center gap-2">
                                  <TrendingUpIcon className="w-3 h-3" /> Win Prediction
                                </span>
                                <span className="text-xs font-black text-white italic uppercase">Favored: {prediction.winner}</span>
                              </div>
                              <span className="text-xl font-black text-white">{prediction.percent}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${prediction.percent}%` }} 
                                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)]" />
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </DashboardLayout>
  );
}