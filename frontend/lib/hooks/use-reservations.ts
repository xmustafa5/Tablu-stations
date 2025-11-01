import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
} from '../actions/reservation.actions';
import type {
  CreateReservationRequest,
  UpdateReservationRequest,
  ReservationListParams,
} from '../types/api.types';

// Query Keys
export const reservationKeys = {
  all: ['reservations'] as const,
  lists: () => [...reservationKeys.all, 'list'] as const,
  list: (params?: ReservationListParams) => [...reservationKeys.lists(), params] as const,
  details: () => [...reservationKeys.all, 'detail'] as const,
  detail: (id: string) => [...reservationKeys.details(), id] as const,
};

/**
 * Hook to fetch all reservations with optional filters
 */
export function useReservations(params?: ReservationListParams) {
  return useQuery({
    queryKey: reservationKeys.list(params),
    queryFn: () => getReservations(params),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single reservation by ID
 */
export function useReservation(id: string) {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => getReservationById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new reservation
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReservationRequest) => createReservation(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Reservation created successfully');
      // Invalidate and refetch reservations list
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
    },
    onError: (error: any) => {
      // Handle validation errors
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: { field: string; message: string }) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        const errorMessage =
          error?.response?.data?.message || error?.message || 'Failed to create reservation';
        toast.error(errorMessage);
      }
    },
  });
}

/**
 * Hook to update an existing reservation
 */
export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReservationRequest }) =>
      updateReservation(id, data),
    onSuccess: (response, variables) => {
      toast.success(response.message || 'Reservation updated successfully');
      // Invalidate specific reservation and lists
      queryClient.invalidateQueries({ queryKey: reservationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
    },
    onError: (error: any) => {
      // Handle validation errors
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach((err: { field: string; message: string }) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        const errorMessage =
          error?.response?.data?.message || error?.message || 'Failed to update reservation';
        toast.error(errorMessage);
      }
    },
  });
}

/**
 * Hook to delete a reservation
 */
export function useDeleteReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReservation(id),
    onSuccess: (response) => {
      toast.success(response.message || 'Reservation deleted successfully');
      // Invalidate reservations list
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete reservation';
      toast.error(errorMessage);
    },
  });
}
