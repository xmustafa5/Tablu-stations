import { ConflictCheckerService } from '../../services/conflictChecker.service';
import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import { ReservationStatus } from '../../generated/prisma';

jest.mock('../../utils/prisma', () => ({
  __esModule: true,
  default: {
    reservation: {
      findMany: jest.fn(),
    },
  },
}));

describe('ConflictCheckerService', () => {
  let conflictCheckerService: ConflictCheckerService;

  beforeEach(() => {
    conflictCheckerService = new ConflictCheckerService();
    jest.clearAllMocks();
  });

  describe('checkConflicts', () => {
    it('should return empty array when no conflicts', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      const result = await conflictCheckerService.checkConflicts({
        location: 'Station A',
        startTime: new Date('2025-12-01T09:00:00Z'),
        endTime: new Date('2025-12-01T17:00:00Z'),
      });

      expect(result).toEqual([]);
    });

    it('should detect overlapping reservations', async () => {
      const conflictingReservation = {
        id: 'res-123',
        advertiserName: 'Company A',
        customerName: 'Customer A',
        location: 'Station A',
        startTime: new Date('2025-12-01T08:00:00Z'),
        endTime: new Date('2025-12-01T12:00:00Z'),
        status: ReservationStatus.ACTIVE,
      };

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([conflictingReservation]);

      const result = await conflictCheckerService.checkConflicts({
        location: 'Station A',
        startTime: new Date('2025-12-01T10:00:00Z'),
        endTime: new Date('2025-12-01T14:00:00Z'),
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('res-123');
    });

    it('should exclude specific reservation when provided', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      await conflictCheckerService.checkConflicts({
        location: 'Station A',
        startTime: new Date('2025-12-01T09:00:00Z'),
        endTime: new Date('2025-12-01T17:00:00Z'),
        excludeReservationId: 'res-exclude',
      });

      const call = (prisma.reservation.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.id).toEqual({ not: 'res-exclude' });
    });

    it('should ignore COMPLETED reservations', async () => {
      const completedReservation = {
        id: 'res-123',
        location: 'Station A',
        startTime: new Date('2025-12-01T08:00:00Z'),
        endTime: new Date('2025-12-01T12:00:00Z'),
        status: ReservationStatus.COMPLETED,
      };

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([completedReservation]);

      await conflictCheckerService.checkConflicts({
        location: 'Station A',
        startTime: new Date('2025-12-01T10:00:00Z'),
        endTime: new Date('2025-12-01T14:00:00Z'),
      });

      const call = (prisma.reservation.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.status.in).not.toContain(ReservationStatus.COMPLETED);
    });
  });

  describe('validateNoConflicts', () => {
    it('should not throw error when no conflicts', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        conflictCheckerService.validateNoConflicts({
          location: 'Station A',
          startTime: new Date('2025-12-01T09:00:00Z'),
          endTime: new Date('2025-12-01T17:00:00Z'),
        })
      ).resolves.not.toThrow();
    });

    it('should throw error when conflicts exist', async () => {
      const conflict = {
        id: 'res-123',
        advertiserName: 'Company A',
        customerName: 'Customer A',
        location: 'Station A',
        startTime: new Date('2025-12-01T08:00:00Z'),
        endTime: new Date('2025-12-01T12:00:00Z'),
        status: ReservationStatus.ACTIVE,
      };

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([conflict]);

      await expect(
        conflictCheckerService.validateNoConflicts({
          location: 'Station A',
          startTime: new Date('2025-12-01T10:00:00Z'),
          endTime: new Date('2025-12-01T14:00:00Z'),
        })
      ).rejects.toThrow(AppError);
    });

    it('should include conflict details in error', async () => {
      const conflict = {
        id: 'res-123',
        advertiserName: 'Company A',
        customerName: 'Customer A',
        location: 'Station A',
        startTime: new Date('2025-12-01T08:00:00Z'),
        endTime: new Date('2025-12-01T12:00:00Z'),
        status: ReservationStatus.ACTIVE,
      };

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([conflict]);

      try {
        await conflictCheckerService.validateNoConflicts({
          location: 'Station A',
          startTime: new Date('2025-12-01T10:00:00Z'),
          endTime: new Date('2025-12-01T14:00:00Z'),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).statusCode).toBe(409);
        expect((error as AppError).details).toBeDefined();
      }
    });
  });

  describe('isTimeSlotAvailable', () => {
    it('should return true when slot is available', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      const result = await conflictCheckerService.isTimeSlotAvailable({
        location: 'Station A',
        startTime: new Date('2025-12-01T09:00:00Z'),
        endTime: new Date('2025-12-01T17:00:00Z'),
      });

      expect(result).toBe(true);
    });

    it('should return false when slot has conflicts', async () => {
      const conflict = {
        id: 'res-123',
        location: 'Station A',
        startTime: new Date('2025-12-01T08:00:00Z'),
        endTime: new Date('2025-12-01T12:00:00Z'),
        status: ReservationStatus.ACTIVE,
      };

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([conflict]);

      const result = await conflictCheckerService.isTimeSlotAvailable({
        location: 'Station A',
        startTime: new Date('2025-12-01T10:00:00Z'),
        endTime: new Date('2025-12-01T14:00:00Z'),
      });

      expect(result).toBe(false);
    });
  });

  describe('getAvailableSlots', () => {
    it('should return all day slots when no reservations', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      const date = new Date('2025-12-01');
      const result = await conflictCheckerService.getAvailableSlots(
        'Station A',
        date,
        60 // 1 hour slots
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('start');
      expect(result[0]).toHaveProperty('end');
    });

    it('should exclude time slots with reservations', async () => {
      const reservation = {
        id: 'res-123',
        location: 'Station A',
        startTime: new Date('2025-12-01T10:00:00Z'),
        endTime: new Date('2025-12-01T12:00:00Z'),
        status: ReservationStatus.ACTIVE,
      };

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([reservation]);

      const date = new Date('2025-12-01');
      const result = await conflictCheckerService.getAvailableSlots(
        'Station A',
        date,
        60
      );

      // Verify no slots overlap with the reservation
      result.forEach((slot) => {
        const hasOverlap =
          (slot.start >= reservation.startTime && slot.start < reservation.endTime) ||
          (slot.end > reservation.startTime && slot.end <= reservation.endTime);
        expect(hasOverlap).toBe(false);
      });
    });

    it('should use custom slot duration', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      const date = new Date('2025-12-01');
      const slotDuration = 120; // 2 hours
      const result = await conflictCheckerService.getAvailableSlots(
        'Station A',
        date,
        slotDuration
      );

      // Check that each slot is exactly 2 hours (120 minutes)
      result.forEach((slot) => {
        const duration = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60);
        expect(duration).toBe(slotDuration);
      });
    });
  });

  describe('getLocationConflictStats', () => {
    it('should return statistics for location', async () => {
      const reservations = [
        {
          startTime: new Date('2025-12-01T09:00:00Z'),
          endTime: new Date('2025-12-01T11:00:00Z'),
          status: ReservationStatus.ACTIVE,
        },
        {
          startTime: new Date('2025-12-01T14:00:00Z'),
          endTime: new Date('2025-12-01T16:00:00Z'),
          status: ReservationStatus.WAITING,
        },
        {
          startTime: new Date('2025-12-02T10:00:00Z'),
          endTime: new Date('2025-12-02T12:00:00Z'),
          status: ReservationStatus.ACTIVE,
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(reservations);

      const result = await conflictCheckerService.getLocationConflictStats(
        'Station A',
        new Date('2025-12-01'),
        new Date('2025-12-31')
      );

      expect(result.totalReservations).toBe(3);
      expect(result.averageOccupancyRate).toBeGreaterThanOrEqual(0);
      expect(result.averageOccupancyRate).toBeLessThanOrEqual(100);
      expect(result.peakDays).toBeDefined();
      expect(Array.isArray(result.peakDays)).toBe(true);
    });

    it('should identify peak days correctly', async () => {
      const reservations = [
        {
          startTime: new Date('2025-12-01T09:00:00Z'),
          endTime: new Date('2025-12-01T11:00:00Z'),
          status: ReservationStatus.ACTIVE,
        },
        {
          startTime: new Date('2025-12-01T14:00:00Z'),
          endTime: new Date('2025-12-01T16:00:00Z'),
          status: ReservationStatus.ACTIVE,
        },
        {
          startTime: new Date('2025-12-02T10:00:00Z'),
          endTime: new Date('2025-12-02T12:00:00Z'),
          status: ReservationStatus.ACTIVE,
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(reservations);

      const result = await conflictCheckerService.getLocationConflictStats(
        'Station A',
        new Date('2025-12-01'),
        new Date('2025-12-31')
      );

      expect(result.peakDays[0].count).toBeGreaterThanOrEqual(result.peakDays[1]?.count || 0);
    });

    it('should handle no reservations', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      const result = await conflictCheckerService.getLocationConflictStats(
        'Station A',
        new Date('2025-12-01'),
        new Date('2025-12-31')
      );

      expect(result.totalReservations).toBe(0);
      expect(result.averageOccupancyRate).toBe(0);
      expect(result.peakDays).toEqual([]);
    });
  });
});
