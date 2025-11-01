// Tablu Stations API Types
// Generated from API Documentation

// ==================== ENUMS ====================

export enum ReservationStatus {
  WAITING = 'WAITING',           // Start time is in the future
  ACTIVE = 'ACTIVE',            // Current time is between start and end
  ENDING_SOON = 'ENDING_SOON',  // Less than 48 hours until end time
  COMPLETED = 'COMPLETED'        // End time has passed
}

export enum Role {
  USER = 'USER',     // Regular user with access to own reservations
  ADMIN = 'ADMIN'    // Administrator with full access
}

// ==================== DATA MODELS ====================

export interface User {
  id: string;              // UUID
  email: string;
  name: string;
  role: Role;
  createdAt: string;       // ISO 8601 date-time
  updatedAt: string;       // ISO 8601 date-time
}

export interface Reservation {
  id: string;              // UUID
  advertiserName: string;
  customerName: string;
  location: string;
  startTime: string;       // ISO 8601 date-time
  endTime: string;         // ISO 8601 date-time
  status: ReservationStatus;
  userId: string;          // UUID
  createdAt: string;       // ISO 8601 date-time
  updatedAt: string;       // ISO 8601 date-time
}

// ==================== API RESPONSE ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: Pagination;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface Pagination {
  total: number;           // Total number of items
  page: number;            // Current page number
  limit: number;           // Items per page
  totalPages: number;      // Total number of pages
}

// ==================== REQUEST DTOs ====================

// Auth
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Reservations
export interface CreateReservationRequest {
  advertiserName: string;
  customerName: string;
  location: string;
  startTime: string;        // ISO 8601 date-time
  endTime: string;          // ISO 8601 date-time
}

export interface UpdateReservationRequest {
  advertiserName?: string;
  customerName?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
}

export interface ReservationListParams {
  page?: number;
  limit?: number;
  status?: ReservationStatus;
  search?: string;
}

// Users
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: Role;
  password?: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: Role;
  search?: string;
}

export interface BulkUpdateUsersRequest {
  userIds: string[];
  role?: Role;
}

// Status Management
export interface UpdateStatusRequest {
  status: ReservationStatus;
}

export interface CheckConflictsRequest {
  location: string;
  startTime: string;
  endTime: string;
  excludeReservationId?: string;
}

export interface ConflictResponse {
  hasConflicts: boolean;
  conflictCount: number;
  conflicts: Reservation[];
}

export interface AvailableSlotsParams {
  location: string;
  date: string;            // YYYY-MM-DD
  slotDuration?: number;   // in minutes
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  location: string;
  date: string;
  availableSlots: TimeSlot[];
}

export interface StatusSummary {
  WAITING: number;
  ACTIVE: number;
  ENDING_SOON: number;
  COMPLETED: number;
}

export interface AutoUpdateResult {
  activatedCount: number;
  endingSoonCount: number;
}

export interface StatusChangeResult {
  oldStatus: ReservationStatus;
  newStatus: ReservationStatus;
  reservation: Reservation;
}

// Statistics & Analytics
export interface DashboardStats {
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  pendingReservations: number;
  totalRevenue?: number;
  averageDuration?: number;
  occupancyRate?: number;
}

export interface RevenueStats {
  totalRevenue: number;
  revenueByStatus: Record<string, number>;
  revenueByLocation: LocationRevenue[];
}

export interface LocationRevenue {
  location: string;
  revenue: number;
  reservationCount: number;
}

export interface GrowthMetrics {
  currentPeriodReservations: number;
  previousPeriodReservations: number;
  growthRate: number;
  growthPercentage: number;
}

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageReservationsPerCustomer: number;
  topCustomers: TopCustomer[];
}

export interface TopCustomer {
  userId: string;
  reservationCount: number;
  totalRevenue?: number;
}

export interface PeakHourData {
  hour: number;
  reservationCount: number;
  averageOccupancy: number;
}

export interface ForecastData {
  date: string;
  predictedReservations: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface UserStats {
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    createdAt: string;
  };
  reservations: {
    total: number;
    byStatus: Record<string, number>;
  };
}

// ==================== QUERY PARAMS ====================

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface GrowthMetricsParams {
  currentStart: string;
  currentEnd: string;
  previousStart: string;
  previousEnd: string;
}

export interface ForecastParams {
  historicalDays?: number;
  forecastDays?: number;
}
