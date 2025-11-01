import request from 'supertest';
import express, { Application } from 'express';
import reservationRoutes from '../../routes/reservation.routes';
import { errorHandler } from '../../middleware/errorHandler';
import prisma from '../../utils/prisma';
import { generateToken } from '../../utils/jwt';
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

describe('Reservation Integration Tests', () => {
  let app: Application;
  let authToken: string;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/reservations', reservationRoutes);
    app.use(errorHandler);

    // Generate auth token for testing
    authToken = generateToken({
      userId: 'user-123',
      email: 'test@example.com',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/reservations', () => {
    it('should create reservation with valid data', async () => {
      const newReservation = {
        advertiserName: 'شركة الحلول التقنية',
        customerName: 'أحمد محمد',
        location: 'شارع الرئيسي - وسط المدينة',
        startTime: '2025-12-01T09:00:00.000Z',
        endTime: '2025-12-08T17:00:00.000Z',
      };

      const mockCreated = {
        id: 'res-123',
        ...newReservation,
        startTime: new Date(newReservation.startTime),
        endTime: new Date(newReservation.endTime),
        status: ReservationStatus.WAITING,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.reservation.create as jest.Mock).mockResolvedValue(mockCreated);

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newReservation)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Reservation created successfully');
      expect(response.body.data.advertiserName).toBe(newReservation.advertiserName);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/reservations')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        advertiserName: 'A', // Too short
        customerName: 'Customer',
        location: 'Loc', // Too short
        startTime: 'invalid-date',
        endTime: '2025-12-08T17:00:00.000Z',
      };

      const response = await request(app)
        .post('/api/reservations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/reservations', () => {
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
          userId: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.reservation.count as jest.Mock).mockResolvedValue(25);
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const response = await request(app)
        .get('/api/reservations?page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reservations).toHaveLength(1);
      expect(response.body.data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 25,
        totalPages: 2,
      });
    });

    it('should filter reservations by status', async () => {
      (prisma.reservation.count as jest.Mock).mockResolvedValue(5);
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/reservations?status=ACTIVE')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should search reservations', async () => {
      (prisma.reservation.count as jest.Mock).mockResolvedValue(3);
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/reservations?search=شركة')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/reservations/:id', () => {
    it('should get reservation by id', async () => {
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

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      const response = await request(app)
        .get('/api/reservations/res-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('res-123');
    });

    it('should return 404 for non-existent reservation', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/reservations/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/reservations/:id', () => {
    it('should update reservation', async () => {
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

      const updateData = {
        advertiserName: 'Updated Company',
        status: ReservationStatus.ACTIVE,
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);
      (prisma.reservation.update as jest.Mock).mockResolvedValue({
        ...mockReservation,
        ...updateData,
      });

      const response = await request(app)
        .put('/api/reservations/res-123')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Reservation updated successfully');
      expect(response.body.data.advertiserName).toBe('Updated Company');
    });

    it('should return 403 if user does not own reservation', async () => {
      const mockReservation = {
        id: 'res-123',
        userId: 'other-user',
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      const response = await request(app)
        .put('/api/reservations/res-123')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ advertiserName: 'Updated' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/reservations/:id', () => {
    it('should delete reservation', async () => {
      const mockReservation = {
        id: 'res-123',
        userId: 'user-123',
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);
      (prisma.reservation.delete as jest.Mock).mockResolvedValue(mockReservation);

      const response = await request(app)
        .delete('/api/reservations/res-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Reservation deleted successfully');
    });

    it('should return 403 if user does not own reservation', async () => {
      const mockReservation = {
        id: 'res-123',
        userId: 'other-user',
      };

      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);

      const response = await request(app)
        .delete('/api/reservations/res-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/reservations/calendar', () => {
    it('should get calendar reservations', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          advertiserName: 'Company',
          startTime: new Date('2025-12-15'),
          endTime: new Date('2025-12-20'),
          status: ReservationStatus.WAITING,
        },
      ];

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);

      const response = await request(app)
        .get('/api/reservations/calendar?month=12&year=2025')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.month).toBe(12);
      expect(response.body.data.year).toBe(2025);
      expect(response.body.data.reservations).toHaveLength(1);
    });

    it('should return 400 for invalid month', async () => {
      const response = await request(app)
        .get('/api/reservations/calendar?month=13&year=2025')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });
});
