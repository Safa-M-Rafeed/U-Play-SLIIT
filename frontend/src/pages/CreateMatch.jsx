import React, { useState } from 'react';
import { 
  Users, 
  Trophy, 
  ShieldCheck, 
  BarChart3, 
  Swords, 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  ArrowLeft 
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { createMatch } from '../services/matchService';

// 1. Sidebar items are static data and can stay outside the component
const sidebarItems = [
  { icon: <Users className="w-5 h-5" />, label: 'Users', path: '/admin' },
  { icon: <Trophy className="w-5 h-5" />, label: 'Tournaments', path: '/admin/tournaments' },
  { icon: <Swords className="w-5 h-5" />, label: 'Matches', path: '/admin/create-match' },
  { icon: <ShieldCheck className="w-5 h-5" />, label: 'Approvals', path: '/admin/approvals' },
  { icon: <BarChart3 className="w-5 h-5" />, label: 'Results', path: '/admin/results' }
];

export default function CreateMatch() {
    // 2. React Hooks MUST be called inside the component function
    const [formData, setFormData] = useState({
        homeTeam: '',
        awayTeam: '',
        venue: '',
        matchDate: '',
        tournament: '65f1a2b3c4d5e6f7a8b9c0d1' // Default Tournament ID
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Sends the formData object to your backend service
            await createMatch(formData);
            alert("Match Created Successfully!");
            
            // Optional: Reset form after success
            setFormData({
                homeTeam: '',
                awayTeam: '',
                venue: '',
                matchDate: '',
                tournament: '65f1a2b3c4d5e6f7a8b9c0d1'
            });
        } catch (err) {
            console.error("Creation Error:", err);
            alert("Error: Could not save match. Check if your backend is running.");
        }
    };

    return (
        <DashboardLayout sidebarItems={sidebarItems} pageTitle="Create Match">
            <div className="max-w-2xl mx-auto mt-10 px-4">
                <GlassCard>
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Swords className="text-blue-400 w-6 h-6" /> Schedule New Match
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Home Team</label>
                            <input 
                                type="text" 
                                placeholder="Enter home team name" 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all" 
                                value={formData.homeTeam}
                                onChange={e => setFormData({...formData, homeTeam: e.target.value})} 
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Away Team</label>
                            <input 
                                type="text" 
                                placeholder="Enter away team name" 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all" 
                                value={formData.awayTeam}
                                onChange={e => setFormData({...formData, awayTeam: e.target.value})} 
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Venue</label>
                            <input 
                                type="text" 
                                placeholder="Stadium or Ground name" 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all" 
                                value={formData.venue}
                                onChange={e => setFormData({...formData, venue: e.target.value})} 
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Date & Time</label>
                            <input 
                                type="datetime-local" 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all [color-scheme:dark]" 
                                value={formData.matchDate}
                                onChange={e => setFormData({...formData, matchDate: e.target.value})} 
                                required
                            />
                        </div>
                        
                        <div className="pt-4">
                            <button 
                                type="submit" 
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]"
                            >
                                Save Match to MongoDB
                            </button>
                        </div>
                    </form>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}