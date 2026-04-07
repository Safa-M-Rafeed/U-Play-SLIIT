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
import RegisterTournamentPage from './pages/RegisterTournamentPage';

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
          <Route path="/captain/register" element={<RegisterTournamentPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/tournaments" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/matches" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/approvals" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/results" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}