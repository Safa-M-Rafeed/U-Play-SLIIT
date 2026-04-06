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
    <BrowserRouter>
      <Routes>

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* PUBLIC */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* COMMON PROTECTED */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* ROLE DASHBOARDS */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['captain']} />}>
          <Route path="/captain" element={<CaptainDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* ✅ SHARED TOURNAMENT ACCESS (VIEW ONLY FOR ALL) */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'captain', 'admin']} />}>
          
          {/* LIST */}
          <Route path="/:role/tournaments" element={<TournamentList />} />

          {/* DETAILS */}
          <Route path="/:role/tournaments/:id" element={<TournamentDetail />} />
        </Route>

        {/* ✅ ADMIN ONLY CRUD */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/tournaments/create" element={<CreateTournament />} />
          <Route path="/admin/tournaments/:id/edit" element={<EditTournament />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}