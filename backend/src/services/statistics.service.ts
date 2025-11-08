import prisma from '../utils/prisma';
import { ReservationStatus } from '../generated/prisma';

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

    const waitingReservations = await prisma.reservation.count({
      where: { ...where, status: ReservationStatus.WAITING },
    });

    const endingSoonReservations = await prisma.reservation.count({
      where: { ...where, status: ReservationStatus.ENDING_SOON },
    });

    const pendingReservations = waitingReservations + endingSoonReservations;

    // Get all reservations for calculations
    const reservations = await prisma.reservation.findMany({
      where,
      select: {
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    // Calculate average duration in hours
    let totalDurationHours = 0;
    reservations.forEach((reservation) => {
      const durationMs = reservation.endTime.getTime() - reservation.startTime.getTime();
      totalDurationHours += durationMs / (1000 * 60 * 60);
    });

    const averageReservationDuration =
      reservations.length > 0 ? totalDurationHours / reservations.length : 0;

    // Calculate occupancy rate (simplified: based on time coverage)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const periodHours = 30 * 24; // 30 days in hours

    const occupancyRate =
      periodHours > 0 ? Math.min((totalDurationHours / periodHours) * 100, 100) : 0;

    return {
      totalReservations,
      activeReservations,
      completedReservations,
      pendingReservations,
      waitingReservations,
      endingSoonReservations,
      averageReservationDuration: Math.round(averageReservationDuration * 100) / 100,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
    };
  }

  /**
   * Get reservations breakdown by status
   */
  async getReservationsByStatus(
    startDate?: Date,
    endDate?: Date,
    userId?: string
  ): Promise<ReservationsByStatus> {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [waiting, active, endingSoon, completed] = await Promise.all([
      prisma.reservation.count({ where: { ...where, status: ReservationStatus.WAITING } }),
      prisma.reservation.count({ where: { ...where, status: ReservationStatus.ACTIVE } }),
      prisma.reservation.count({ where: { ...where, status: ReservationStatus.ENDING_SOON } }),
      prisma.reservation.count({ where: { ...where, status: ReservationStatus.COMPLETED } }),
    ]);

    return {
      waiting,
      active,
      endingSoon,
      completed,
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
        reservationCount: stats.reservationCount,
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
  ): Promise<Array<{ location: string; count: number; totalHours: number }>> {
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

    const locationMap = new Map<string, { count: number; totalHours: number }>();

    reservations.forEach((reservation) => {
      const durationMs = reservation.endTime.getTime() - reservation.startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      const stats = locationMap.get(reservation.location) || { count: 0, totalHours: 0 };
      stats.count += 1;
      stats.totalHours += durationHours;
      locationMap.set(reservation.location, stats);
    });

    return Array.from(locationMap.entries())
      .map(([location, stats]) => ({
        location,
        count: stats.count,
        totalHours: Math.round(stats.totalHours * 100) / 100,
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
      totalDurationHours: number;
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

    const trendMap = new Map<string, { count: number; totalDurationHours: number }>();

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
      const durationHours = durationMs / (1000 * 60 * 60);

      const stats = trendMap.get(periodKey) || { count: 0, totalDurationHours: 0 };
      stats.count += 1;
      stats.totalDurationHours += durationHours;
      trendMap.set(periodKey, stats);
    });

    return Array.from(trendMap.entries())
      .map(([period, stats]) => ({
        period,
        count: stats.count,
        totalDurationHours: Math.round(stats.totalDurationHours * 100) / 100,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }
}

export default new StatisticsService();
