import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { ReservationStatus } from '../generated/prisma';
import conflictCheckerService from './conflictChecker.service';

/**
 * Calculate the correct status based on current time and reservation times
 */
function calculateStatus(startTime: Date, endTime: Date): ReservationStatus {
  const now = new Date();
  const twentyFourHoursBeforeEnd = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

  // If end time has passed, it's COMPLETED
  if (now >= endTime) {
    return ReservationStatus.COMPLETED;
  }

  // If current time is before start time, it's WAITING
  if (now < startTime) {
    return ReservationStatus.WAITING;
  }

  // If we're within 24 hours of end time, it's ENDING_SOON
  if (now >= twentyFourHoursBeforeEnd && now < endTime) {
    return ReservationStatus.ENDING_SOON;
  }

  // Otherwise, it's ACTIVE (between start and end, more than 24 hours left)
  return ReservationStatus.ACTIVE;
}

export interface CreateReservationInput {
  advertiserName: string;
  customerName: string;
  location: string;
  startTime: Date;
  endTime: Date;
  status?: ReservationStatus;
  userId: string;
}

export interface UpdateReservationInput {
  advertiserName?: string;
  customerName?: string;
  location?: string;
  startTime?: Date;
  endTime?: Date;
  status?: ReservationStatus;
}

export interface GetReservationsQuery {
  search?: string;
  status?: ReservationStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId?: string;
}

export class ReservationService {
  async createReservation(input: CreateReservationInput) {
    const { advertiserName, customerName, location, startTime, endTime, userId } = input;

    // Validate dates
    if (new Date(startTime) >= new Date(endTime)) {
      throw new AppError('End time must be after start time', 400);
    }

    // Check for conflicts
    await conflictCheckerService.validateNoConflicts({
      location,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    // Calculate initial status based on times
    const calculatedStatus = calculateStatus(new Date(startTime), new Date(endTime));

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        advertiserName,
        customerName,
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: calculatedStatus,
        userId,
      },
    });

    return reservation;
  }

  async getReservations(query: GetReservationsQuery) {
    const {
      search,
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      userId,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { advertiserName: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.reservation.count({ where });

    // Get reservations
    const reservations = await prisma.reservation.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Calculate and update status for each reservation based on current time
    const reservationsWithUpdatedStatus = reservations.map(reservation => {
      const calculatedStatus = calculateStatus(reservation.startTime, reservation.endTime);
      return {
        ...reservation,
        status: calculatedStatus,
      };
    });

    // Optionally, update the database in the background (fire and forget)
    // This ensures the DB stays in sync without blocking the response
    this.updateReservationStatusesInBackground(reservations);

    return {
      reservations: reservationsWithUpdatedStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update reservation statuses in the background (non-blocking)
   */
  private async updateReservationStatusesInBackground(reservations: any[]) {
    try {
      const updates = reservations.map(reservation => {
        const calculatedStatus = calculateStatus(reservation.startTime, reservation.endTime);
        if (reservation.status !== calculatedStatus) {
          return prisma.reservation.update({
            where: { id: reservation.id },
            data: { status: calculatedStatus },
          });
        }
        return null;
      }).filter(Boolean);

      if (updates.length > 0) {
        await Promise.all(updates);
      }
    } catch (error) {
      // Silent fail - status calculation in response is more important
      console.error('Background status update failed:', error);
    }
  }

  async getReservationById(id: string, userId?: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }

    // If userId is provided, check ownership
    if (userId && reservation.userId !== userId) {
      throw new AppError('You do not have permission to access this reservation', 403);
    }

    // Calculate current status
    const calculatedStatus = calculateStatus(reservation.startTime, reservation.endTime);

    // Update DB if status changed
    if (reservation.status !== calculatedStatus) {
      await prisma.reservation.update({
        where: { id },
        data: { status: calculatedStatus },
      });
    }

    return {
      ...reservation,
      status: calculatedStatus,
    };
  }

  async updateReservation(id: string, userId: string, input: UpdateReservationInput) {
    // Check if reservation exists (don't check ownership - allow all users to edit)
    const existingReservation = await this.getReservationById(id);

    const newStartTime = input.startTime ? new Date(input.startTime) : existingReservation.startTime;
    const newEndTime = input.endTime ? new Date(input.endTime) : existingReservation.endTime;
    const newLocation = input.location || existingReservation.location;

    // Validate dates if provided
    if (input.startTime && input.endTime) {
      if (new Date(input.startTime) >= new Date(input.endTime)) {
        throw new AppError('End time must be after start time', 400);
      }
    } else if (input.startTime) {
      if (new Date(input.startTime) >= existingReservation.endTime) {
        throw new AppError('Start time must be before end time', 400);
      }
    } else if (input.endTime) {
      if (existingReservation.startTime >= new Date(input.endTime)) {
        throw new AppError('End time must be after start time', 400);
      }
    }

    // Check for conflicts if time or location changed
    if (input.startTime || input.endTime || input.location) {
      await conflictCheckerService.validateNoConflicts({
        location: newLocation,
        startTime: newStartTime,
        endTime: newEndTime,
        excludeReservationId: id,
      });
    }

    // Update reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        ...input,
        startTime: input.startTime ? new Date(input.startTime) : undefined,
        endTime: input.endTime ? new Date(input.endTime) : undefined,
      },
    });

    return updatedReservation;
  }

  async deleteReservation(id: string, userId: string) {
    // Check if reservation exists (don't check ownership - allow all users to delete)
    await this.getReservationById(id);

    // Delete reservation
    await prisma.reservation.delete({
      where: { id },
    });

    return { message: 'Reservation deleted successfully' };
  }

  async getCalendarReservations(month: number, year: number, userId?: string) {
    // Validate month and year
    if (month < 1 || month > 12) {
      throw new AppError('Invalid month. Must be between 1 and 12', 400);
    }

    if (year < 2000 || year > 2100) {
      throw new AppError('Invalid year', 400);
    }

    // Calculate date range
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const where: any = {
      OR: [
        {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          endTime: {
            gte: startDate,
            lte: endDate,
          },
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
      orderBy: {
        startTime: 'asc',
      },
    });

    return {
      month,
      year,
      reservations,
    };
  }
}

export default new ReservationService();
