import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BarChart3Icon,
  CalendarIcon,
  ShieldCheckIcon,
  SwordsIcon,
  TrophyIcon,
  MapPinIcon,
  UsersIcon,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import { getMediaUrl } from '../lib/media';
import { getMatches } from '../services/matchService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const sidebarItems = [
  { icon: <UsersIcon className="w-5 h-5" />, label: 'Users', path: '/admin' },
  { icon: <TrophyIcon className="w-5 h-5" />, label: 'Tournaments', path: '/admin/tournaments' },
  { icon: <SwordsIcon className="w-5 h-5" />, label: 'Matches', path: '/admin/matches' },
  { icon: <ShieldCheckIcon className="w-5 h-5" />, label: 'Approvals', path: '/admin/approvals' },
  { icon: <BarChart3Icon className="w-5 h-5" />, label: 'Insights', path: '/admin/insights' },
];

export function InsightsMatches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTournamentFilter, setSelectedTournamentFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMatches();
        setMatches(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load matches:', err);
        setError(err.message || 'Unable to load matches');
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  const tournamentGroups = useMemo(() => {
    const filteredMatches = matches.filter((match) => {
      const tournamentName = (match.tournament || 'Untitled Tournament').trim() || 'Untitled Tournament';
      const status = (match.status || 'Scheduled').trim() || 'Scheduled';

      const matchesTournament = selectedTournamentFilter === 'all' || tournamentName === selectedTournamentFilter;
      const matchesStatus = selectedStatusFilter === 'all' || status === selectedStatusFilter;

      return matchesTournament && matchesStatus;
    });

    const grouped = filteredMatches.reduce((acc, match) => {
      const tournamentName = (match.tournament || 'Untitled Tournament').trim() || 'Untitled Tournament';

      if (!acc[tournamentName]) {
        acc[tournamentName] = [];
      }

      acc[tournamentName].push(match);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([tournamentName, tournamentMatches]) => ({
        tournamentName,
        matches: tournamentMatches.sort((a, b) => new Date(a.matchDate) - new Date(b.matchDate)),
      }))
      .sort((a, b) => a.tournamentName.localeCompare(b.tournamentName));
  }, [matches, selectedTournamentFilter, selectedStatusFilter]);

  const availableTournaments = useMemo(() => {
    const tournaments = matches
      .map((match) => (match.tournament || 'Untitled Tournament').trim() || 'Untitled Tournament')
      .filter(Boolean);

    return Array.from(new Set(tournaments)).sort((a, b) => a.localeCompare(b));
  }, [matches]);

  const availableStatuses = useMemo(() => {
    const scopedMatches = selectedTournamentFilter === 'all'
      ? matches
      : matches.filter((match) => {
          const tournamentName = (match.tournament || 'Untitled Tournament').trim() || 'Untitled Tournament';
          return tournamentName === selectedTournamentFilter;
        });

    const statuses = scopedMatches
      .map((match) => (match.status || 'Scheduled').trim() || 'Scheduled')
      .filter(Boolean);

    return Array.from(new Set(statuses)).sort((a, b) => a.localeCompare(b));
  }, [matches, selectedTournamentFilter]);

  useEffect(() => {
    if (selectedStatusFilter !== 'all' && !availableStatuses.includes(selectedStatusFilter)) {
      setSelectedStatusFilter('all');
    }
  }, [availableStatuses, selectedStatusFilter]);

  const visibleMatchCount = useMemo(() => {
    return tournamentGroups.reduce((sum, group) => sum + group.matches.length, 0);
  }, [tournamentGroups]);

  const exportMatchesPdf = () => {
    if (!tournamentGroups.length) {
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const startX = 40;
    let cursorY = 40;

    const titleParts = ['Match Insights'];
    if (selectedTournamentFilter !== 'all') {
      titleParts.push(`Tournament: ${selectedTournamentFilter}`);
    }
    if (selectedStatusFilter !== 'all') {
      titleParts.push(`Status: ${selectedStatusFilter}`);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text('Match Insights Report', startX, cursorY);

    cursorY += 22;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(titleParts.join('  |  '), startX, cursorY);

    cursorY += 16;
    doc.text(`Generated: ${new Date().toLocaleString()}`, startX, cursorY);

    cursorY += 22;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Visible Matches: ${visibleMatchCount}`, startX, cursorY);

    cursorY += 24;

    tournamentGroups.forEach((group, groupIndex) => {
      if (cursorY > 500) {
        doc.addPage();
        cursorY = 40;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(`${groupIndex + 1}. ${group.tournamentName}`, startX, cursorY);

      cursorY += 10;
      doc.setDrawColor(226, 232, 240);
      doc.line(startX, cursorY, pageWidth - startX, cursorY);
      cursorY += 14;

      autoTable(doc, {
        startY: cursorY,
        head: [['Match', 'Date', 'Venue', 'Status', 'Score']],
        body: group.matches.map((match) => [
          `${match.homeTeam} vs ${match.awayTeam}`,
          match.matchDate ? new Date(match.matchDate).toLocaleDateString() : 'TBD',
          match.venue || 'No venue',
          match.status || 'Scheduled',
          `${match.scores?.home ?? 0} - ${match.scores?.away ?? 0}`,
        ]),
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 6,
          textColor: [15, 23, 42],
          lineColor: [226, 232, 240],
        },
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: startX, right: startX },
      });

      cursorY = doc.lastAutoTable.finalY + 22;
    });

    const sportPart = selectedTournamentFilter === 'all' ? 'all-tournaments' : selectedTournamentFilter.toLowerCase().replace(/\s+/g, '-');
    const statusPart = selectedStatusFilter === 'all' ? 'all-statuses' : selectedStatusFilter.toLowerCase().replace(/\s+/g, '-');
    const datePart = new Date().toISOString().slice(0, 10);

    doc.save(`matches-${sportPart}-${statusPart}-${datePart}.pdf`);
  };

  const matchStats = useMemo(() => {
    const totalMatches = matches.length;
    const completedMatches = matches.filter((match) => match.status === 'Completed').length;
    const scheduledMatches = matches.filter((match) => match.status === 'Scheduled').length;
    const liveMatches = matches.filter((match) => match.status === 'Live').length;

    return { totalMatches, completedMatches, scheduledMatches, liveMatches };
  }, [matches]);

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userRole={user?.role || 'admin'}
      userName={user?.fullName || 'Admin'}
      userAvatar={getMediaUrl(user?.avatarUrl)}
      pageTitle="Match Insights"
      showSearch={false}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <GlassCard className="border-amber-500/20">
          <div className="flex items-center justify-between gap-4 text-white">
            <div>
              <h1 className="text-2xl font-semibold mb-2">Match Insights</h1>
              <p className="text-sm text-slate-400">
                Matches grouped by tournament, loaded directly from the matches collection.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/insights')}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Insights
            </button>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <GlassCard hover className="border-white/10">
            <p className="text-sm text-slate-400">Total Matches</p>
            <h2 className="text-3xl font-semibold text-white mt-2">{matchStats.totalMatches}</h2>
          </GlassCard>
          <GlassCard hover className="border-white/10">
            <p className="text-sm text-slate-400">Completed</p>
            <h2 className="text-3xl font-semibold text-white mt-2">{matchStats.completedMatches}</h2>
          </GlassCard>
          <GlassCard hover className="border-white/10">
            <p className="text-sm text-slate-400">Scheduled</p>
            <h2 className="text-3xl font-semibold text-white mt-2">{matchStats.scheduledMatches}</h2>
          </GlassCard>
          <GlassCard hover className="border-white/10">
            <p className="text-sm text-slate-400">Live</p>
            <h2 className="text-3xl font-semibold text-white mt-2">{matchStats.liveMatches}</h2>
          </GlassCard>
        </div>

        <GlassCard className="border-white/10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Matches by Tournament</h2>
              <p className="text-sm text-slate-400">Each tournament expands into its associated matches.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="tournament-filter" className="text-sm text-slate-300">Tournament</label>
                <select
                  id="tournament-filter"
                  value={selectedTournamentFilter}
                  onChange={(event) => setSelectedTournamentFilter(event.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                >
                  <option value="all">All Tournaments</option>
                  {availableTournaments.map((tournament) => (
                    <option key={tournament} value={tournament}>
                      {tournament}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="status-filter" className="text-sm text-slate-300">Status</label>
                <select
                  id="status-filter"
                  value={selectedStatusFilter}
                  onChange={(event) => setSelectedStatusFilter(event.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-sky-500"
                >
                  <option value="all">All Statuses</option>
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedTournamentFilter('all');
                  setSelectedStatusFilter('all');
                }}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                Clear Filters
              </button>

              <button
                type="button"
                onClick={exportMatchesPdf}
                disabled={!tournamentGroups.length}
                className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export PDF
              </button>
            </div>
          </div>

          <div className="mb-5 text-sm text-slate-400">
            Showing {visibleMatchCount} match{visibleMatchCount !== 1 ? 'es' : ''}
            {selectedTournamentFilter !== 'all' ? ` in ${selectedTournamentFilter}` : ''}
            {selectedStatusFilter !== 'all' ? ` with status ${selectedStatusFilter}` : ''}
          </div>

          {loading ? (
            <div className="text-center py-10">
              <p className="text-slate-400">Loading matches...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-400">{error}</p>
            </div>
          ) : tournamentGroups.length > 0 ? (
            <div className="space-y-5">
              {tournamentGroups.map((group) => (
                <div key={group.tournamentName} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{group.tournamentName}</h3>
                      <p className="text-sm text-slate-400">{group.matches.length} match{group.matches.length !== 1 ? 'es' : ''}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {group.matches.map((match) => (
                      <div key={match._id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="rounded-2xl bg-blue-500/10 p-3">
                            <SwordsIcon className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{match.homeTeam} vs {match.awayTeam}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {match.matchDate ? new Date(match.matchDate).toLocaleDateString() : 'TBD'}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" />
                                {match.venue || 'No venue'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            match.status === 'Completed'
                              ? 'bg-slate-500/20 text-slate-300'
                              : match.status === 'Live'
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {match.status || 'Scheduled'}
                          </span>
                          <div className="min-w-[90px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                            <p className="text-[10px] uppercase tracking-widest text-slate-500">Score</p>
                            <p className="text-lg font-semibold text-white">
                              {match.scores?.home ?? 0} - {match.scores?.away ?? 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-400">No matches found</p>
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
