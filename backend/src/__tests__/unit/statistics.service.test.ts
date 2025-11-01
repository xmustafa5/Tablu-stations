import { StatisticsService } from '../../services/statistics.service';
import prisma from '../../utils/prisma';
import { ReservationStatus } from '../../generated/prisma';

jest.mock('../../utils/prisma', () => ({
  __esModule: true,
  default: {
    reservation: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('StatisticsService', () => {
  let statisticsService: StatisticsService;

  beforeEach(() => {
    statisticsService = new StatisticsService();
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return comprehensive dashboard statistics', async () => {
      const mockReservations = [
        {
          startTime: new Date('2025-01-01T09:00:00Z'),
          endTime: new Date('2025-01-08T09:00:00Z'), // 7 days
          status: ReservationStatus.ACTIVE,
        },
        {
          startTime: new Date('2025-01-10T09:00:00Z'),
          endTime: new Date('2025-01-12T09:00:00Z'), // 2 days
          status: ReservationStatus.COMPLETED,
        },
      ];

      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(2) // total
        .mockResolvedValueOnce(1) // active
        .mockResolvedValueOnce(1) // completed
        .mockResolvedValueOnce(0); // pending

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await statisticsService.getDashboardStats();

      expect(result.totalReservations).toBe(2);
      expect(result.activeReservations).toBe(1);
      expect(result.completedReservations).toBe(1);
      expect(result.pendingReservations).toBe(0);
      expect(result.totalRevenue).toBeGreaterThan(0);
      expect(result.averageReservationDuration).toBeGreaterThan(0);
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(0);

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      await statisticsService.getDashboardStats(startDate, endDate);

      const calls = (prisma.reservation.count as jest.Mock).mock.calls;
      calls.forEach((call) => {
        expect(call[0].where.createdAt).toBeDefined();
      });
    });

    it('should filter by userId', async () => {
      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(0);

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      await statisticsService.getDashboardStats(undefined, undefined, 'user-123');

      const calls = (prisma.reservation.count as jest.Mock).mock.calls;
      calls.forEach((call) => {
        expect(call[0].where.userId).toBe('user-123');
      });
    });
  });

  describe('getRevenueStats', () => {
    it('should calculate revenue statistics', async () => {
      const mockReservations = [
        {
          startTime: new Date('2025-01-01T09:00:00Z'),
          endTime: new Date('2025-01-08T09:00:00Z'), // 7 days = $700
          status: ReservationStatus.ACTIVE,
          location: 'Station A',
        },
        {
          startTime: new Date('2025-01-10T09:00:00Z'),
          endTime: new Date('2025-01-13T09:00:00Z'), // 3 days = $300
          status: ReservationStatus.COMPLETED,
          location: 'Station B',
        },
        {
          startTime: new Date('2025-01-15T09:00:00Z'),
          endTime: new Date('2025-01-17T09:00:00Z'), // 2 days = $200
          status: ReservationStatus.ACTIVE,
          location: 'Station A',
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await statisticsService.getRevenueStats();

      expect(result.totalRevenue).toBe(1200);
      expect(result.averageRevenuePerReservation).toBe(400);
      expect(result.revenueByStatus[ReservationStatus.ACTIVE]).toBe(900);
      expect(result.revenueByStatus[ReservationStatus.COMPLETED]).toBe(300);
      expect(result.topLocations).toHaveLength(2);
      expect(result.topLocations[0].location).toBe('Station A');
      expect(result.topLocations[0].revenue).toBe(900);
    });

    it('should handle empty results', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      const result = await statisticsService.getRevenueStats();

      expect(result.totalRevenue).toBe(0);
      expect(result.averageRevenuePerReservation).toBe(0);
      expect(result.topLocations).toHaveLength(0);
    });
  });

  describe('getOccupancyStats', () => {
    it('should calculate occupancy by location', async () => {
      const startDate = new Date('2025-01-01T00:00:00Z');
      const endDate = new Date('2025-01-31T23:59:59Z'); // 31 days = 744 hours

      const mockReservations = [
        {
          location: 'Station A',
          startTime: new Date('2025-01-05T09:00:00Z'),
          endTime: new Date('2025-01-05T17:00:00Z'), // 8 hours
        },
        {
          location: 'Station A',
          startTime: new Date('2025-01-10T09:00:00Z'),
          endTime: new Date('2025-01-10T14:00:00Z'), // 5 hours
        },
        {
          location: 'Station B',
          startTime: new Date('2025-01-15T09:00:00Z'),
          endTime: new Date('2025-01-15T12:00:00Z'), // 3 hours
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await statisticsService.getOccupancyStats(startDate, endDate);

      expect(result.overallOccupancyRate).toBeGreaterThan(0);
      expect(result.locationOccupancy).toHaveLength(2);
      expect(result.locationOccupancy.find((l) => l.location === 'Station A')).toBeDefined();
      expect(result.locationOccupancy.find((l) => l.location === 'Station B')).toBeDefined();
    });

    it('should handle overlapping periods correctly', async () => {
      const startDate = new Date('2025-01-10T00:00:00Z');
      const endDate = new Date('2025-01-20T23:59:59Z');

      const mockReservations = [
        {
          location: 'Station A',
          startTime: new Date('2025-01-05T09:00:00Z'), // Before period
          endTime: new Date('2025-01-15T09:00:00Z'), // During period
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await statisticsService.getOccupancyStats(startDate, endDate);

      expect(result.locationOccupancy).toHaveLength(1);
      // Should only count hours within the period
      expect(result.locationOccupancy[0].bookedHours).toBeLessThan(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
      );
    });
  });

  describe('getPopularLocations', () => {
    it('should return popular locations sorted by count', async () => {
      const mockReservations = [
        {
          location: 'Station A',
          startTime: new Date('2025-01-01T09:00:00Z'),
          endTime: new Date('2025-01-02T09:00:00Z'),
        },
        {
          location: 'Station A',
          startTime: new Date('2025-01-05T09:00:00Z'),
          endTime: new Date('2025-01-06T09:00:00Z'),
        },
        {
          location: 'Station B',
          startTime: new Date('2025-01-10T09:00:00Z'),
          endTime: new Date('2025-01-11T09:00:00Z'),
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await statisticsService.getPopularLocations();

      expect(result).toHaveLength(2);
      expect(result[0].location).toBe('Station A');
      expect(result[0].count).toBe(2);
      expect(result[1].location).toBe('Station B');
      expect(result[1].count).toBe(1);
    });

    it('should respect limit parameter', async () => {
      const mockReservations = Array.from({ length: 20 }, (_, i) => ({
        location: `Station ${i}`,
        startTime: new Date('2025-01-01T09:00:00Z'),
        endTime: new Date('2025-01-02T09:00:00Z'),
      }));

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await statisticsService.getPopularLocations(undefined, undefined, undefined, 5);

      expect(result).toHaveLength(5);
    });
  });

  describe('getReservationTrends', () => {
    it('should return daily trends', async () => {
      const mockReservations = [
        {
          createdAt: new Date('2025-01-01T10:00:00Z'),
          startTime: new Date('2025-01-05T09:00:00Z'),
          endTime: new Date('2025-01-06T09:00:00Z'),
        },
        {
          createdAt: new Date('2025-01-01T15:00:00Z'),
          startTime: new Date('2025-01-07T09:00:00Z'),
          endTime: new Date('2025-01-08T09:00:00Z'),
        },
        {
          createdAt: new Date('2025-01-02T10:00:00Z'),
          startTime: new Date('2025-01-10T09:00:00Z'),
          endTime: new Date('2025-01-11T09:00:00Z'),
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await statisticsService.getReservationTrends(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
        'day'
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('period');
      expect(result[0]).toHaveProperty('count');
      expect(result[0]).toHaveProperty('revenue');
      expect(result[0].period).toBe('2025-01-01');
      expect(result[0].count).toBe(2);
    });

    it('should return weekly trends', async () => {
      const mockReservations = [
        {
          createdAt: new Date('2025-01-01T10:00:00Z'),
          startTime: new Date('2025-01-05T09:00:00Z'),
          endTime: new Date('2025-01-06T09:00:00Z'),
        },
        {
          createdAt: new Date('2025-01-08T10:00:00Z'),
          startTime: new Date('2025-01-10T09:00:00Z'),
          endTime: new Date('2025-01-11T09:00:00Z'),
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await statisticsService.getReservationTrends(
        new Date('2025-01-01'),
        new Date('2025-01-31'),
        'week'
      );

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('period');
    });

    it('should return monthly trends', async () => {
      const mockReservations = [
        {
          createdAt: new Date('2025-01-15T10:00:00Z'),
          startTime: new Date('2025-01-20T09:00:00Z'),
          endTime: new Date('2025-01-21T09:00:00Z'),
        },
        {
          createdAt: new Date('2025-02-10T10:00:00Z'),
          startTime: new Date('2025-02-15T09:00:00Z'),
          endTime: new Date('2025-02-16T09:00:00Z'),
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await statisticsService.getReservationTrends(
        new Date('2025-01-01'),
        new Date('2025-02-28'),
        'month'
      );

      expect(result.length).toBe(2);
      expect(result[0].period).toBe('2025-01');
      expect(result[1].period).toBe('2025-02');
    });
  });
});
