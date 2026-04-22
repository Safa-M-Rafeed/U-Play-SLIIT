import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { TournamentProvider } from './context/TournamentContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';

// ✅ Pages
import HomePage from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

import { StudentDashboard } from './pages/StudentDashboard';
import { StatsStudent } from './pages/StatsStudent';
import { CaptainDashboard } from './pages/CaptainDashboard';
import AdminDashboard from './pages/AdminDashboard';

// ✅ Match
import CreateMatch from './pages/CreateMatch';
import MatchSchedule from './pages/MatchSchedule';
import MatchManagement from './pages/MatchManagement';
import Leaderboard from './pages/Leaderboard';
import FixturesPage from './pages/FixturesPage';

// ✅ Tournament + Insights
import CreateTournament from './pages/tournament/CreateTournament';
import EditTournament from './pages/tournament/EditTournament';
import TournamentList from './pages/tournament/TournamentList';
import TournamentDetail from './pages/tournament/TournamentDetail';

import { Insights } from './pages/Insights';
import { TournamentsInsights } from './pages/TournamentsInsights';
import { InsightsUser } from './pages/InsightsUser';
import { InsightUser2 } from './pages/InsightUser2';
import { InsightsTeams } from './pages/InsightsTeams';
import { InsightsMatches } from './pages/InsightsMatches';

export function App() {
  return (
    <TournamentProvider>
      <BrowserRouter>
        <Routes>

          {/* ✅ Homepage */}
          <Route path='/' element={<HomePage />} />
          <Route path='/home' element={<HomePage />} />

          {/* ── Public ── */}
          <Route element={<PublicRoute />}>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
          </Route>

          {/* ── Shared protected ── */}
          <Route element={<ProtectedRoute />}>
            <Route path='/profile' element={<ProfilePage />} />
          </Route>

        {/* ── Student ── */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path='/student' element={<StudentDashboard />} />

          {/* ✅ KEEP BOTH */}
          <Route path='/student/fixtures' element={<MatchSchedule />} />
          <Route path='/student/leaderboard' element={<Leaderboard />} />
          <Route path='/student/stats' element={<StatsStudent />} />

          <Route path='/student/tournaments' element={<TournamentList />} />
          <Route path='/student/tournaments/:id' element={<TournamentDetail />} />
        </Route>

        {/* ── Captain ── */}
        <Route element={<ProtectedRoute allowedRoles={['captain']} />}>
          <Route path='/captain' element={<CaptainDashboard />} />

          {/* Team Management */}
          <Route path='/captain/team' element={<CaptainDashboard />} />
          <Route path='/captain/players' element={<CaptainDashboard />} />
          <Route path='/captain/status' element={<CaptainDashboard />} />

          {/* Tournament features */}
          <Route path='/captain/tournaments' element={<TournamentList />} />
          <Route path='/captain/tournaments/:id' element={<TournamentDetail />} />
        </Route>

        {/* ── Admin ── */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path='/admin' element={<AdminDashboard />} />

          {/* ✅ Match Management */}
          <Route path='/admin/matches' element={<MatchManagement />} />
          <Route path='/admin/create-match' element={<CreateMatch />} />
          <Route path='/admin/leaderboard' element={<Leaderboard />} />

          {/* ✅ Insights */}
          <Route path='/admin/insights' element={<Insights />} />
          <Route path='/admin/tournaments-insights' element={<TournamentsInsights />} />
          <Route path='/admin/insights-users' element={<InsightsUser />} />
          <Route path='/admin/insights-users/:id' element={<InsightUser2 />} />
          <Route path='/admin/insights-teams' element={<InsightsTeams />} />
          <Route path='/admin/insights-matches' element={<InsightsMatches />} />

          {/* ✅ Approvals */}
          <Route path='/admin/approvals' element={<AdminDashboard />} />

          {/* ✅ Tournament CRUD */}
          <Route path='/admin/tournaments' element={<TournamentList />} />
          <Route path='/admin/tournaments/create' element={<CreateTournament />} />
          <Route path='/admin/tournaments/:id' element={<TournamentDetail />} />
          <Route path='/admin/tournaments/:id/edit' element={<EditTournament />} />
        </Route>

          {/* Catch all */}
          <Route path='*' element={<Navigate to='/' />} />

        </Routes>
      </BrowserRouter>
    </TournamentProvider>
  );
}