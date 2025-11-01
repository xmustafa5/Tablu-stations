import { AnalyticsService } from '../../services/analytics.service';
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

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    jest.clearAllMocks();
  });

  describe('getGrowthMetrics', () => {
    it('should calculate positive growth', async () => {
      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(150) // current
        .mockResolvedValueOnce(100); // previous

      const result = await analyticsService.getGrowthMetrics(
        new Date('2025-02-01'),
        new Date('2025-02-28'),
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );

      expect(result.currentPeriodReservations).toBe(150);
      expect(result.previousPeriodReservations).toBe(100);
      expect(result.growthRate).toBe(50);
      expect(result.growthPercentage).toBe(50);
    });

    it('should calculate negative growth', async () => {
      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(80) // current
        .mockResolvedValueOnce(100); // previous

      const result = await analyticsService.getGrowthMetrics(
        new Date('2025-02-01'),
        new Date('2025-02-28'),
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );

      expect(result.growthRate).toBe(-20);
      expect(result.growthPercentage).toBe(-20);
    });

    it('should handle zero previous period', async () => {
      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(0);

      const result = await analyticsService.getGrowthMetrics(
        new Date('2025-02-01'),
        new Date('2025-02-28'),
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );

      expect(result.growthPercentage).toBe(100);
    });
  });

  describe('getCustomerMetrics', () => {
    it('should calculate customer metrics', async () => {
      const currentPeriodReservations = [
        {
          userId: 'user-1',
          startTime: new Date('2025-01-05T09:00:00Z'),
          endTime: new Date('2025-01-07T09:00:00Z'),
          createdAt: new Date('2025-01-04T10:00:00Z'),
        },
        {
          userId: 'user-1',
          startTime: new Date('2025-01-15T09:00:00Z'),
          endTime: new Date('2025-01-16T09:00:00Z'),
          createdAt: new Date('2025-01-14T10:00:00Z'),
        },
        {
          userId: 'user-2',
          startTime: new Date('2025-01-20T09:00:00Z'),
          endTime: new Date('2025-01-22T09:00:00Z'),
          createdAt: new Date('2025-01-19T10:00:00Z'),
        },
      ];

      const previousReservations = [
        {
          userId: 'user-1',
        },
      ];

      (prisma.reservation.findMany as jest.Mock)
        .mockResolvedValueOnce(currentPeriodReservations)
        .mockResolvedValueOnce(previousReservations);

      const result = await analyticsService.getCustomerMetrics(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );

      expect(result.totalCustomers).toBe(2);
      expect(result.returningCustomers).toBe(1); // user-1
      expect(result.newCustomers).toBe(1); // user-2
      expect(result.averageReservationsPerCustomer).toBe(1.5);
      expect(result.topCustomers).toHaveLength(2);
      expect(result.topCustomers[0].userId).toBe('user-1');
      expect(result.topCustomers[0].reservationCount).toBe(2);
    });

    it('should handle empty results', async () => {
      (prisma.reservation.findMany as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await analyticsService.getCustomerMetrics(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );

      expect(result.totalCustomers).toBe(0);
      expect(result.newCustomers).toBe(0);
      expect(result.returningCustomers).toBe(0);
      expect(result.averageReservationsPerCustomer).toBe(0);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should calculate performance metrics', async () => {
      const mockReservations = [
        {
          status: ReservationStatus.COMPLETED,
          startTime: new Date('2025-01-15T09:00:00Z'),
          endTime: new Date('2025-01-16T09:00:00Z'),
          createdAt: new Date('2025-01-10T10:00:00Z'), // 5 days lead time
        },
        {
          status: ReservationStatus.COMPLETED,
          startTime: new Date('2025-01-20T09:00:00Z'),
          endTime: new Date('2025-01-21T09:00:00Z'),
          createdAt: new Date('2025-01-18T10:00:00Z'), // 2 days lead time
        },
        {
          status: ReservationStatus.ACTIVE,
          startTime: new Date('2025-01-25T09:00:00Z'),
          endTime: new Date('2025-01-26T09:00:00Z'),
          createdAt: new Date('2025-01-23T10:00:00Z'),
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await analyticsService.getPerformanceMetrics(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );

      expect(result.completionRate).toBeCloseTo(66.67, 1);
      expect(result.cancellationRate).toBeCloseTo(33.33, 1);
      expect(result.averageLeadTime).toBeGreaterThan(0);
    });
  });

  describe('getPeakHoursAnalysis', () => {
    it('should analyze peak hours', async () => {
      const mockReservations = [
        {
          startTime: new Date('2025-01-15T09:00:00Z'), // Hour 9
          endTime: new Date('2025-01-15T17:00:00Z'),
        },
        {
          startTime: new Date('2025-01-16T09:00:00Z'), // Hour 9
          endTime: new Date('2025-01-16T12:00:00Z'),
        },
        {
          startTime: new Date('2025-01-17T14:00:00Z'), // Hour 14
          endTime: new Date('2025-01-17T18:00:00Z'),
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await analyticsService.getPeakHoursAnalysis(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );

      expect(result).toHaveLength(24);
      expect(result[0].hour).toBe(9); // Most popular hour
      expect(result[0].reservationCount).toBe(2);
    });
  });

  describe('getDayOfWeekAnalysis', () => {
    it('should analyze reservations by day of week', async () => {
      const mockReservations = [
        {
          createdAt: new Date('2025-01-06T10:00:00Z'), // Monday
          startTime: new Date('2025-01-10T09:00:00Z'),
          endTime: new Date('2025-01-11T09:00:00Z'),
        },
        {
          createdAt: new Date('2025-01-13T10:00:00Z'), // Monday
          startTime: new Date('2025-01-15T09:00:00Z'),
          endTime: new Date('2025-01-16T09:00:00Z'),
        },
        {
          createdAt: new Date('2025-01-08T10:00:00Z'), // Wednesday
          startTime: new Date('2025-01-20T09:00:00Z'),
          endTime: new Date('2025-01-21T09:00:00Z'),
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await analyticsService.getDayOfWeekAnalysis(
        new Date('2025-01-01'),
        new Date('2025-01-31')
      );

      expect(result).toHaveLength(7);
      expect(result[0].dayName).toBe('Sunday');
      expect(result[1].dayName).toBe('Monday');
      expect(result[1].reservationCount).toBe(2);
    });
  });

  describe('getForecast', () => {
    it('should generate forecast based on historical data', async () => {
      const mockReservations = Array.from({ length: 30 }, (_, i) => ({
        createdAt: new Date(2025, 0, i + 1, 10, 0, 0),
      }));

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const result = await analyticsService.getForecast(30, 7);

      expect(result).toHaveLength(7);
      result.forEach((forecast) => {
        expect(forecast).toHaveProperty('date');
        expect(forecast).toHaveProperty('predictedReservations');
        expect(forecast).toHaveProperty('confidence');
        expect(['low', 'medium', 'high']).toContain(forecast.confidence);
      });
    });

    it('should assign confidence levels based on variance', async () => {
      // Consistent data should give high confidence
      const consistentReservations = Array.from({ length: 30 }, (_, i) => ({
        createdAt: new Date(2025, 0, i + 1, 10, 0, 0),
      }));

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(consistentReservations);

      const result = await analyticsService.getForecast(30, 3);

      // Should have high confidence with consistent data
      expect(result.some((f) => f.confidence === 'high')).toBe(true);
    });

    it('should handle empty historical data', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      const result = await analyticsService.getForecast(30, 7);

      expect(result).toHaveLength(7);
      result.forEach((forecast) => {
        expect(forecast.predictedReservations).toBe(0);
      });
    });
  });
});
