import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { LoginPage } from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import StudentDashboard from './pages/StudentDashboard';
import CaptainDashboard from './pages/CaptainDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateMatch from './pages/CreateMatch';
import MatchSchedule from './pages/MatchSchedule';
import MatchManagement from './pages/MatchManagement';
import Leaderboard from './pages/Leaderboard';
import FixturesPage from './pages/FixturesPage';

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
        <Route path="/student/fixtures" element={<FixturesPage />} />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Student Routes - FIXED REDIRECTS */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/fixtures" element={<MatchSchedule />} />
          <Route path="/student/leaderboard" element={<Leaderboard />} />
          <Route path="/student/tournaments" element={<Navigate to="/student" replace />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['captain']} />}>
          <Route path="/captain" element={<CaptainDashboard />} />
          <Route path="/captain/team" element={<Navigate to="/captain" replace />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/matches" element={<MatchManagement />} />
          <Route path="/admin/create-match" element={<CreateMatch />} />
          <Route path="/admin/leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}