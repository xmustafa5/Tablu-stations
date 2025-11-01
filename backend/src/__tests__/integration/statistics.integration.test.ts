import request from 'supertest';
import express, { Application } from 'express';
import statisticsRoutes from '../../routes/statistics.routes';
import { errorHandler } from '../../middleware/errorHandler';
import prisma from '../../utils/prisma';
import { generateToken } from '../../utils/jwt';
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

describe('Statistics Integration Tests', () => {
  let app: Application;
  let authToken: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/statistics', statisticsRoutes);
    app.use(errorHandler);

    authToken = generateToken({
      userId: 'user-123',
      email: 'test@example.com',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/statistics/dashboard', () => {
    it('should return dashboard statistics', async () => {
      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(25)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(0);

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
        {
          startTime: new Date('2025-01-01T09:00:00Z'),
          endTime: new Date('2025-01-08T09:00:00Z'),
          status: ReservationStatus.ACTIVE,
        },
      ]);

      const response = await request(app)
        .get('/api/statistics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalReservations');
      expect(response.body.data).toHaveProperty('activeReservations');
      expect(response.body.data).toHaveProperty('totalRevenue');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/statistics/dashboard')
        .expect(401);
    });
  });

  describe('GET /api/statistics/revenue', () => {
    it('should return revenue statistics', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
        {
          startTime: new Date('2025-01-01T09:00:00Z'),
          endTime: new Date('2025-01-03T09:00:00Z'),
          status: ReservationStatus.ACTIVE,
          location: 'Station A',
        },
      ]);

      const response = await request(app)
        .get('/api/statistics/revenue')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalRevenue');
      expect(response.body.data).toHaveProperty('revenueByStatus');
      expect(response.body.data).toHaveProperty('topLocations');
    });
  });

  describe('GET /api/statistics/occupancy', () => {
    it('should return occupancy statistics', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
        {
          location: 'Station A',
          startTime: new Date('2025-01-05T09:00:00Z'),
          endTime: new Date('2025-01-05T17:00:00Z'),
        },
      ]);

      const response = await request(app)
        .get('/api/statistics/occupancy')
        .query({
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-01-31T23:59:59Z',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overallOccupancyRate');
      expect(response.body.data).toHaveProperty('locationOccupancy');
    });

    it('should require startDate and endDate', async () => {
      const response = await request(app)
        .get('/api/statistics/occupancy')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/statistics/locations/popular', () => {
    it('should return popular locations', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
        {
          location: 'Station A',
          startTime: new Date('2025-01-01T09:00:00Z'),
          endTime: new Date('2025-01-02T09:00:00Z'),
        },
      ]);

      const response = await request(app)
        .get('/api/statistics/locations/popular')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/statistics/trends', () => {
    it('should return reservation trends', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
        {
          createdAt: new Date('2025-01-01T10:00:00Z'),
          startTime: new Date('2025-01-05T09:00:00Z'),
          endTime: new Date('2025-01-06T09:00:00Z'),
        },
      ]);

      const response = await request(app)
        .get('/api/statistics/trends')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          interval: 'day',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should validate interval parameter', async () => {
      const response = await request(app)
        .get('/api/statistics/trends')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          interval: 'invalid',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/statistics/analytics/growth', () => {
    it('should return growth metrics', async () => {
      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(150)
        .mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/statistics/analytics/growth')
        .query({
          currentStart: '2025-02-01',
          currentEnd: '2025-02-28',
          previousStart: '2025-01-01',
          previousEnd: '2025-01-31',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('growthRate');
      expect(response.body.data).toHaveProperty('growthPercentage');
    });
  });

  describe('GET /api/statistics/analytics/customers', () => {
    it('should return customer metrics', async () => {
      (prisma.reservation.findMany as jest.Mock)
        .mockResolvedValueOnce([
          {
            userId: 'user-1',
            startTime: new Date('2025-01-05T09:00:00Z'),
            endTime: new Date('2025-01-07T09:00:00Z'),
            createdAt: new Date('2025-01-04T10:00:00Z'),
          },
        ])
        .mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/statistics/analytics/customers')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCustomers');
      expect(response.body.data).toHaveProperty('topCustomers');
    });
  });

  describe('GET /api/statistics/analytics/performance', () => {
    it('should return performance metrics', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
        {
          status: ReservationStatus.COMPLETED,
          startTime: new Date('2025-01-15T09:00:00Z'),
          endTime: new Date('2025-01-16T09:00:00Z'),
          createdAt: new Date('2025-01-10T10:00:00Z'),
        },
      ]);

      const response = await request(app)
        .get('/api/statistics/analytics/performance')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('completionRate');
      expect(response.body.data).toHaveProperty('averageLeadTime');
    });
  });

  describe('GET /api/statistics/analytics/peak-hours', () => {
    it('should return peak hours analysis', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
        {
          startTime: new Date('2025-01-15T09:00:00Z'),
          endTime: new Date('2025-01-15T17:00:00Z'),
        },
      ]);

      const response = await request(app)
        .get('/api/statistics/analytics/peak-hours')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('hour');
      expect(response.body.data[0]).toHaveProperty('reservationCount');
    });
  });

  describe('GET /api/statistics/analytics/day-of-week', () => {
    it('should return day of week analysis', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
        {
          createdAt: new Date('2025-01-06T10:00:00Z'),
          startTime: new Date('2025-01-10T09:00:00Z'),
          endTime: new Date('2025-01-11T09:00:00Z'),
        },
      ]);

      const response = await request(app)
        .get('/api/statistics/analytics/day-of-week')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(7);
      expect(response.body.data[0]).toHaveProperty('dayName');
    });
  });

  describe('GET /api/statistics/analytics/forecast', () => {
    it('should return forecast', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
        {
          createdAt: new Date('2025-01-15T10:00:00Z'),
        },
      ]);

      const response = await request(app)
        .get('/api/statistics/analytics/forecast')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('date');
        expect(response.body.data[0]).toHaveProperty('predictedReservations');
        expect(response.body.data[0]).toHaveProperty('confidence');
      }
    });
  });
});
