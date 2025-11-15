import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../actions/axiosInstance';

export interface ViewerStatistics {
  locationId: string;
  locationName: string;
  dailyViewers: number;
  weeklyViewers: number;
  monthlyViewers: number;
}

export interface DateRangeViewers {
  locationId: string;
  locationName: string;
  totalViewers: number;
  startDate: string;
  endDate: string;
}

export interface CostPerViewResult {
  totalViewers: number;
  costPerView: number;
  locations: Array<{
    locationId: string;
    locationName: string;
    viewers: number;
    costShare: number;
  }>;
}

export interface BestPlanResult {
  recommendedLocations: Array<{
    locationId: string;
    locationName: string;
    viewers: number;
    costPerView: number;
    efficiency: number;
  }>;
  totalViewers: number;
  totalCost: number;
  averageCostPerView: number;
}

/**
 * Get viewer statistics for all locations
 */
export function useAllLocationsViewers(includeInactive = false) {
  return useQuery({
    queryKey: ['viewer-statistics', 'all', includeInactive],
    queryFn: async () => {
      const response = await axiosInstance.get<{ data: ViewerStatistics[] }>(
        '/api/v1/viewer-statistics/all',
        { params: { includeInactive } }
      );
      return response.data.data;
    },
  });
}

/**
 * Get viewer statistics for a single location
 */
export function useLocationViewers(locationId: string) {
  return useQuery({
    queryKey: ['viewer-statistics', 'location', locationId],
    queryFn: async () => {
      const response = await axiosInstance.get<{ data: ViewerStatistics }>(
        `/api/v1/viewer-statistics/location/${locationId}`
      );
      return response.data.data;
    },
    enabled: !!locationId,
  });
}

/**
 * Get viewers for multiple locations in a date range
 */
export function useMultipleLocationsViewers() {
  return useMutation({
    mutationFn: async ({
      locationIds,
      startDate,
      endDate,
    }: {
      locationIds: string[];
      startDate: string;
      endDate: string;
    }) => {
      const response = await axiosInstance.post<{ data: DateRangeViewers[] }>(
        '/api/v1/viewer-statistics/multiple-locations',
        { locationIds, startDate, endDate }
      );
      return response.data.data;
    },
  });
}

/**
 * Calculate cost per view for multiple locations
 */
export function useCalculateCostPerView() {
  return useMutation({
    mutationFn: async ({
      locationIds,
      totalCost,
      startDate,
      endDate,
    }: {
      locationIds: string[];
      totalCost: number;
      startDate: string;
      endDate: string;
    }) => {
      const response = await axiosInstance.post<{ data: CostPerViewResult }>(
        '/api/v1/viewer-statistics/cost-per-view',
        { locationIds, totalCost, startDate, endDate }
      );
      return response.data.data;
    },
  });
}

/**
 * Get best location plan
 */
export function useGetBestPlan() {
  return useMutation({
    mutationFn: async ({
      totalCost,
      startDate,
      endDate,
      maxLocations,
    }: {
      totalCost: number;
      startDate: string;
      endDate: string;
      maxLocations?: number;
    }) => {
      const response = await axiosInstance.post<{ data: BestPlanResult }>(
        '/api/v1/viewer-statistics/best-plan',
        { totalCost, startDate, endDate, maxLocations }
      );
      return response.data.data;
    },
  });
}
