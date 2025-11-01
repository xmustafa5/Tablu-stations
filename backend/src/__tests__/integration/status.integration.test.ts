import request from 'supertest';
import express, { Application } from 'express';
import statusRoutes from '../../routes/status.routes';
import { errorHandler } from '../../middleware/errorHandler';
import prisma from '../../utils/prisma';
import { generateToken } from '../../utils/jwt';
import { ReservationStatus } from '../../generated/prisma';

jest.mock('../../utils/prisma', () => ({
  __esModule: true,
  default: {
    reservation: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Status Management Integration Tests', () => {
  let app: Application;
  let authToken: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/status', statusRoutes);
    app.use(errorHandler);

    authToken = generateToken({
      userId: 'user-123',
      email: 'test@example.com',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PATCH /api/status/reservations/:id/status', () => {
    it('should transition reservation status successfully', async () => {
      const resId = '550e8400-e29b-41d4-a716-446655440000';
      const mockReservation = {
        id: resId,
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

      const response = await request(app)
        .patch(`/api/status/reservations/${resId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: ReservationStatus.ACTIVE })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.oldStatus).toBe(ReservationStatus.WAITING);
      expect(response.body.data.newStatus).toBe(ReservationStatus.ACTIVE);
    });

    it('should return 400 for invalid status transition', async () => {
      const resId = '550e8400-e29b-41d4-a716-446655440001';
      const mockReservation = {
        id: resId,
        status: ReservationStatus.COMPLETED,
        userId: 'user-123',
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      const response = await request(app)
        .patch(`/api/status/reservations/${resId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: ReservationStatus.ACTIVE })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const resId = '550e8400-e29b-41d4-a716-446655440002';
      await request(app)
        .patch(`/api/status/reservations/${resId}/status`)
        .send({ status: ReservationStatus.ACTIVE })
        .expect(401);
    });
  });

  describe('PATCH /api/status/reservations/:id/complete', () => {
    it('should complete reservation successfully', async () => {
      const resId = '550e8400-e29b-41d4-a716-446655440003';
      const mockReservation = {
        id: resId,
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

      const response = await request(app)
        .patch(`/api/status/reservations/${resId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.newStatus).toBe(ReservationStatus.COMPLETED);
    });

    it('should return 400 if already completed', async () => {
      const resId = '550e8400-e29b-41d4-a716-446655440004';
      const mockReservation = {
        id: resId,
        status: ReservationStatus.COMPLETED,
        userId: 'user-123',
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      const response = await request(app)
        .patch(`/api/status/reservations/${resId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/status/summary', () => {
    it('should return status summary', async () => {
      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(5)  // WAITING
        .mockResolvedValueOnce(3)  // ACTIVE
        .mockResolvedValueOnce(2)  // ENDING_SOON
        .mockResolvedValueOnce(10); // COMPLETED

      const response = await request(app)
        .get('/api/status/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[ReservationStatus.WAITING]).toBe(5);
      expect(response.body.data[ReservationStatus.ACTIVE]).toBe(3);
      expect(response.body.data[ReservationStatus.ENDING_SOON]).toBe(2);
      expect(response.body.data[ReservationStatus.COMPLETED]).toBe(10);
    });
  });

  describe('POST /api/status/auto-update', () => {
    it('should update statuses automatically', async () => {
      (prisma.reservation.updateMany as jest.Mock)
        .mockResolvedValueOnce({ count: 7 })
        .mockResolvedValueOnce({ count: 3 });

      const response = await request(app)
        .post('/api/status/auto-update')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.activatedCount).toBe(7);
      expect(response.body.data.endingSoonCount).toBe(3);
    });
  });

  describe('POST /api/status/conflicts/check', () => {
    it('should check for conflicts successfully', async () => {
      const conflicts = [
        {
          id: 'res-456',
          advertiserName: 'Company B',
          customerName: 'Customer B',
          location: 'Station A',
          startTime: new Date('2025-12-01T10:00:00Z'),
          endTime: new Date('2025-12-01T12:00:00Z'),
          status: ReservationStatus.ACTIVE,
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(conflicts);

      const response = await request(app)
        .post('/api/status/conflicts/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          location: 'Station A',
          startTime: '2025-12-01T11:00:00Z',
          endTime: '2025-12-01T13:00:00Z',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.hasConflicts).toBe(true);
      expect(response.body.data.conflictCount).toBe(1);
      expect(response.body.data.conflicts).toHaveLength(1);
    });

    it('should return no conflicts when slot is available', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .post('/api/status/conflicts/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          location: 'Station A',
          startTime: '2025-12-01T11:00:00Z',
          endTime: '2025-12-01T13:00:00Z',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.hasConflicts).toBe(false);
      expect(response.body.data.conflictCount).toBe(0);
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/status/conflicts/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          location: 'A', // Too short
          startTime: 'invalid-date',
          endTime: '2025-12-01T13:00:00Z',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/status/slots/available', () => {
    it('should return available slots', async () => {
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/status/slots/available')
        .query({
          location: 'Station A',
          date: '2025-12-01',
          slotDuration: 60,
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.location).toBe('Station A');
      expect(response.body.data.availableSlots).toBeDefined();
      expect(Array.isArray(response.body.data.availableSlots)).toBe(true);
    });

    it('should return 400 for invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/status/slots/available')
        .query({
          location: 'A', // Too short
          date: 'invalid-date',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/status/locations/stats', () => {
    it('should return location statistics', async () => {
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
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(reservations);

      const response = await request(app)
        .get('/api/status/locations/stats')
        .query({
          location: 'Station A',
          startDate: '2025-12-01',
          endDate: '2025-12-31',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalReservations).toBe(2);
      expect(response.body.data.averageOccupancyRate).toBeGreaterThanOrEqual(0);
      expect(response.body.data.peakDays).toBeDefined();
    });

    it('should return 400 if end date is before start date', async () => {
      const response = await request(app)
        .get('/api/status/locations/stats')
        .query({
          location: 'Station A',
          startDate: '2025-12-31',
          endDate: '2025-12-01',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
