import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasStoredToken, readStoredUser } from '../utils/authSession';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const sessionUser = user ?? readStoredUser();
  const authed = Boolean(hasStoredToken() && sessionUser);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!authed) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search, reason: 'login_required' }}
      />
    );
  }
  if (roles && !roles.includes(sessionUser.role_slug)) {
    const fallback =
      sessionUser.role_slug === 'doctor'
        ? '/doctor'
        : sessionUser.role_slug === 'patient'
          ? '/patient'
          : '/';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
