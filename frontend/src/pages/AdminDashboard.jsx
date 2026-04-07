import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3Icon,
  SearchIcon,
  ShieldCheckIcon,
  SwordsIcon,
  Trash2Icon,
  TrophyIcon,
  UsersIcon,
  X,
  Edit3Icon,
  ImageIcon,
  PlusIcon
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { InputField } from '../components/ui/InputField';
import { useAuth } from '../context/AuthContext';
import {
  updateAdminUserStatus,
  getAdminDashboard
} from '../lib/api';
import { getMatches, updateMatchScore } from '../services/matchService';

const sidebarItems = [
  { icon: <UsersIcon className="w-5 h-5" />, label: 'Users', path: '/admin' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/admin/tournaments' },
  { icon: <SwordsIcon className="w-5 h-5" />, label: 'Matches', path: '/admin/matches' },
  { icon: <ShieldCheckIcon className="w-5 h-5" />, label: 'Approvals', path: '/admin/approvals' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Insights', path: '/admin/insights' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export default function AdminDashboard() {
  const { user, token } = useAuth();
  
  // State
  const [dashboard, setDashboard] = useState({
    stats: { totalUsers: 0, activeTournaments: 0, matchesPlayed: 0, pendingApprovals: 0 },
    users: [], tournaments: [], approvals: [], activity: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [recentMatches, setRecentMatches] = useState([]);
  const [editingMatch, setEditingMatch] = useState(null);
  const [scores, setScores] = useState({ home: 0, away: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashData, matchData] = await Promise.all([
        getAdminDashboard(token),
        getMatches()
      ]);
      setDashboard(dashData);
      // Sort by date and take the 3 most recent
      const sortedMatches = [...matchData].sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));
      setRecentMatches(sortedMatches.slice(0, 3));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const handleQuickUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        scores: { home: Number(scores.home), away: Number(scores.away) },
        status: 'Completed'
      };
      await updateMatchScore(editingMatch._id, payload);
      setEditingMatch(null);
      alert("Score Updated!");
      loadData(); 
    } catch (err) {
      alert("Update failed. Ensure you have Admin permissions.");
    }
  };

  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(prevPhotos => [...prevPhotos, ...files].slice(0, 5)); // Max 5 photos
  };

  const removePhoto = (index) => {
    setSelectedPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };

  const handlePhotosUpload = async (e) => {
    e.preventDefault();
    if (selectedPhotos.length === 0) {
      alert("Please select at least one photo");
      return;
    }

    setUploadingPhotos(true);
    try {
      const formData = new FormData();
      selectedPhotos.forEach(photo => {
        formData.append('photos', photo);
      });

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(
        `${baseUrl}/matches/${editingMatch._id}/photos`,
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Photo upload failed');
      }

      alert("Photos uploaded successfully!");
      setSelectedPhotos([]);
      loadData(); // Refresh match data to show new photos
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleUserStatusChange = async (userId, status) => {
    try {
      const data = await updateAdminUserStatus(token, userId, status);
      setDashboard(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === userId ? data.user : u)
      }));
      setMessage("User status updated");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setError(err.message); }
  };

  const filteredUsers = useMemo(() => {
    return dashboard.users.filter(u => {
      const query = searchQuery.toLowerCase();
      return !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
    });
  }, [dashboard.users, searchQuery]);

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'admin'}
      pageTitle="Admin Overview"
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-7xl mx-auto">
        
        {/* Alerts */}
        {(message || error) && (
          <GlassCard className={error ? 'border-red-500/20' : 'border-green-500/20'}>
            <p className={error ? 'text-red-400' : 'text-green-400'}>{error || message}</p>
          </GlassCard>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard icon={<UsersIcon />} label="Total Users" value={dashboard.stats.totalUsers} color="blue" />
          <StatsCard icon={<TrophyIcon />} label="Active Tournaments" value={dashboard.stats.activeTournaments} color="purple" />
          <StatsCard icon={<SwordsIcon />} label="Matches Played" value={dashboard.stats.matchesPlayed} color="green" />
        </div>

        {/* QUICK MATCH EDIT SECTION WITH GALLERY PREVIEW */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <SwordsIcon className="w-5 h-5 text-blue-400" /> Recent Matches
            </h2>
            <GradientButton variant="outline" size="sm" onClick={() => window.location.href='/admin/matches'}>
              View All Matches
            </GradientButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentMatches.map(match => (
              <GlassCard key={match._id} className="p-4 border-white/5 hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-xs">
                    <p className="text-slate-400 font-bold uppercase truncate w-32">{match.homeTeam} vs {match.awayTeam}</p>
                    <p className="text-blue-400 text-lg font-black">{match.scores?.home || 0} - {match.scores?.away || 0}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingMatch(match);
                      setScores({ home: match.scores?.home || 0, away: match.scores?.away || 0 });
                    }}
                    className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"
                  >
                    <Edit3Icon className="w-4 h-4" />
                  </button>
                </div>

                {/* Gallery Indicator */}
                <div className="flex items-center gap-2 mt-2">
                   {match.images && match.images.length > 0 ? (
                     <span className="flex items-center gap-1 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-md font-bold">
                       <ImageIcon className="w-3 h-3" /> {match.images.length} PHOTOS
                     </span>
                   ) : (
                     <span className="text-[10px] text-slate-500 italic">No photos</span>
                   )}
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.section>

        {/* USER MANAGEMENT SECTION */}
        <motion.section variants={itemVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">User Management</h2>
            <InputField 
              placeholder="Search users..." 
              icon={<SearchIcon className="w-4 h-4" />} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="sm:max-w-xs !space-y-0"
            />
          </div>

          <GlassCard className="p-0 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase">User</th>
                      <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase">Role</th>
                      <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-4 text-xs font-medium text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{u.name}</p>
                              <p className="text-xs text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full font-bold uppercase tracking-wider">{u.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={u.status} 
                            onChange={(e) => handleUserStatusChange(u.id, e.target.value)}
                            className="bg-transparent text-sm text-slate-300 border-none outline-none cursor-pointer"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-500 hover:text-red-400 p-1"><Trash2Icon className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </GlassCard>
        </motion.section>
      </motion.div>

      {/* QUICK UPDATE MODAL */}
      <AnimatePresence>
        {editingMatch && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <GlassCard className="max-w-2xl w-full p-6 border-blue-500/40 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white">{editingMatch.homeTeam} vs {editingMatch.awayTeam}</h3>
                  <button onClick={() => { setEditingMatch(null); setSelectedPhotos([]); }}>
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                {/* Score Update Section */}
                <form onSubmit={handleQuickUpdate} className="space-y-4 mb-6">
                  <h4 className="text-sm text-slate-300 font-semibold">Update Match Score</h4>
                  <div className="flex gap-4 items-center justify-center">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 mb-1 truncate w-20">{editingMatch.homeTeam}</p>
                      <input type="number" className="w-16 bg-slate-900 border border-white/10 p-2 text-center text-white text-xl rounded-lg" value={scores.home} onChange={e => setScores({...scores, home: e.target.value})} />
                    </div>
                    <div className="pt-4 text-slate-600">-</div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-500 mb-1 truncate w-20">{editingMatch.awayTeam}</p>
                      <input type="number" className="w-16 bg-slate-900 border border-white/10 p-2 text-center text-white text-xl rounded-lg" value={scores.away} onChange={e => setScores({...scores, away: e.target.value})} />
                    </div>
                  </div>
                  <GradientButton className="w-full" type="submit">Update Results</GradientButton>
                </form>

                <div className="border-t border-white/10 pt-6">
                  {/* Photos Section */}
                  <h4 className="text-sm text-slate-300 font-semibold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Upload Match Photos (Max 5)
                  </h4>

                  {/* Photo Preview */}
                  {editingMatch.images && editingMatch.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-slate-400 mb-2">Current Photos: {editingMatch.images.length}</p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {editingMatch.images.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={img} 
                            alt={`Match ${idx}`} 
                            className="w-full h-24 object-cover rounded-lg border border-white/10"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Input */}
                  <div className="mb-4">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handlePhotosChange}
                      disabled={uploadingPhotos}
                      className="w-full p-3 bg-slate-900 border border-dashed border-white/20 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500/20 file:text-blue-300 hover:file:bg-blue-500/30 disabled:opacity-50"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {selectedPhotos.length > 0 
                        ? `${selectedPhotos.length} file(s) selected` 
                        : 'Select up to 5 images'}
                    </p>
                  </div>

                  {/* Selected Photos Preview */}
                  {selectedPhotos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {selectedPhotos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={URL.createObjectURL(photo)} 
                            alt={`Selected ${idx}`} 
                            className="w-full h-24 object-cover rounded-lg border border-white/20"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  <GradientButton 
                    className="w-full" 
                    onClick={handlePhotosUpload}
                    disabled={selectedPhotos.length === 0 || uploadingPhotos}
                  >
                    {uploadingPhotos ? 'Uploading...' : `Upload ${selectedPhotos.length} Photo(s)`}
                  </GradientButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function StatsCard({ icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400'
  };
  return (
    <motion.div variants={itemVariants}>
      <GlassCard hover className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
          {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
      </GlassCard>
    </motion.div>
  );
}