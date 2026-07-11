import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '@certifychain/shared';
import { useAuthStore } from '@/stores/authStore';

export function RequireAuth({ children }: PropsWithChildren): JSX.Element {
  const { user, isHydrating } = useAuthStore();
  const location = useLocation();

  if (isHydrating) return <div className="p-8 text-center text-sm text-primary-500">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export function RequireRole({
  role,
  children,
}: PropsWithChildren<{ role: UserRole | UserRole[] }>): JSX.Element {
  const { user } = useAuthStore();
  const roles = Array.isArray(role) ? role : [role];

  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/not-found" replace />;
  return <>{children}</>;
}
