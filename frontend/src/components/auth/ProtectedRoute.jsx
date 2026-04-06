import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Redirects unauthenticated users to /login.
 * If allowedRoles is provided, also redirects unauthorised roles
 * to their own dashboard (or /login if no role is known).
 */
export function ProtectedRoute({ allowedRoles }) {
  const { user, token, loading } = useAuth();

  if (loading) return null; // or a full-page spinner

  if (!token || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Send each role back to their own home
    const home = { admin: '/admin', captain: '/captain', student: '/student' };
    return <Navigate to={home[user.role] ?? '/login'} replace />;
  }

  return <Outlet />;
}