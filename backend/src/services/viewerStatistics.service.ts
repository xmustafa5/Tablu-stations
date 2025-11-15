import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

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
  startDate: Date;
  endDate: Date;
}

export class ViewerStatisticsService {
  /**
   * Get viewer statistics for a single location
   */
  async getLocationViewers(locationId: string): Promise<ViewerStatistics> {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new AppError('Location not found', 404);
    }

    // Calculate daily, weekly viewers from monthly
    const monthlyViewers = location.monthlyViewers;
    const dailyViewers = Math.round(monthlyViewers / 30);
    const weeklyViewers = Math.round(monthlyViewers / 4.33); // Average weeks per month

    return {
      locationId: location.id,
      locationName: location.name,
      dailyViewers,
      weeklyViewers,
      monthlyViewers,
    };
  }

  /**
   * Get viewer statistics for all locations
   */
  async getAllLocationsViewers(includeInactive = false): Promise<ViewerStatistics[]> {
    const locations = await prisma.location.findMany({
      where: includeInactive ? undefined : { isActive: true },
    });

    return locations.map((location) => {
      const monthlyViewers = location.monthlyViewers;
      const dailyViewers = Math.round(monthlyViewers / 30);
      const weeklyViewers = Math.round(monthlyViewers / 4.33);

      return {
        locationId: location.id,
        locationName: location.name,
        dailyViewers,
        weeklyViewers,
        monthlyViewers,
      };
    });
  }

  /**
   * Get viewers for a specific date range
   */
  async getViewersForDateRange(
    locationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DateRangeViewers> {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new AppError('Location not found', 404);
    }

    // Calculate number of days in the range
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate viewers for this date range
    const dailyViewers = Math.round(location.monthlyViewers / 30);
    const totalViewers = dailyViewers * diffDays;

    return {
      locationId: location.id,
      locationName: location.name,
      totalViewers,
      startDate,
      endDate,
    };
  }

  /**
   * Get viewers for multiple locations in a date range
   */
  async getMultipleLocationsViewersForDateRange(
    locationIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<DateRangeViewers[]> {
    const locations = await prisma.location.findMany({
      where: {
        id: {
          in: locationIds,
        },
      },
    });

    if (locations.length === 0) {
      throw new AppError('No locations found', 404);
    }

    // Calculate number of days in the range
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return locations.map((location) => {
      const dailyViewers = Math.round(location.monthlyViewers / 30);
      const totalViewers = dailyViewers * diffDays;

      return {
        locationId: location.id,
        locationName: location.name,
        totalViewers,
        startDate,
        endDate,
      };
    });
  }

  /**
   * Update monthly viewers for a location
   */
  async updateMonthlyViewers(locationId: string, monthlyViewers: number): Promise<void> {
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new AppError('Location not found', 404);
    }

    await prisma.location.update({
      where: { id: locationId },
      data: { monthlyViewers },
    });
  }

  /**
   * Calculate cost per view for multiple locations
   */
  async calculateCostPerView(
    locationIds: string[],
    totalCost: number,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalViewers: number;
    costPerView: number;
    locations: Array<{
      locationId: string;
      locationName: string;
      viewers: number;
      costShare: number;
    }>;
  }> {
    const viewersData = await this.getMultipleLocationsViewersForDateRange(
      locationIds,
      startDate,
      endDate
    );

    const totalViewers = viewersData.reduce((sum, loc) => sum + loc.totalViewers, 0);
    const costPerView = totalViewers > 0 ? totalCost / totalViewers : 0;

    const locations = viewersData.map((loc) => ({
      locationId: loc.locationId,
      locationName: loc.locationName,
      viewers: loc.totalViewers,
      costShare: loc.totalViewers * costPerView,
    }));

    return {
      totalViewers,
      costPerView,
      locations,
    };
  }

  /**
   * Get best locations based on cost per view optimization
   */
  async getBestLocationPlan(
    totalCost: number,
    startDate: Date,
    endDate: Date,
    maxLocations?: number
  ): Promise<{
    recommendedLocations: Array<{
      locationId: string;
      locationName: string;
      viewers: number;
      costPerView: number;
      efficiency: number; // viewers per dollar
    }>;
    totalViewers: number;
    totalCost: number;
    averageCostPerView: number;
  }> {
    const allLocations = await this.getAllLocationsViewers(false);

    // Calculate number of days in the range
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate efficiency (viewers per dollar) for each location
    const locationsWithEfficiency = allLocations.map((loc) => {
      const viewers = Math.round(loc.monthlyViewers / 30) * diffDays;
      // Assume equal cost distribution for efficiency calculation
      const efficiency = viewers; // Higher viewers = better efficiency

      return {
        locationId: loc.locationId,
        locationName: loc.locationName,
        viewers,
        efficiency,
      };
    });

    // Sort by efficiency (most viewers first)
    locationsWithEfficiency.sort((a, b) => b.efficiency - a.efficiency);

    // Select top locations
    const selectedLocations = maxLocations
      ? locationsWithEfficiency.slice(0, maxLocations)
      : locationsWithEfficiency;

    const totalViewers = selectedLocations.reduce((sum, loc) => sum + loc.viewers, 0);
    const costPerView = totalViewers > 0 ? totalCost / totalViewers : 0;

    const recommendedLocations = selectedLocations.map((loc) => ({
      locationId: loc.locationId,
      locationName: loc.locationName,
      viewers: loc.viewers,
      costPerView,
      efficiency: loc.efficiency,
    }));

    return {
      recommendedLocations,
      totalViewers,
      totalCost,
      averageCostPerView: costPerView,
    };
  }
}

export default new ViewerStatisticsService();
