import prisma from '../utils/prisma';
import { ReservationStatus } from '../generated/prisma';

export interface DashboardStats {
  totalReservations: number;
  activeReservations: number;
  completedReservations: number;
  pendingReservations: number;
  totalRevenue: number;
  averageReservationDuration: number;
  occupancyRate: number;
}

export interface RevenueStats {
  totalRevenue: number;
  averageRevenuePerReservation: number;
  revenueByStatus: Record<ReservationStatus, number>;
  topLocations: Array<{
    location: string;
    revenue: number;
    count: number;
  }>;
}

export interface OccupancyStats {
  overallOccupancyRate: number;
  locationOccupancy: Array<{
    location: string;
    occupancyRate: number;
    totalHours: number;
    bookedHours: number;
  }>;
}

export class StatisticsService {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ): Promise<DashboardStats> {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Get total reservations
    const totalReservations = await prisma.reservation.count({ where });

    // Get reservations by status
    const activeReservations = await prisma.reservation.count({
      where: { ...where, status: ReservationStatus.ACTIVE },
    });

    const completedReservations = await prisma.reservation.count({
      where: { ...where, status: ReservationStatus.COMPLETED },
    });

    const pendingReservations = await prisma.reservation.count({
      where: {
        ...where,
        status: { in: [ReservationStatus.WAITING, ReservationStatus.ENDING_SOON] },
      },
    });

    // Get all reservations for calculations
    const reservations = await prisma.reservation.findMany({
      where,
      select: {
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    // Calculate total revenue (assuming $100 per day)
    const RATE_PER_DAY = 100;
    let totalRevenue = 0;
    let totalDurationHours = 0;

    reservations.forEach((reservation) => {
      const durationMs = reservation.endTime.getTime() - reservation.startTime.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      totalRevenue += durationDays * RATE_PER_DAY;
      totalDurationHours += durationMs / (1000 * 60 * 60);
    });

    const averageReservationDuration =
      reservations.length > 0 ? totalDurationHours / reservations.length : 0;

    // Calculate occupancy rate (simplified)
    const totalPossibleHours = reservations.length * 24 * 7; // Assume 7 days per week
    const occupancyRate =
      totalPossibleHours > 0 ? (totalDurationHours / totalPossibleHours) * 100 : 0;

    return {
      totalReservations,
      activeReservations,
      completedReservations,
      pendingReservations,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageReservationDuration: Math.round(averageReservationDuration * 100) / 100,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
    };
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ): Promise<RevenueStats> {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      select: {
        startTime: true,
        endTime: true,
        status: true,
        location: true,
      },
    });

    const RATE_PER_DAY = 100;
    let totalRevenue = 0;
    const revenueByStatus: Record<ReservationStatus, number> = {
      [ReservationStatus.WAITING]: 0,
      [ReservationStatus.ACTIVE]: 0,
      [ReservationStatus.ENDING_SOON]: 0,
      [ReservationStatus.COMPLETED]: 0,
    };

    const locationRevenue = new Map<string, { revenue: number; count: number }>();

    reservations.forEach((reservation) => {
      const durationMs = reservation.endTime.getTime() - reservation.startTime.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      const revenue = durationDays * RATE_PER_DAY;

      totalRevenue += revenue;
      revenueByStatus[reservation.status] += revenue;

      const locationData = locationRevenue.get(reservation.location) || {
        revenue: 0,
        count: 0,
      };
      locationData.revenue += revenue;
      locationData.count += 1;
      locationRevenue.set(reservation.location, locationData);
    });

    const topLocations = Array.from(locationRevenue.entries())
      .map(([location, data]) => ({
        location,
        revenue: Math.round(data.revenue * 100) / 100,
        count: data.count,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageRevenuePerReservation:
        reservations.length > 0
          ? Math.round((totalRevenue / reservations.length) * 100) / 100
          : 0,
      revenueByStatus: {
        [ReservationStatus.WAITING]: Math.round(revenueByStatus[ReservationStatus.WAITING] * 100) / 100,
        [ReservationStatus.ACTIVE]: Math.round(revenueByStatus[ReservationStatus.ACTIVE] * 100) / 100,
        [ReservationStatus.ENDING_SOON]: Math.round(revenueByStatus[ReservationStatus.ENDING_SOON] * 100) / 100,
        [ReservationStatus.COMPLETED]: Math.round(revenueByStatus[ReservationStatus.COMPLETED] * 100) / 100,
      },
      topLocations,
    };
  }

  /**
   * Get occupancy statistics by location
   */
  async getOccupancyStats(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<OccupancyStats> {
    const where: any = {
      OR: [
        {
          AND: [
            { startTime: { gte: startDate } },
            { startTime: { lte: endDate } },
          ],
        },
        {
          AND: [
            { endTime: { gte: startDate } },
            { endTime: { lte: endDate } },
          ],
        },
        {
          AND: [
            { startTime: { lte: startDate } },
            { endTime: { gte: endDate } },
          ],
        },
      ],
    };

    if (userId) {
      where.userId = userId;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      select: {
        location: true,
        startTime: true,
        endTime: true,
      },
    });

    // Calculate total period hours
    const periodMs = endDate.getTime() - startDate.getTime();
    const periodHours = periodMs / (1000 * 60 * 60);

    // Group by location
    const locationStats = new Map<
      string,
      { bookedHours: number; reservationCount: number }
    >();

    reservations.forEach((reservation) => {
      const effectiveStart = new Date(
        Math.max(reservation.startTime.getTime(), startDate.getTime())
      );
      const effectiveEnd = new Date(
        Math.min(reservation.endTime.getTime(), endDate.getTime())
      );

      const durationMs = effectiveEnd.getTime() - effectiveStart.getTime();
      const durationHours = Math.max(0, durationMs / (1000 * 60 * 60));

      const stats = locationStats.get(reservation.location) || {
        bookedHours: 0,
        reservationCount: 0,
      };
      stats.bookedHours += durationHours;
      stats.reservationCount += 1;
      locationStats.set(reservation.location, stats);
    });

    // Calculate occupancy for each location
    const locationOccupancy = Array.from(locationStats.entries()).map(
      ([location, stats]) => ({
        location,
        occupancyRate: Math.round((stats.bookedHours / periodHours) * 100 * 100) / 100,
        totalHours: Math.round(periodHours * 100) / 100,
        bookedHours: Math.round(stats.bookedHours * 100) / 100,
      })
    );

    // Calculate overall occupancy
    const totalBookedHours = Array.from(locationStats.values()).reduce(
      (sum, stats) => sum + stats.bookedHours,
      0
    );
    const uniqueLocations = locationStats.size;
    const totalAvailableHours = periodHours * (uniqueLocations || 1);
    const overallOccupancyRate =
      totalAvailableHours > 0
        ? Math.round((totalBookedHours / totalAvailableHours) * 100 * 100) / 100
        : 0;

    return {
      overallOccupancyRate,
      locationOccupancy,
    };
  }

  /**
   * Get popular locations by reservation count
   */
  async getPopularLocations(
    startDate?: Date,
    endDate?: Date,
    userId?: string,
    limit: number = 10
  ): Promise<Array<{ location: string; count: number; revenue: number }>> {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      select: {
        location: true,
        startTime: true,
        endTime: true,
      },
    });

    const RATE_PER_DAY = 100;
    const locationMap = new Map<string, { count: number; revenue: number }>();

    reservations.forEach((reservation) => {
      const durationMs = reservation.endTime.getTime() - reservation.startTime.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      const revenue = durationDays * RATE_PER_DAY;

      const stats = locationMap.get(reservation.location) || { count: 0, revenue: 0 };
      stats.count += 1;
      stats.revenue += revenue;
      locationMap.set(reservation.location, stats);
    });

    return Array.from(locationMap.entries())
      .map(([location, stats]) => ({
        location,
        count: stats.count,
        revenue: Math.round(stats.revenue * 100) / 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get reservation trends over time
   */
  async getReservationTrends(
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month',
    userId?: string
  ): Promise<
    Array<{
      period: string;
      count: number;
      revenue: number;
    }>
  > {
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (userId) {
      where.userId = userId;
    }

    const reservations = await prisma.reservation.findMany({
      where,
      select: {
        createdAt: true,
        startTime: true,
        endTime: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const RATE_PER_DAY = 100;
    const trendMap = new Map<string, { count: number; revenue: number }>();

    reservations.forEach((reservation) => {
      const date = reservation.createdAt;
      let periodKey: string;

      switch (interval) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      const durationMs = reservation.endTime.getTime() - reservation.startTime.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      const revenue = durationDays * RATE_PER_DAY;

      const stats = trendMap.get(periodKey) || { count: 0, revenue: 0 };
      stats.count += 1;
      stats.revenue += revenue;
      trendMap.set(periodKey, stats);
    });

    return Array.from(trendMap.entries())
      .map(([period, stats]) => ({
        period,
        count: stats.count,
        revenue: Math.round(stats.revenue * 100) / 100,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }
}

export default new StatisticsService();
