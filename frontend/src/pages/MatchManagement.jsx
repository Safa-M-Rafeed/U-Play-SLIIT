import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, SwordsIcon, CalendarIcon, MapPinIcon, Edit3Icon, 
  PlusIcon, Trophy, ShieldCheck, BarChart3, X, ImagePlus, 
  ImageIcon, Trash2Icon 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { getMatches, updateMatchScore } from '../services/matchService';
import { useAuth } from '../context/AuthContext';

const sidebarItems = [
  { icon: <Users className="w-5 h-5" />, label: 'Users', path: '/admin' },
  { icon: <Trophy className="w-5 h-5" />, label: 'Tournaments', path: '/admin/tournaments' },
  { icon: <SwordsIcon className="w-5 h-5" />, label: 'Matches', path: '/admin/matches' },
  { icon: <ShieldCheck className="w-5 h-5" />, label: 'Approvals', path: '/admin/approvals' },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Results', path: '/admin/results' }
];

export default function MatchManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMatch, setEditingMatch] = useState(null);
  const [scores, setScores] = useState({ home: 0, away: 0 });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await getMatches();
      setMatches(data);
    } catch (err) {
      console.error("Error fetching matches", err);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDeleteMatch = async (matchId, matchScores) => {
    // Check if scores exist to prevent deleting completed data accidentally
    if (matchScores && (matchScores.home > 0 || matchScores.away > 0)) {
      alert("This match has recorded scores. Please reset scores to 0 before deleting to protect leaderboard integrity.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this match? This action cannot be undone.")) return;

    try {
      const authDataString = localStorage.getItem('uplay_auth');
      const token = authDataString ? JSON.parse(authDataString).token : '';

      await axios.delete(`http://localhost:5000/api/matches/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Match deleted successfully");
      fetchMatches(); // Refresh list
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete match. Ensure you are authorized.");
    }
  };

  const handleScoreUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateMatchScore(editingMatch._id, {
        scores: { 
          home: Number(scores.home), 
          away: Number(scores.away) 
        },
        status: 'Completed'
      });
      alert("Score Updated!");
      setEditingMatch(null);
      fetchMatches();
    } catch (err) {
      alert("Update failed. Check if you are logged in as admin.");
    }
  };

  const handlePhotoUpload = async (matchId, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('photos', file);
      });

      const authDataString = localStorage.getItem('uplay_auth'); 
      let token = '';
      
      if (authDataString) {
        const authData = JSON.parse(authDataString);
        token = authData.token;
      }

      if (!token) {
        alert("No authentication token found. Please log in again.");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/matches/${matchId}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      alert('Photos uploaded successfully!');
      fetchMatches();
    } catch (error) {
      console.error("Upload failed", error);
      alert('Photo upload failed.');
    }
  };

  return (
    <DashboardLayout 
      sidebarItems={sidebarItems} 
      pageTitle="Match Management"
      userRole={user?.role || 'admin'}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Match List</h2>
            <p className="text-slate-400 text-sm">Update results and manage match galleries.</p>
          </div>
          <GradientButton onClick={() => navigate('/admin/create-match')}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create New Match
          </GradientButton>
        </div>

        {/* Match List */}
        {loading ? (
          <p className="text-slate-400 text-center py-20">Loading matches...</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {matches.length === 0 ? (
              <GlassCard className="text-center py-12">
                <p className="text-slate-400">No matches found.</p>
              </GlassCard>
            ) : (
              matches.map((match) => (
                <GlassCard key={match._id} hover className="flex flex-col gap-6 p-6">
                  {/* Top Row: Info & Scores */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-8 flex-1">
                      <div className="text-center min-w-[100px]">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Home</p>
                        <p className="text-lg font-bold text-white">{match.homeTeam}</p>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                          {match.scores?.home ?? 0} - {match.scores?.away ?? 0}
                        </span>
                        <div className="h-[1px] w-12 bg-white/10 my-1"></div>
                      </div>

                      <div className="text-center min-w-[100px]">
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Away</p>
                        <p className="text-lg font-bold text-white">{match.awayTeam}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-1 border-l border-white/5 pl-6">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(match.matchDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPinIcon className="w-4 h-4" />
                        {match.venue}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        match.status === 'Completed' ? 'bg-slate-500/20 text-slate-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {match.status}
                      </span>
                      
                      {/* ACTION BUTTONS */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { 
                            setEditingMatch(match); 
                            setScores({ home: match.scores?.home || 0, away: match.scores?.away || 0 }); 
                          }}
                          className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                          title="Edit Score"
                        >
                          <Edit3Icon className="w-5 h-5" />
                        </button>

                        <button 
                          onClick={() => handleDeleteMatch(match._id, match.scores)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                          title="Delete Match"
                        >
                          <Trash2Icon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Image Gallery & Upload */}
                  <div className="border-t border-white/5 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Match Gallery
                      </h4>
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                        <ImagePlus className="w-4 h-4" />
                        Add Photos
                        <input 
                          type="file" 
                          multiple 
                          hidden 
                          onChange={(e) => handlePhotoUpload(match._id, e)} 
                        />
                      </label>
                    </div>

                    {match.images && match.images.length > 0 ? (
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {match.images.map((img, idx) => (
                          <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden border border-white/10">
                            <img 
                              src={`http://localhost:5000${img}`} 
                              className="w-full h-full object-cover" 
                              alt="Match" 
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No photos uploaded for this match.</p>
                    )}
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {editingMatch && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <GlassCard className="max-w-md w-full border-blue-500/30 p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Update Match Result</h3>
                  <button onClick={() => setEditingMatch(null)} className="text-slate-400 hover:text-white"><X /></button>
                </div>
                
                <form onSubmit={handleScoreUpdate} className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-center">
                      <p className="text-xs text-slate-400 mb-2 truncate font-bold uppercase tracking-tighter">{editingMatch.homeTeam}</p>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl focus:border-blue-500 outline-none"
                        value={scores.home}
                        onChange={(e) => setScores({...scores, home: e.target.value})}
                      />
                    </div>
                    <div className="text-white font-bold text-xl mt-6">-</div>
                    <div className="flex-1 text-center">
                      <p className="text-xs text-slate-400 mb-2 truncate font-bold uppercase tracking-tighter">{editingMatch.awayTeam}</p>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl focus:border-blue-500 outline-none"
                        value={scores.away}
                        onChange={(e) => setScores({...scores, away: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setEditingMatch(null)} className="flex-1 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all">Save Result</button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}