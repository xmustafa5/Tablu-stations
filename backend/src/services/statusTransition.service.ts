import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';
import { ReservationStatus } from '../generated/prisma';

export interface StatusTransitionResult {
  reservationId: string;
  oldStatus: ReservationStatus;
  newStatus: ReservationStatus;
  transitionedAt: Date;
}

export class StatusTransitionService {
  // Define valid status transitions
  private readonly validTransitions: Record<ReservationStatus, ReservationStatus[]> = {
    [ReservationStatus.WAITING]: [ReservationStatus.ACTIVE, ReservationStatus.COMPLETED],
    [ReservationStatus.ACTIVE]: [ReservationStatus.ENDING_SOON, ReservationStatus.COMPLETED],
    [ReservationStatus.ENDING_SOON]: [ReservationStatus.COMPLETED],
    [ReservationStatus.COMPLETED]: [], // Terminal state - no transitions allowed
  };

  /**
   * Check if a status transition is valid
   */
  isValidTransition(from: ReservationStatus, to: ReservationStatus): boolean {
    const allowedTransitions = this.validTransitions[from];
    return allowedTransitions.includes(to);
  }

  /**
   * Get all valid next statuses for a given status
   */
  getValidNextStatuses(currentStatus: ReservationStatus): ReservationStatus[] {
    return this.validTransitions[currentStatus];
  }

  /**
   * Transition a reservation to a new status
   */
  async transitionStatus(
    reservationId: string,
    newStatus: ReservationStatus,
    userId?: string
  ): Promise<StatusTransitionResult> {
    // Get current reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }

    // Check user authorization if userId provided
    if (userId && reservation.userId !== userId) {
      throw new AppError('You do not have permission to access this reservation', 403);
    }

    // Check if transition is valid
    if (!this.isValidTransition(reservation.status, newStatus)) {
      throw new AppError(
        `Invalid status transition from ${reservation.status} to ${newStatus}`,
        400
      );
    }

    // Perform the transition
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: newStatus },
    });

    return {
      reservationId: updatedReservation.id,
      oldStatus: reservation.status,
      newStatus: updatedReservation.status,
      transitionedAt: updatedReservation.updatedAt,
    };
  }

  /**
   * Automatically update statuses based on time
   * WAITING -> ACTIVE when startTime has passed
   * ACTIVE -> ENDING_SOON when 24 hours left
   */
  async updateStatusesAutomatically(): Promise<{
    activatedCount: number;
    endingSoonCount: number;
  }> {
    const now = new Date();
    const endingSoonThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Update WAITING -> ACTIVE (startTime has passed)
    const activatedResult = await prisma.reservation.updateMany({
      where: {
        status: ReservationStatus.WAITING,
        startTime: {
          lte: now,
        },
      },
      data: {
        status: ReservationStatus.ACTIVE,
      },
    });

    // Update ACTIVE -> ENDING_SOON (less than 24 hours until endTime)
    const endingSoonResult = await prisma.reservation.updateMany({
      where: {
        status: ReservationStatus.ACTIVE,
        endTime: {
          lte: endingSoonThreshold,
          gt: now,
        },
      },
      data: {
        status: ReservationStatus.ENDING_SOON,
      },
    });

    return {
      activatedCount: activatedResult.count,
      endingSoonCount: endingSoonResult.count,
    };
  }

  /**
   * Complete a reservation (manual completion)
   */
  async completeReservation(
    reservationId: string,
    userId?: string
  ): Promise<StatusTransitionResult> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new AppError('Reservation not found', 404);
    }

    // Check user authorization if userId provided
    if (userId && reservation.userId !== userId) {
      throw new AppError('You do not have permission to access this reservation', 403);
    }

    // Can complete from any non-COMPLETED status
    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new AppError('Reservation is already completed', 400);
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: ReservationStatus.COMPLETED },
    });

    return {
      reservationId: updatedReservation.id,
      oldStatus: reservation.status,
      newStatus: updatedReservation.status,
      transitionedAt: updatedReservation.updatedAt,
    };
  }

  /**
   * Get reservation status summary
   */
  async getStatusSummary(userId?: string): Promise<Record<ReservationStatus, number>> {
    const where = userId ? { userId } : {};

    const statuses = await Promise.all([
      prisma.reservation.count({ where: { ...where, status: ReservationStatus.WAITING } }),
      prisma.reservation.count({ where: { ...where, status: ReservationStatus.ACTIVE } }),
      prisma.reservation.count({ where: { ...where, status: ReservationStatus.ENDING_SOON } }),
      prisma.reservation.count({ where: { ...where, status: ReservationStatus.COMPLETED } }),
    ]);

    return {
      [ReservationStatus.WAITING]: statuses[0],
      [ReservationStatus.ACTIVE]: statuses[1],
      [ReservationStatus.ENDING_SOON]: statuses[2],
      [ReservationStatus.COMPLETED]: statuses[3],
    };
  }
}

export default new StatusTransitionService();
