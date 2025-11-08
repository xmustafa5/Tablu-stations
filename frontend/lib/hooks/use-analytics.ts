import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ============ Statistics API Response Types (REAL DATA ONLY - NO FAKE REVENUE) ============

export interface DashboardStats {
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  pendingReservations: number;
  waitingReservations: number;
  endingSoonReservations: number;
  averageReservationDuration: number;
  occupancyRate: number;
}

export interface ReservationsByStatus {
  waiting: number;
  active: number;
  endingSoon: number;
  completed: number;
}

export interface OccupancyStats {
  overallOccupancyRate: number;
  locationOccupancy: Array<{
    location: string;
    occupancyRate: number;
    totalHours: number;
    bookedHours: number;
    reservationCount: number;
  }>;
}

export interface PopularLocation {
  location: string;
  count: number;
  totalHours: number;
}

export interface ReservationTrend {
  period: string;
  count: number;
  totalDurationHours: number;
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
  topCustomers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    reservationCount: number;
    totalHours: number;
  }>;
}

export interface PerformanceMetrics {
  completionRate: number;
  cancellationRate: number;
  averageLeadTime: number;
  statusDistribution: {
    waiting: number;
    active: number;
    endingSoon: number;
    completed: number;
  };
}

export interface PeakHour {
  hour: number;
  reservationCount: number;
  averageDurationHours: number;
}

export interface DayOfWeekAnalysis {
  dayOfWeek: number;
  dayName: string;
  reservationCount: number;
  totalDurationHours: number;
}

export interface ForecastData {
  date: string;
  predictedReservations: number;
  confidence: "high" | "medium" | "low";
}

// ============ API Functions ============

// 1. Dashboard Statistics
export const getDashboardStats = async (
  startDate?: string,
  endDate?: string
): Promise<DashboardStats> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await fetch(
    `${API_URL}/api/v1/statistics/dashboard${params.toString() ? `?${params.toString()}` : ""}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }

  const data = await response.json();
  return data.data;
};

// 2. Reservations By Status
export const getReservationsByStatus = async (
  startDate?: string,
  endDate?: string
): Promise<ReservationsByStatus> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await fetch(
    `${API_URL}/api/v1/statistics/reservations-by-status${params.toString() ? `?${params.toString()}` : ""}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch reservations by status");
  }

  const data = await response.json();
  return data.data;
};

// 3. Occupancy Statistics
export const getOccupancyStats = async (
  startDate: string,
  endDate: string
): Promise<OccupancyStats> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await fetch(
    `${API_URL}/api/v1/statistics/occupancy?${params.toString()}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch occupancy stats");
  }

  const data = await response.json();
  return data.data;
};

// 4. Popular Locations
export const getPopularLocations = async (
  startDate?: string,
  endDate?: string,
  limit: number = 10
): Promise<PopularLocation[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  params.append("limit", limit.toString());

  const response = await fetch(
    `${API_URL}/api/v1/statistics/locations/popular?${params.toString()}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch popular locations");
  }

  const data = await response.json();
  return data.data;
};

// 5. Reservation Trends
export const getReservationTrends = async (
  startDate: string,
  endDate: string,
  interval: "day" | "week" | "month"
): Promise<ReservationTrend[]> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
    interval,
  });

  const response = await fetch(
    `${API_URL}/api/v1/statistics/trends?${params.toString()}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch reservation trends");
  }

  const data = await response.json();
  return data.data;
};

// 6. Growth Metrics
export const getGrowthMetrics = async (
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
): Promise<GrowthMetrics> => {
  const params = new URLSearchParams({
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
  });

  const response = await fetch(
    `${API_URL}/api/v1/statistics/analytics/growth?${params.toString()}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch growth metrics");
  }

  const data = await response.json();
  return data.data;
};

// 7. Customer Metrics
export const getCustomerMetrics = async (
  startDate: string,
  endDate: string
): Promise<CustomerMetrics> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await fetch(
    `${API_URL}/api/v1/statistics/analytics/customers?${params.toString()}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch customer metrics");
  }

  const data = await response.json();
  return data.data;
};

// 8. Performance Metrics
export const getPerformanceMetrics = async (
  startDate: string,
  endDate: string
): Promise<PerformanceMetrics> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await fetch(
    `${API_URL}/api/v1/statistics/analytics/performance?${params.toString()}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch performance metrics");
  }

  const data = await response.json();
  return data.data;
};

// 9. Peak Hours Analysis
export const getPeakHours = async (
  startDate: string,
  endDate: string
): Promise<PeakHour[]> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await fetch(
    `${API_URL}/api/v1/statistics/analytics/peak-hours?${params.toString()}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch peak hours");
  }

  const data = await response.json();
  return data.data;
};

// 10. Day of Week Analysis
export const getDayOfWeekAnalysis = async (
  startDate: string,
  endDate: string
): Promise<DayOfWeekAnalysis[]> => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  const response = await fetch(
    `${API_URL}/api/v1/statistics/analytics/day-of-week?${params.toString()}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch day of week analysis");
  }

  const data = await response.json();
  return data.data;
};

// 11. Forecast
export const getForecast = async (
  historicalDays: number = 30,
  forecastDays: number = 7
): Promise<ForecastData[]> => {
  const params = new URLSearchParams({
    historicalDays: historicalDays.toString(),
    forecastDays: forecastDays.toString(),
  });

  const response = await fetch(
    `${API_URL}/api/v1/statistics/analytics/forecast?${params.toString()}`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch forecast");
  }

  const data = await response.json();
  return data.data;
};

// ============ React Query Hooks ============

export const useDashboardStats = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["statistics", "dashboard", startDate, endDate],
    queryFn: () => getDashboardStats(startDate, endDate),
  });
};

export const useReservationsByStatus = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ["statistics", "reservations-by-status", startDate, endDate],
    queryFn: () => getReservationsByStatus(startDate, endDate),
  });
};

export const useOccupancyStats = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["statistics", "occupancy", startDate, endDate],
    queryFn: () => getOccupancyStats(startDate, endDate),
  });
};

export const usePopularLocations = (
  startDate?: string,
  endDate?: string,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ["statistics", "popular-locations", startDate, endDate, limit],
    queryFn: () => getPopularLocations(startDate, endDate, limit),
  });
};

export const useReservationTrends = (
  startDate: string,
  endDate: string,
  interval: "day" | "week" | "month"
) => {
  return useQuery({
    queryKey: ["statistics", "trends", startDate, endDate, interval],
    queryFn: () => getReservationTrends(startDate, endDate, interval),
  });
};

export const useGrowthMetrics = (
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
) => {
  return useQuery({
    queryKey: ["statistics", "growth", currentStart, currentEnd, previousStart, previousEnd],
    queryFn: () => getGrowthMetrics(currentStart, currentEnd, previousStart, previousEnd),
  });
};

export const useCustomerMetrics = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["statistics", "customers", startDate, endDate],
    queryFn: () => getCustomerMetrics(startDate, endDate),
  });
};

export const usePerformanceMetrics = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["statistics", "performance", startDate, endDate],
    queryFn: () => getPerformanceMetrics(startDate, endDate),
  });
};

export const usePeakHours = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["statistics", "peak-hours", startDate, endDate],
    queryFn: () => getPeakHours(startDate, endDate),
  });
};

export const useDayOfWeekAnalysis = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["statistics", "day-of-week", startDate, endDate],
    queryFn: () => getDayOfWeekAnalysis(startDate, endDate),
  });
};

export const useForecast = (historicalDays: number = 30, forecastDays: number = 7) => {
  return useQuery({
    queryKey: ["statistics", "forecast", historicalDays, forecastDays],
    queryFn: () => getForecast(historicalDays, forecastDays),
  });
};
