import { ReservationService } from '../../services/reservation.service';
import prisma from '../../utils/prisma';
import { AppError } from '../../middleware/errorHandler';
import { ReservationStatus } from '../../generated/prisma';

jest.mock('../../utils/prisma', () => ({
  __esModule: true,
  default: {
    reservation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('../../services/conflictChecker.service', () => ({
  __esModule: true,
  default: {
    validateNoConflicts: jest.fn().mockResolvedValue(undefined),
    checkConflicts: jest.fn().mockResolvedValue([]),
  },
}));

describe('ReservationService', () => {
  let reservationService: ReservationService;

  beforeEach(() => {
    reservationService = new ReservationService();
    jest.clearAllMocks();
  });

  describe('createReservation', () => {
    const validInput = {
      advertiserName: 'شركة الحلول التقنية',
      customerName: 'أحمد محمد',
      location: 'شارع الرئيسي - وسط المدينة',
      startTime: new Date('2025-12-01T09:00:00.000Z'),
      endTime: new Date('2025-12-08T17:00:00.000Z'),
      userId: 'user-123',
    };

    it('should create reservation successfully', async () => {
      const mockReservation = {
        id: 'reservation-123',
        ...validInput,
        status: ReservationStatus.WAITING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.reservation.create as jest.Mock).mockResolvedValue(mockReservation);

      const result = await reservationService.createReservation(validInput);

      expect(prisma.reservation.create).toHaveBeenCalledWith({
        data: {
          ...validInput,
          status: ReservationStatus.WAITING,
        },
      });
      expect(result).toEqual(mockReservation);
    });

    it('should throw error if end time is before start time', async () => {
      const invalidInput = {
        ...validInput,
        startTime: new Date('2025-12-08T17:00:00.000Z'),
        endTime: new Date('2025-12-01T09:00:00.000Z'),
      };

      await expect(reservationService.createReservation(invalidInput)).rejects.toThrow(
        new AppError('End time must be after start time', 400)
      );

      expect(prisma.reservation.create).not.toHaveBeenCalled();
    });

    it('should create reservation with custom status', async () => {
      const inputWithStatus = {
        ...validInput,
        status: ReservationStatus.ACTIVE,
      };

      const mockReservation = {
        id: 'reservation-123',
        ...inputWithStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.reservation.create as jest.Mock).mockResolvedValue(mockReservation);

      const result = await reservationService.createReservation(inputWithStatus);

      expect(result.status).toBe(ReservationStatus.ACTIVE);
    });
  });

  describe('getReservations', () => {
    it('should get reservations with pagination', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          advertiserName: 'Company A',
          customerName: 'Customer A',
          location: 'Location A',
          startTime: new Date(),
          endTime: new Date(),
          status: ReservationStatus.WAITING,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.reservation.count as jest.Mock).mockResolvedValue(25);
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await reservationService.getReservations({
        page: 1,
        limit: 20,
      });

      expect(result.reservations).toEqual(mockReservations);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 25,
        totalPages: 2,
      });
    });

    it('should filter reservations by status', async () => {
      (prisma.reservation.count as jest.Mock).mockResolvedValue(5);
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      await reservationService.getReservations({
        status: ReservationStatus.ACTIVE,
      });

      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ReservationStatus.ACTIVE,
          }),
        })
      );
    });

    it('should search reservations', async () => {
      (prisma.reservation.count as jest.Mock).mockResolvedValue(3);
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      await reservationService.getReservations({
        search: 'شركة',
      });

      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { advertiserName: { contains: 'شركة', mode: 'insensitive' } },
              { customerName: { contains: 'شركة', mode: 'insensitive' } },
              { location: { contains: 'شركة', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should filter by userId', async () => {
      (prisma.reservation.count as jest.Mock).mockResolvedValue(10);
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      await reservationService.getReservations({
        userId: 'user-123',
      });

      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
          }),
        })
      );
    });
  });

  describe('getReservationById', () => {
    const mockReservation = {
      id: 'res-123',
      advertiserName: 'Company',
      customerName: 'Customer',
      location: 'Location',
      startTime: new Date(),
      endTime: new Date(),
      status: ReservationStatus.WAITING,
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should get reservation by id', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      const result = await reservationService.getReservationById('res-123');

      expect(result).toEqual(mockReservation);
    });

    it('should throw error if reservation not found', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(reservationService.getReservationById('invalid-id')).rejects.toThrow(
        new AppError('Reservation not found', 404)
      );
    });

    it('should throw error if user does not own reservation', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      await expect(
        reservationService.getReservationById('res-123', 'other-user')
      ).rejects.toThrow(
        new AppError('You do not have permission to access this reservation', 403)
      );
    });

    it('should allow access if user owns reservation', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      const result = await reservationService.getReservationById('res-123', 'user-123');

      expect(result).toEqual(mockReservation);
    });
  });

  describe('updateReservation', () => {
    const mockReservation = {
      id: 'res-123',
      advertiserName: 'Company',
      customerName: 'Customer',
      location: 'Location',
      startTime: new Date('2025-12-01T09:00:00.000Z'),
      endTime: new Date('2025-12-08T17:00:00.000Z'),
      status: ReservationStatus.WAITING,
      userId: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update reservation successfully', async () => {
      const updateData = {
        advertiserName: 'Updated Company',
        status: ReservationStatus.ACTIVE,
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);
      (prisma.reservation.update as jest.Mock).mockResolvedValue({
        ...mockReservation,
        ...updateData,
      });

      const result = await reservationService.updateReservation(
        'res-123',
        'user-123',
        updateData
      );

      expect(result.advertiserName).toBe('Updated Company');
      expect(result.status).toBe(ReservationStatus.ACTIVE);
    });

    it('should validate date consistency when updating both dates', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      await expect(
        reservationService.updateReservation('res-123', 'user-123', {
          startTime: new Date('2025-12-08T17:00:00.000Z'),
          endTime: new Date('2025-12-01T09:00:00.000Z'),
        })
      ).rejects.toThrow(new AppError('End time must be after start time', 400));
    });

    it('should throw error if user does not own reservation', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      await expect(
        reservationService.updateReservation('res-123', 'other-user', {
          advertiserName: 'Updated',
        })
      ).rejects.toThrow(
        new AppError('You do not have permission to access this reservation', 403)
      );
    });
  });

  describe('deleteReservation', () => {
    const mockReservation = {
      id: 'res-123',
      userId: 'user-123',
    };

    it('should delete reservation successfully', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);
      (prisma.reservation.delete as jest.Mock).mockResolvedValue(mockReservation);

      const result = await reservationService.deleteReservation('res-123', 'user-123');

      expect(result.message).toBe('Reservation deleted successfully');
      expect(prisma.reservation.delete).toHaveBeenCalledWith({
        where: { id: 'res-123' },
      });
    });

    it('should throw error if user does not own reservation', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      await expect(
        reservationService.deleteReservation('res-123', 'other-user')
      ).rejects.toThrow(
        new AppError('You do not have permission to access this reservation', 403)
      );
    });
  });

  describe('getCalendarReservations', () => {
    it('should get reservations for specific month', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          advertiserName: 'Company',
          startTime: new Date('2025-12-15'),
          endTime: new Date('2025-12-20'),
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await reservationService.getCalendarReservations(12, 2025);

      expect(result.month).toBe(12);
      expect(result.year).toBe(2025);
      expect(result.reservations).toEqual(mockReservations);
    });

    it('should throw error for invalid month', async () => {
      await expect(
        reservationService.getCalendarReservations(13, 2025)
      ).rejects.toThrow(new AppError('Invalid month. Must be between 1 and 12', 400));
    });

    it('should throw error for invalid year', async () => {
      await expect(
        reservationService.getCalendarReservations(12, 1999)
      ).rejects.toThrow(new AppError('Invalid year', 400));
    });
  });
});
