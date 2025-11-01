'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store/auth-context';
import { Role } from '@/lib/types/api.types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: Role;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Redirect if authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Redirect if specific role is required but user doesn't have it
      if (requiredRole && user?.role !== requiredRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, requiredRole, user, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if auth check fails
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

// Helper component for admin-only routes
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} requiredRole={Role.ADMIN}>
      {children}
    </ProtectedRoute>
  );
}

// Helper component for authenticated routes (any role)
export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  );
}
