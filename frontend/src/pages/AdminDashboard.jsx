import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3Icon,
  ExternalLinkIcon,
  FileTextIcon,
  SearchIcon,
  ShieldCheckIcon,
  SwordsIcon,
  Trash2Icon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { InputField } from '../components/ui/InputField';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';
import {
  deleteAdminUser,
  downloadAdminReport,
  getAdminDashboard,
  updateAdminUserStatus
} from '../lib/api';

const sidebarItems = [
  { icon: <UsersIcon className="w-5 h-5" />, label: 'Users', path: '/admin' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/admin/tournaments' },
  { icon: <SwordsIcon className="w-5 h-5" />, label: 'Matches', path: '/admin/matches' },
  { icon: <ShieldCheckIcon className="w-5 h-5" />, label: 'Approvals', path: '/admin/approvals' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Results', path: '/admin/results' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

export function AdminDashboard() {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [joinedFilter, setJoinedFilter] = useState('All');
  const [dashboard, setDashboard] = useState({
    stats: {
      totalUsers: 0,
      activeTournaments: 0,
      matchesPlayed: 0,
      pendingApprovals: 0
    },
    users: [],
    tournaments: [],
    approvals: [],
    activity: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const roleOptions = useMemo(() => {
    return ['All', ...new Set(dashboard.users.map((item) => item.role).filter(Boolean))];
  }, [dashboard.users]);

  const statusOptions = useMemo(() => {
    return ['All', ...new Set(dashboard.users.map((item) => item.status).filter(Boolean))];
  }, [dashboard.users]);

  const joinedOptions = useMemo(() => {
    return ['All', ...new Set(dashboard.users.map((item) => item.joined).filter(Boolean))];
  }, [dashboard.users]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return dashboard.users.filter((item) => {
      const matchesSearch =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.email.toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === 'All' || item.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesJoined = joinedFilter === 'All' || item.joined === joinedFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesJoined;
    });
  }, [dashboard.users, joinedFilter, roleFilter, searchQuery, statusFilter]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminDashboard(token);
      setDashboard(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDashboard();
      setFlash('Dashboard data refreshed successfully');
    } catch (refreshError) {
      setError(refreshError.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setReportLoading(true);
      setError('');
      const { blob, fileName } = await downloadAdminReport(token);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setFlash(`Report downloaded: ${fileName}`);
    } catch (reportError) {
      setError(reportError.message);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    loadDashboard();
  }, [token]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-blue-500/20 text-blue-400';
      case 'Captain':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-slate-500/20 text-slate-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Approved':
        return 'text-green-400 bg-green-400/20';
      case 'Inactive':
      case 'Completed':
        return 'text-slate-400 bg-slate-400/20';
      case 'Suspended':
      case 'Rejected':
        return 'text-red-400 bg-red-400/20';
      case 'Upcoming':
        return 'text-blue-400 bg-blue-400/20';
      case 'Registration Open':
      case 'Pending':
        return 'text-amber-400 bg-amber-400/20';
      default:
        return 'text-slate-400 bg-slate-400/20';
    }
  };

  const setFlash = (text) => {
    setMessage(text);
    setError('');
  };

  const handleUserStatusChange = async (userId, status) => {
    try {
      const data = await updateAdminUserStatus(token, userId, status);
      setDashboard((prev) => ({
        ...prev,
        users: prev.users.map((item) => (item.id === userId ? data.user : item))
      }));
      setFlash(data.message);
      loadDashboard();
    } catch (actionError) {
      setError(actionError.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const data = await deleteAdminUser(token, userId);
      setDashboard((prev) => ({
        ...prev,
        users: prev.users.filter((item) => item.id !== userId)
      }));
      setFlash(data.message);
      loadDashboard();
    } catch (actionError) {
      setError(actionError.message);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'admin'}
      userName={user?.fullName || 'Admin'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Admin Dashboard"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-7xl mx-auto"
      >
        {(message || error) && (
          <motion.div variants={itemVariants}>
            <GlassCard className={error ? 'border-red-500/20' : 'border-green-500/20'}>
              <p className={error ? 'text-red-400' : 'text-green-400'}>{error || message}</p>
            </GlassCard>
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div variants={itemVariants}>
            <GlassCard hover className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <UsersIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Total Users</p>
                <h3 className="text-2xl font-bold text-white">{dashboard.stats.totalUsers}</h3>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard hover className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                <TrophyIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Active Tournaments</p>
                <h3 className="text-2xl font-bold text-white">{dashboard.stats.activeTournaments}</h3>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard hover className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0">
                <SwordsIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Matches Played</p>
                <h3 className="text-2xl font-bold text-white">{dashboard.stats.matchesPlayed}</h3>
              </div>
            </GlassCard>
          </motion.div>

        </div>

        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
          <GradientButton
            variant="outline"
            className="py-2.5 px-4 text-sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </GradientButton>
          <GradientButton
            variant="outline"
            className="py-2.5 px-4 text-sm"
            onClick={handleGenerateReport}
            disabled={reportLoading}
          >
            <FileTextIcon className="w-4 h-4 mr-2" />
            {reportLoading ? 'Generating...' : 'Generate Report'}
          </GradientButton>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-white">User Management</h2>
              <div className="w-full sm:max-w-xs">
                <InputField
                  placeholder="Search users..."
                  icon={<SearchIcon className="w-4 h-4" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="!space-y-0"
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                >
                  {roleOptions.map((option) => (
                    <option key={option} value={option} className="bg-slate-900 text-white">
                      {option === 'All' ? 'All Roles' : option}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option} className="bg-slate-900 text-white">
                      {option === 'All' ? 'All Statuses' : option}
                    </option>
                  ))}
                </select>

                <select
                  value={joinedFilter}
                  onChange={(e) => setJoinedFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
                >
                  {joinedOptions.map((option) => (
                    <option key={option} value={option} className="bg-slate-900 text-white">
                      {option === 'All' ? 'All Joined Dates' : option}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('All');
                  setStatusFilter('All');
                  setJoinedFilter('All');
                }}
                className="px-4 py-3 rounded-xl border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Clear Filters
              </button>
            </div>

            <p className="text-sm text-slate-400">
              Showing {filteredUsers.length} of {dashboard.users.length} users
            </p>

            <GlassCard className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">User</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Role</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Profile Progress</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Status</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">Joined</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {item.avatarUrl ? (
                              <img
                                src={getMediaUrl(item.avatarUrl)}
                                alt={item.name}
                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                                {item.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-white">{item.name}</p>
                              <p className="text-xs text-slate-500">{item.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(item.role)}`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 min-w-[260px]">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <span className="font-medium text-white">{item.profileProgress?.percent || 0}% complete</span>
                              <span className="text-slate-400">
                                {item.profileProgress?.missing || 0} fields missing
                              </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${item.profileProgress?.percent || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={item.status}
                            onChange={(e) => handleUserStatusChange(item.id, e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{item.joined}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setFlash(`Viewing ${item.name}`)}>
                              <ExternalLinkIcon className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              onClick={() => handleDeleteUser(item.id)}
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!loading && filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">
                          No users found for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>

        </div>

      </motion.div>
    </DashboardLayout>
  );
}
