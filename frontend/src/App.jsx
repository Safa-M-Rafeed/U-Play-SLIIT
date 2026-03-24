import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { StudentDashboard } from './pages/StudentDashboard';
import { CaptainDashboard } from './pages/CaptainDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import TournamentList from './pages/tournament/TournamentList';
import TournamentDetail from './pages/tournament/TournamentDetail';
import CreateTournament from './pages/tournament/CreateTournament';
import EditTournament from './pages/tournament/EditTournament';

export function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/tournaments" element={<Navigate to="/student" replace />} />
          <Route path="/student/fixtures" element={<Navigate to="/student" replace />} />
          <Route path="/student/leaderboard" element={<Navigate to="/student" replace />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['captain']} />}>
          <Route path="/captain" element={<CaptainDashboard />} />
          <Route path="/captain/team" element={<Navigate to="/captain" replace />} />
          <Route path="/captain/players" element={<Navigate to="/captain" replace />} />
          <Route path="/captain/register" element={<Navigate to="/captain" replace />} />
          <Route path="/captain/status" element={<Navigate to="/captain" replace />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/matches" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/approvals" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/results" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/tournaments" element={<TournamentList />} />
          <Route path="/admin/tournaments/create" element={<CreateTournament />} />
          <Route path="/admin/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/admin/tournaments/:id/edit" element={<EditTournament />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}