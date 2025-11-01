'use client';

import { useState } from 'react';
import { AuthenticatedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/store/auth-context';
import { useLogout } from '@/lib/hooks/use-auth-mutations';
import {
  useReservations,
  useCreateReservation,
  useUpdateReservation,
  useDeleteReservation,
} from '@/lib/hooks/use-reservations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StatusBadge } from '@/components/status-badge';
import {
  LogOut,
  User,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { ReservationStatus, type Reservation, type CreateReservationRequest } from '@/lib/types/api.types';
import { format } from 'date-fns';

export default function ReservationsPage() {
  const { user } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // State for filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('');

  // Fetch reservations
  const { data, isLoading, error } = useReservations({
    page,
    limit,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  // Mutations
  const createMutation = useCreateReservation();
  const updateMutation = useUpdateReservation();
  const deleteMutation = useDeleteReservation();

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateReservationRequest>({
    advertiserName: '',
    customerName: '',
    location: '',
    startTime: '',
    endTime: '',
  });

  const handleCreateReservation = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        resetForm();
      },
    });
  };

  const handleEditReservation = () => {
    if (!selectedReservation) return;
    updateMutation.mutate(
      { id: selectedReservation.id, data: formData },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedReservation(null);
          resetForm();
        },
      }
    );
  };

  const handleDeleteReservation = () => {
    if (!selectedReservation) return;
    deleteMutation.mutate(selectedReservation.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedReservation(null);
      },
    });
  };

  const openEditDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setFormData({
      advertiserName: reservation.advertiserName,
      customerName: reservation.customerName,
      location: reservation.location,
      startTime: reservation.startTime.slice(0, 16), // Format for datetime-local
      endTime: reservation.endTime.slice(0, 16),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      advertiserName: '',
      customerName: '',
      location: '',
      startTime: '',
      endTime: '',
    });
  };

  // Safely extract reservations array with type guard
  const reservations = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination;

  return (
    <AuthenticatedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Reservations Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage all your station reservations
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
                  disabled={isLoggingOut}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Filters and Actions */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by advertiser, customer, or location..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value as ReservationStatus | '');
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ReservationStatus.WAITING}>Waiting</SelectItem>
                      <SelectItem value={ReservationStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={ReservationStatus.ENDING_SOON}>Ending Soon</SelectItem>
                      <SelectItem value={ReservationStatus.COMPLETED}>Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Create Button */}
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Reservation
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">Failed to load reservations</p>
                </div>
              ) : reservations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No reservations found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Advertiser
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        End Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {reservations?.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {reservation.advertiserName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {reservation.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {reservation.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(reservation.startTime), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(reservation.endTime), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={reservation.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => openEditDialog(reservation)}
                              variant="ghost"
                              size="sm"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => openDeleteDialog(reservation)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} results
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {page} of {pagination.totalPages}
                    </span>
                    <Button
                      onClick={() => setPage(page + 1)}
                      disabled={page === pagination.totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Reservation</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new reservation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Advertiser Name</label>
              <Input
                value={formData.advertiserName}
                onChange={(e) => setFormData({ ...formData, advertiserName: e.target.value })}
                placeholder="Enter advertiser name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name</label>
              <Input
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateReservation}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reservation</DialogTitle>
            <DialogDescription>
              Update the reservation details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Advertiser Name</label>
              <Input
                value={formData.advertiserName}
                onChange={(e) => setFormData({ ...formData, advertiserName: e.target.value })}
                placeholder="Enter advertiser name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name</label>
              <Input
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Enter customer name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditReservation}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the reservation for{' '}
              <strong>{selectedReservation?.advertiserName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReservation}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthenticatedRoute>
  );
}
