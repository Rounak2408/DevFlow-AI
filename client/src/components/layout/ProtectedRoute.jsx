import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';

export function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const loc = useLocation();
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist?.hasHydrated?.() ?? false);

  useEffect(() => {
    const p = useAuthStore.persist;
    if (!p) {
      setHydrated(true);
      return undefined;
    }
    if (p.hasHydrated?.()) {
      setHydrated(true);
      return undefined;
    }
    return p.onFinishHydration?.(() => setHydrated(true));
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#0B0F19] text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}
