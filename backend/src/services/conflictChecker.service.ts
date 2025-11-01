import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { ReservationStatus } from '../generated/prisma';

export interface ConflictCheckInput {
  location: string;
  startTime: Date;
  endTime: Date;
  excludeReservationId?: string; // For update operations
}

export interface ConflictingReservation {
  id: string;
  advertiserName: string;
  customerName: string;
  location: string;
  startTime: Date;
  endTime: Date;
  status: ReservationStatus;
}

export class ConflictCheckerService {
  /**
   * Check if a time slot conflicts with existing reservations
   */
  async checkConflicts(input: ConflictCheckInput): Promise<ConflictingReservation[]> {
    const { location, startTime, endTime, excludeReservationId } = input;

    // Query for overlapping reservations at the same location
    const conflicts = await prisma.reservation.findMany({
      where: {
        location,
        id: excludeReservationId ? { not: excludeReservationId } : undefined,
        status: {
          in: [ReservationStatus.WAITING, ReservationStatus.ACTIVE, ReservationStatus.ENDING_SOON],
        },
        OR: [
          // Case 1: New reservation starts during existing reservation
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          // Case 2: New reservation ends during existing reservation
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          // Case 3: New reservation completely contains existing reservation
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
      select: {
        id: true,
        advertiserName: true,
        customerName: true,
        location: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    return conflicts;
  }

  /**
   * Check if a reservation has conflicts and throw error if found
   */
  async validateNoConflicts(input: ConflictCheckInput): Promise<void> {
    const conflicts = await this.checkConflicts(input);

    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map((c) => ({
        id: c.id,
        advertiser: c.advertiserName,
        timeRange: `${c.startTime.toISOString()} - ${c.endTime.toISOString()}`,
      }));

      throw new AppError(
        `Time slot conflicts with ${conflicts.length} existing reservation(s)`,
        409,
        conflictDetails
      );
    }
  }

  /**
   * Get available time slots for a location on a specific date
   */
  async getAvailableSlots(
    location: string,
    date: Date,
    slotDuration: number = 60 // in minutes
  ): Promise<{ start: Date; end: Date }[]> {
    // Get day boundaries
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Get all reservations for this location on this date
    const reservations = await prisma.reservation.findMany({
      where: {
        location,
        status: {
          in: [ReservationStatus.WAITING, ReservationStatus.ACTIVE, ReservationStatus.ENDING_SOON],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: dayEnd } },
              { endTime: { gte: dayStart } },
            ],
          },
        ],
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Generate available slots
    const availableSlots: { start: Date; end: Date }[] = [];
    let currentTime = dayStart;

    for (const reservation of reservations) {
      // If there's a gap before this reservation
      if (currentTime < reservation.startTime) {
        // Add slots that fit in the gap
        while (currentTime.getTime() + slotDuration * 60 * 1000 <= reservation.startTime.getTime()) {
          const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000);
          availableSlots.push({ start: new Date(currentTime), end: slotEnd });
          currentTime = new Date(slotEnd);
        }
      }

      // Move past this reservation
      currentTime = reservation.endTime > currentTime ? reservation.endTime : currentTime;
    }

    // Add remaining slots until end of day
    while (currentTime.getTime() + slotDuration * 60 * 1000 <= dayEnd.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000);
      availableSlots.push({ start: new Date(currentTime), end: slotEnd });
      currentTime = new Date(slotEnd);
    }

    return availableSlots;
  }

  /**
   * Check if a specific time slot is available
   */
  async isTimeSlotAvailable(input: ConflictCheckInput): Promise<boolean> {
    const conflicts = await this.checkConflicts(input);
    return conflicts.length === 0;
  }

  /**
   * Get conflict statistics for a location
   */
  async getLocationConflictStats(
    location: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalReservations: number;
    averageOccupancyRate: number;
    peakDays: { date: string; count: number }[];
  }> {
    const reservations = await prisma.reservation.findMany({
      where: {
        location,
        status: {
          in: [ReservationStatus.WAITING, ReservationStatus.ACTIVE, ReservationStatus.ENDING_SOON],
        },
        OR: [
          {
            AND: [
              { startTime: { lte: endDate } },
              { endTime: { gte: startDate } },
            ],
          },
        ],
      },
    });

    // Calculate statistics
    const totalReservations = reservations.length;

    // Group by date to find peak days
    const dateMap = new Map<string, number>();
    reservations.forEach((res) => {
      const date = res.startTime.toISOString().split('T')[0];
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    });

    const peakDays = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate occupancy rate (simplified - assumes 8-hour working day)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAvailableHours = totalDays * 8;
    const totalBookedHours = reservations.reduce((sum, res) => {
      const duration = (res.endTime.getTime() - res.startTime.getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);

    const averageOccupancyRate = totalAvailableHours > 0
      ? Math.min((totalBookedHours / totalAvailableHours) * 100, 100)
      : 0;

    return {
      totalReservations,
      averageOccupancyRate: Math.round(averageOccupancyRate * 100) / 100,
      peakDays,
    };
  }
}

export default new ConflictCheckerService();
