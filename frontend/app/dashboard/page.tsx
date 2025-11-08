'use client';

import { AuthenticatedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/store/auth-context';
import { useLogout } from '@/lib/hooks/use-auth-mutations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Calendar, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { mutate: logout, isPending } = useLogout();

  return (
    <AuthenticatedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Tablu Stations Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Reservation Management System
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <Badge variant={user?.role === 'ADMIN' ? 'default' : 'secondary'} className="text-xs">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={() => logout()}
                  disabled={isPending}
                  variant="outline"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome to Tablu Stations!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You have successfully logged in. This is your dashboard where you can manage
              reservations, view statistics, and more.
            </p>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/list">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Reservations (List View)
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage all station reservations with full CRUD operations
                    </p>
                  </div>
                </Link>

                <Link href="/analytics">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Analytics
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View statistics, trends, and insights
                    </p>
                  </div>
                </Link>

                {user?.role === 'ADMIN' && (
                  <Link href="/users">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                          <Users className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          User Management
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage users and permissions
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Implementation Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Phase 1: Complete ✅
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Authentication system is fully implemented and working.
                  </p>
                </div>

                <div className="border border-green-200 dark:border-green-700 rounded-lg p-6 bg-green-50 dark:bg-green-900/20">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Phase 2: Complete ✅
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reservations management with full CRUD operations.
                  </p>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Phase 3: Coming Soon
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status management and conflict detection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthenticatedRoute>
  );
}
