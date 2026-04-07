import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Redirects already-authenticated users away from public pages
 * (login / register) to their role-specific dashboard.
 */
export function PublicRoute() {
  const { user, token, loading } = useAuth();

  if (loading) return null;

  if (token && user) {
    const home = { admin: '/admin', captain: '/captain', student: '/student' };
    return <Navigate to={home[user.role] ?? '/student'} replace />;
  }

  return <Outlet />;
}