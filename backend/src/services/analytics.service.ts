import prisma from '../utils/prisma';
import { ReservationStatus } from '../generated/prisma';

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
    reservationCount: number;
    totalRevenue: number;
  }>;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  completionRate: number;
  cancellationRate: number;
  averageLeadTime: number;
}

export class AnalyticsService {
  /**
   * Calculate growth metrics comparing two periods
   */
  async getGrowthMetrics(
    currentStart: Date,
    currentEnd: Date,
    previousStart: Date,
    previousEnd: Date,
    userId?: string
  ): Promise<GrowthMetrics> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const currentPeriodReservations = await prisma.reservation.count({
      where: {
        ...where,
        createdAt: {
          gte: currentStart,
          lte: currentEnd,
        },
      },
    });

    const previousPeriodReservations = await prisma.reservation.count({
      where: {
        ...where,
        createdAt: {
          gte: previousStart,
          lte: previousEnd,
        },
      },
    });

    const growthRate = currentPeriodReservations - previousPeriodReservations;
    const growthPercentage =
      previousPeriodReservations > 0
        ? ((growthRate / previousPeriodReservations) * 100)
        : (currentPeriodReservations > 0 ? 100 : 0);

    return {
      currentPeriodReservations,
      previousPeriodReservations,
      growthRate,
      growthPercentage: Math.round(growthPercentage * 100) / 100,
    };
  }

  /**
   * Get customer analytics
   */
  async getCustomerMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<CustomerMetrics> {
    // Get all reservations in period
    const reservations = await prisma.reservation.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        userId: true,
        startTime: true,
        endTime: true,
        createdAt: true,
      },
    });

    // Get all unique users
    const userIds = new Set(reservations?.map((r) => r.userId));
    const totalCustomers = userIds.size;

    // Get users with previous reservations (before this period)
    const previousReservations = await prisma.reservation.findMany({
      where: {
        createdAt: {
          lt: startDate,
        },
        userId: {
          in: Array.from(userIds),
        },
      },
      select: {
        userId: true,
      },
    });

    const returningUserIds = new Set(previousReservations?.map((r) => r.userId));
    const returningCustomers = returningUserIds.size;
    const newCustomers = totalCustomers - returningCustomers;

    // Calculate average reservations per customer
    const userReservationCount = new Map<string, number>();
    reservations.forEach((r) => {
      userReservationCount.set(r.userId, (userReservationCount.get(r.userId) || 0) + 1);
    });

    const averageReservationsPerCustomer =
      totalCustomers > 0
        ? Math.round((reservations.length / totalCustomers) * 100) / 100
        : 0;

    // Calculate top customers by revenue
    const RATE_PER_DAY = 100;
    const userRevenue = new Map<string, { count: number; revenue: number }>();

    reservations.forEach((r) => {
      const durationMs = r.endTime.getTime() - r.startTime.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      const revenue = durationDays * RATE_PER_DAY;

      const stats = userRevenue.get(r.userId) || { count: 0, revenue: 0 };
      stats.count += 1;
      stats.revenue += revenue;
      userRevenue.set(r.userId, stats);
    });

    const topCustomers = Array.from(userRevenue.entries())
      .map(([userId, stats]) => ({
        userId,
        reservationCount: stats.count,
        totalRevenue: Math.round(stats.revenue * 100) / 100,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      averageReservationsPerCustomer,
      topCustomers,
    };
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<PerformanceMetrics> {
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
        status: true,
        startTime: true,
        endTime: true,
        createdAt: true,
      },
    });

    const totalReservations = reservations.length;

    // Calculate completion rate
    const completedCount = reservations.filter(
      (r) => r.status === ReservationStatus.COMPLETED
    ).length;
    const completionRate =
      totalReservations > 0
        ? Math.round((completedCount / totalReservations) * 100 * 100) / 100
        : 0;

    // Calculate cancellation rate (assuming non-completed as cancelled for this example)
    const cancelledCount = totalReservations - completedCount;
    const cancellationRate =
      totalReservations > 0
        ? Math.round((cancelledCount / totalReservations) * 100 * 100) / 100
        : 0;

    // Calculate average lead time (time between booking and start)
    let totalLeadTimeHours = 0;
    reservations.forEach((r) => {
      const leadTimeMs = r.startTime.getTime() - r.createdAt.getTime();
      totalLeadTimeHours += leadTimeMs / (1000 * 60 * 60);
    });

    const averageLeadTime =
      totalReservations > 0
        ? Math.round((totalLeadTimeHours / totalReservations) * 100) / 100
        : 0;

    // Average response time (simplified - using lead time as proxy)
    const averageResponseTime = averageLeadTime;

    return {
      averageResponseTime,
      completionRate,
      cancellationRate,
      averageLeadTime,
    };
  }

  /**
   * Get peak usage hours analysis
   */
  async getPeakHoursAnalysis(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<
    Array<{
      hour: number;
      reservationCount: number;
      averageOccupancy: number;
    }>
  > {
    const where: any = {
      startTime: {
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
        startTime: true,
        endTime: true,
      },
    });

    // Initialize hour buckets (0-23)
    const hourStats = new Map<
      number,
      { count: number; totalOccupancy: number }
    >();
    for (let i = 0; i < 24; i++) {
      hourStats.set(i, { count: 0, totalOccupancy: 0 });
    }

    // Count reservations by start hour
    reservations.forEach((r) => {
      const hour = r.startTime.getUTCHours();
      const stats = hourStats.get(hour)!;
      stats.count += 1;

      // Calculate occupancy percentage for this reservation
      const durationMs = r.endTime.getTime() - r.startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      stats.totalOccupancy += Math.min(durationHours, 24); // Cap at 24 hours
    });

    return Array.from(hourStats.entries())
      .map(([hour, stats]) => ({
        hour,
        reservationCount: stats.count,
        averageOccupancy:
          stats.count > 0
            ? Math.round((stats.totalOccupancy / stats.count) * 100) / 100
            : 0,
      }))
      .sort((a, b) => b.reservationCount - a.reservationCount);
  }

  /**
   * Get day of week analysis
   */
  async getDayOfWeekAnalysis(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<
    Array<{
      dayOfWeek: number;
      dayName: string;
      reservationCount: number;
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
    });

    const RATE_PER_DAY = 100;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Initialize day buckets (0-6, Sunday-Saturday)
    const dayStats = new Map<number, { count: number; revenue: number }>();
    for (let i = 0; i < 7; i++) {
      dayStats.set(i, { count: 0, revenue: 0 });
    }

    // Count reservations by day of week
    reservations.forEach((r) => {
      const dayOfWeek = r.createdAt.getDay();
      const stats = dayStats.get(dayOfWeek)!;
      stats.count += 1;

      const durationMs = r.endTime.getTime() - r.startTime.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      stats.revenue += durationDays * RATE_PER_DAY;
    });

    return Array.from(dayStats.entries())
      .map(([dayOfWeek, stats]) => ({
        dayOfWeek,
        dayName: dayNames[dayOfWeek],
        reservationCount: stats.count,
        revenue: Math.round(stats.revenue * 100) / 100,
      }))
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }

  /**
   * Forecast future reservations based on historical data
   */
  async getForecast(
    historicalDays: number = 30,
    forecastDays: number = 7,
    userId?: string
  ): Promise<
    Array<{
      date: string;
      predictedReservations: number;
      confidence: 'low' | 'medium' | 'high';
    }>
  > {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - historicalDays);

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
      },
    });

    // Simple moving average forecast
    const dailyCounts = new Map<string, number>();
    reservations.forEach((r) => {
      const dateKey = r.createdAt.toISOString().split('T')[0];
      dailyCounts.set(dateKey, (dailyCounts.get(dateKey) || 0) + 1);
    });

    const counts = Array.from(dailyCounts.values());
    const averageDaily =
      counts.length > 0
        ? counts.reduce((sum, count) => sum + count, 0) / counts.length
        : 0;

    // Calculate standard deviation for confidence
    const variance =
      counts.length > 0
        ? counts.reduce((sum, count) => sum + Math.pow(count - averageDaily, 2), 0) /
        counts.length
        : 0;
    const stdDev = Math.sqrt(variance);

    // Generate forecast
    const forecast: Array<{
      date: string;
      predictedReservations: number;
      confidence: 'low' | 'medium' | 'high';
    }> = [];

    for (let i = 1; i <= forecastDays; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      const dateKey = forecastDate.toISOString().split('T')[0];

      // Determine confidence based on standard deviation
      let confidence: 'low' | 'medium' | 'high';
      if (stdDev < averageDaily * 0.2) {
        confidence = 'high';
      } else if (stdDev < averageDaily * 0.5) {
        confidence = 'medium';
      } else {
        confidence = 'low';
      }

      forecast.push({
        date: dateKey,
        predictedReservations: Math.round(averageDaily),
        confidence,
      });
    }

    return forecast;
  }
}

export default new AnalyticsService();
