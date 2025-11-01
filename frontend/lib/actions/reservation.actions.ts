import axiosInstance from "./axiosInstance";
import type {
  Reservation,
  ApiResponse,
  CreateReservationRequest,
  UpdateReservationRequest,
  ReservationListParams,
} from "../types/api.types";

/**
 * Get all reservations with optional filters
 * GET /api/v1/reservations
 */
export async function getReservations(params?: ReservationListParams) {
  const response = await axiosInstance.get<ApiResponse<Reservation[]>>(
    '/api/v1/reservations',
    { params }
  );
  return response.data;
}

/**
 * Get reservation by ID
 * GET /api/v1/reservations/:id
 */
export async function getReservationById(id: string) {
  const response = await axiosInstance.get<ApiResponse<Reservation>>(
    `/api/v1/reservations/${id}`
  );
  return response.data;
}

/**
 * Create new reservation
 * POST /api/v1/reservations
 */
export async function createReservation(data: CreateReservationRequest) {
  const response = await axiosInstance.post<ApiResponse<Reservation>>(
    '/api/v1/reservations',
    data
  );
  return response.data;
}

/**
 * Update reservation
 * PUT /api/v1/reservations/:id
 */
export async function updateReservation(
  id: string,
  data: UpdateReservationRequest
) {
  const response = await axiosInstance.put<ApiResponse<Reservation>>(
    `/api/v1/reservations/${id}`,
    data
  );
  return response.data;
}

/**
 * Delete reservation
 * DELETE /api/v1/reservations/:id
 */
export async function deleteReservation(id: string) {
  const response = await axiosInstance.delete<ApiResponse<void>>(
    `/api/v1/reservations/${id}`
  );
  return response.data;
}
