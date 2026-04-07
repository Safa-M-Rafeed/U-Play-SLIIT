import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, MapPinIcon, SwordsIcon } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { getMatches, getLeaderboard } from '../services/matchService'; // Added getLeaderboard
import { useAuth } from '../context/AuthContext';

// 1. Helper function for the "AI Predictor"
const predictWinner = (home, away, standings = []) => {
  if (!standings || standings.length === 0) return "Analyzing Data...";
  
  const homeStats = standings.find(s => s.team === home);
  const awayStats = standings.find(s => s.team === away);
  
  if (!homeStats && !awayStats) return "Even Matchup";
  if ((homeStats?.points || 0) > (awayStats?.points || 0)) return home;
  if ((awayStats?.points || 0) > (homeStats?.points || 0)) return away;
  return "Toss-up";
};

export default function MatchSchedule() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const sidebarItems = [
    { icon: <SwordsIcon className="w-5 h-5" />, label: 'Schedule', path: '/matches' },
  ];

  // 2. Combined fetching into one clean useEffect
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Call both APIs at the same time
        const [matchesData, leaderboardData] = await Promise.all([
          getMatches(),
          getLeaderboard()
        ]);
        
        setMatches(matchesData);
        setLeaderboard(leaderboardData);
      } catch (err) {
        console.error("Failed to fetch schedule data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <DashboardLayout 
      sidebarItems={sidebarItems} 
      pageTitle="Tournament Schedule"
      userRole={user?.role}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-white mb-6">Upcoming & Past Matches</h2>

        {loading ? (
          <p className="text-slate-400 text-center py-20">Loading matches...</p>
        ) : matches.length === 0 ? (
          <GlassCard className="text-center py-10">
            <p className="text-slate-400">No matches scheduled yet.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <motion.div 
                key={match._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard hover className="relative overflow-hidden h-full">
                  {/* Status Badge */}
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      match.status === 'Completed' ? 'bg-slate-500/20 text-slate-400' : 
                      match.status === 'Live' ? 'bg-red-500/20 text-red-400 animate-pulse' : 
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {match.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">ID: {match._id.slice(-6)}</span>
                  </div>

                  {/* Team Comparison */}
                  <div className="flex items-center justify-around text-center py-4 border-b border-white/5 mb-4">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-white truncate">{match.homeTeam}</p>
                      <p className="text-3xl font-black text-blue-400 mt-1">{match.scores?.home || 0}</p>
                    </div>
                    
                    <div className="px-4 text-slate-600 font-italic text-sm">VS</div>

                    <div className="flex-1">
                      <p className="text-lg font-bold text-white truncate">{match.awayTeam}</p>
                      <p className="text-3xl font-black text-purple-400 mt-1">{match.scores?.away || 0}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <CalendarIcon className="w-4 h-4" />
                      {new Date(match.matchDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <MapPinIcon className="w-4 h-4" />
                      {match.venue}
                    </div>
                  </div>

                  {/* AI Predictor (Only for non-completed matches) */}
                  {match.status !== 'Completed' && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <p className="text-[10px] uppercase tracking-[0.1em] text-blue-400 font-black">
                          AI Match Predictor
                        </p>
                      </div>
                      <p className="text-xs text-slate-300">
                        Favored to Win: <span className="text-white font-bold uppercase">
                          {predictWinner(match.homeTeam, match.awayTeam, leaderboard)}
                        </span>
                      </p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}