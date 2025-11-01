import { StatusTransitionService } from '../../services/statusTransition.service';
import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import { ReservationStatus } from '../../generated/prisma';

jest.mock('../../utils/prisma', () => ({
  __esModule: true,
  default: {
    reservation: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('StatusTransitionService', () => {
  let statusTransitionService: StatusTransitionService;

  beforeEach(() => {
    statusTransitionService = new StatusTransitionService();
    jest.clearAllMocks();
  });

  describe('isValidTransition', () => {
    it('should return true for valid WAITING -> ACTIVE transition', () => {
      const result = statusTransitionService.isValidTransition(
        ReservationStatus.WAITING,
        ReservationStatus.ACTIVE
      );
      expect(result).toBe(true);
    });

    it('should return true for valid ACTIVE -> ENDING_SOON transition', () => {
      const result = statusTransitionService.isValidTransition(
        ReservationStatus.ACTIVE,
        ReservationStatus.ENDING_SOON
      );
      expect(result).toBe(true);
    });

    it('should return true for valid ENDING_SOON -> COMPLETED transition', () => {
      const result = statusTransitionService.isValidTransition(
        ReservationStatus.ENDING_SOON,
        ReservationStatus.COMPLETED
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid COMPLETED -> ACTIVE transition', () => {
      const result = statusTransitionService.isValidTransition(
        ReservationStatus.COMPLETED,
        ReservationStatus.ACTIVE
      );
      expect(result).toBe(false);
    });

    it('should return false for invalid WAITING -> ENDING_SOON transition', () => {
      const result = statusTransitionService.isValidTransition(
        ReservationStatus.WAITING,
        ReservationStatus.ENDING_SOON
      );
      expect(result).toBe(false);
    });
  });

  describe('getValidNextStatuses', () => {
    it('should return valid next statuses for WAITING', () => {
      const result = statusTransitionService.getValidNextStatuses(ReservationStatus.WAITING);
      expect(result).toEqual([ReservationStatus.ACTIVE, ReservationStatus.COMPLETED]);
    });

    it('should return valid next statuses for ACTIVE', () => {
      const result = statusTransitionService.getValidNextStatuses(ReservationStatus.ACTIVE);
      expect(result).toEqual([ReservationStatus.ENDING_SOON, ReservationStatus.COMPLETED]);
    });

    it('should return empty array for COMPLETED', () => {
      const result = statusTransitionService.getValidNextStatuses(ReservationStatus.COMPLETED);
      expect(result).toEqual([]);
    });
  });

  describe('transitionStatus', () => {
    it('should successfully transition status', async () => {
      const mockReservation = {
        id: 'res-123',
        status: ReservationStatus.WAITING,
        userId: 'user-123',
        updatedAt: new Date(),
      };

      const mockUpdated = {
        ...mockReservation,
        status: ReservationStatus.ACTIVE,
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);
      (prisma.reservation.update as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await statusTransitionService.transitionStatus(
        'res-123',
        ReservationStatus.ACTIVE,
        'user-123'
      );

      expect(result.reservationId).toBe('res-123');
      expect(result.oldStatus).toBe(ReservationStatus.WAITING);
      expect(result.newStatus).toBe(ReservationStatus.ACTIVE);
    });

    it('should throw error for non-existent reservation', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        statusTransitionService.transitionStatus('invalid-id', ReservationStatus.ACTIVE)
      ).rejects.toThrow(AppError);
    });

    it('should throw error for unauthorized user', async () => {
      const mockReservation = {
        id: 'res-123',
        status: ReservationStatus.WAITING,
        userId: 'user-123',
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      await expect(
        statusTransitionService.transitionStatus(
          'res-123',
          ReservationStatus.ACTIVE,
          'other-user'
        )
      ).rejects.toThrow('You do not have permission to access this reservation');
    });

    it('should throw error for invalid transition', async () => {
      const mockReservation = {
        id: 'res-123',
        status: ReservationStatus.COMPLETED,
        userId: 'user-123',
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      await expect(
        statusTransitionService.transitionStatus(
          'res-123',
          ReservationStatus.ACTIVE,
          'user-123'
        )
      ).rejects.toThrow('Invalid status transition');
    });
  });

  describe('updateStatusesAutomatically', () => {
    it('should update statuses based on time', async () => {
      (prisma.reservation.updateMany as jest.Mock)
        .mockResolvedValueOnce({ count: 5 })  // WAITING -> ACTIVE
        .mockResolvedValueOnce({ count: 3 }); // ACTIVE -> ENDING_SOON

      const result = await statusTransitionService.updateStatusesAutomatically();

      expect(result.activatedCount).toBe(5);
      expect(result.endingSoonCount).toBe(3);
      expect(prisma.reservation.updateMany).toHaveBeenCalledTimes(2);
    });

    it('should handle no updates needed', async () => {
      (prisma.reservation.updateMany as jest.Mock)
        .mockResolvedValueOnce({ count: 0 })
        .mockResolvedValueOnce({ count: 0 });

      const result = await statusTransitionService.updateStatusesAutomatically();

      expect(result.activatedCount).toBe(0);
      expect(result.endingSoonCount).toBe(0);
    });
  });

  describe('completeReservation', () => {
    it('should complete reservation successfully', async () => {
      const mockReservation = {
        id: 'res-123',
        status: ReservationStatus.ACTIVE,
        userId: 'user-123',
        updatedAt: new Date(),
      };

      const mockCompleted = {
        ...mockReservation,
        status: ReservationStatus.COMPLETED,
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);
      (prisma.reservation.update as jest.Mock).mockResolvedValue(mockCompleted);

      const result = await statusTransitionService.completeReservation('res-123', 'user-123');

      expect(result.oldStatus).toBe(ReservationStatus.ACTIVE);
      expect(result.newStatus).toBe(ReservationStatus.COMPLETED);
    });

    it('should throw error if already completed', async () => {
      const mockReservation = {
        id: 'res-123',
        status: ReservationStatus.COMPLETED,
        userId: 'user-123',
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      await expect(
        statusTransitionService.completeReservation('res-123', 'user-123')
      ).rejects.toThrow('Reservation is already completed');
    });

    it('should throw error for unauthorized user', async () => {
      const mockReservation = {
        id: 'res-123',
        status: ReservationStatus.ACTIVE,
        userId: 'user-123',
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      await expect(
        statusTransitionService.completeReservation('res-123', 'other-user')
      ).rejects.toThrow('You do not have permission to access this reservation');
    });
  });

  describe('getStatusSummary', () => {
    it('should return status counts for all users', async () => {
      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(10)  // WAITING
        .mockResolvedValueOnce(5)   // ACTIVE
        .mockResolvedValueOnce(2)   // ENDING_SOON
        .mockResolvedValueOnce(20); // COMPLETED

      const result = await statusTransitionService.getStatusSummary();

      expect(result[ReservationStatus.WAITING]).toBe(10);
      expect(result[ReservationStatus.ACTIVE]).toBe(5);
      expect(result[ReservationStatus.ENDING_SOON]).toBe(2);
      expect(result[ReservationStatus.COMPLETED]).toBe(20);
      expect(prisma.reservation.count).toHaveBeenCalledTimes(4);
    });

    it('should return status counts for specific user', async () => {
      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(3)  // WAITING
        .mockResolvedValueOnce(2)  // ACTIVE
        .mockResolvedValueOnce(1)  // ENDING_SOON
        .mockResolvedValueOnce(5); // COMPLETED

      const result = await statusTransitionService.getStatusSummary('user-123');

      expect(result[ReservationStatus.WAITING]).toBe(3);
      expect(result[ReservationStatus.ACTIVE]).toBe(2);
      expect(result[ReservationStatus.ENDING_SOON]).toBe(1);
      expect(result[ReservationStatus.COMPLETED]).toBe(5);

      // Verify user filter was applied
      const calls = (prisma.reservation.count as jest.Mock).mock.calls;
      calls.forEach((call) => {
        expect(call[0].where.userId).toBe('user-123');
      });
    });

    it('should handle zero counts', async () => {
      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await statusTransitionService.getStatusSummary();

      expect(result[ReservationStatus.WAITING]).toBe(0);
      expect(result[ReservationStatus.ACTIVE]).toBe(0);
      expect(result[ReservationStatus.ENDING_SOON]).toBe(0);
      expect(result[ReservationStatus.COMPLETED]).toBe(0);
    });
  });
});
