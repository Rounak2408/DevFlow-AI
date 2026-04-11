import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

export function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}
