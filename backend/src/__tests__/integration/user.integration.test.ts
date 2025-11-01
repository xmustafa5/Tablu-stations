import request from 'supertest';
import express, { Application } from 'express';
import userRoutes from '../../routes/user.routes';
import { errorHandler } from '../../middleware/errorHandler';
import prisma from '../../utils/prisma';
import { generateToken } from '../../utils/jwt';
import { Role } from '../../generated/prisma';
import { hashPassword } from '../../utils/password';

jest.mock('../../utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    reservation: {
      groupBy: jest.fn(),
    },
  },
}));

jest.mock('../../utils/password', () => ({
  hashPassword: jest.fn(),
}));

describe('User Management Integration Tests', () => {
  let app: Application;
  let adminToken: string;
  let userToken: string;
  const adminId = '550e8400-e29b-41d4-a716-446655440077';
  const userId = '550e8400-e29b-41d4-a716-446655440078';

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/users', userRoutes);
    app.use(errorHandler);

    adminToken = generateToken({
      userId: adminId,
      email: 'admin@example.com',
      role: Role.ADMIN,
    });

    userToken = generateToken({
      userId: userId,
      email: 'user@example.com',
      role: Role.USER,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return paginated list of users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User One',
          role: Role.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'User Two',
          role: Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should filter users by role', async () => {
      const mockAdmins = [
        {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockAdmins);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ role: Role.ADMIN })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].role).toBe(Role.ADMIN);
    });

    it('should search users', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'john@example.com',
          name: 'John Doe',
          role: Role.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ search: 'john' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it('should return 401 without authentication', async () => {
      await request(app).get('/api/users').expect(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440010';
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
    });

    it('should return 404 if user not found', async () => {
      const invalidId = '550e8400-e29b-41d4-a716-446655440011';
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/users/${invalidId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(app)
        .get('/api/users/not-a-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    it('should create new user as admin', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
        role: Role.USER,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashed_password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'new-user-id',
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(newUser.email);
    });

    it('should return 403 if non-admin tries to create user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newUser)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if email already exists', async () => {
      const newUser = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: newUser.email,
      });

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid input', async () => {
      const invalidUser = {
        email: 'not-an-email',
        password: 'short',
        name: 'A',
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should allow user to update themselves', async () => {
      const existingUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Old Name',
        role: Role.USER,
      };

      const updateData = {
        name: 'New Name',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...existingUser,
        ...updateData,
        updatedAt: new Date(),
      });

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should allow admin to update any user', async () => {
      const userId = '550e8400-e29b-41d4-a716-446655440087';
      const existingUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Old Name',
        role: Role.USER,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...existingUser,
        name: 'Admin Updated',
        updatedAt: new Date(),
      });

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admin Updated' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 if user tries to update another user', async () => {
      const differentUserId = '550e8400-e29b-41d4-a716-446655440099';

      const response = await request(app)
        .put(`/api/users/${differentUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 if non-admin tries to change role', async () => {
      const existingUser = {
        id: userId,
        email: 'user@example.com',
        role: Role.USER,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: Role.ADMIN })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow admin to delete user', async () => {
      const userIdToDelete = '550e8400-e29b-41d4-a716-446655440088';
      const userToDelete = {
        id: userIdToDelete,
        email: 'delete@example.com',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userToDelete);
      (prisma.user.delete as jest.Mock).mockResolvedValue(userToDelete);

      const response = await request(app)
        .delete(`/api/users/${userIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 if non-admin tries to delete', async () => {
      const someUserId = '550e8400-e29b-41d4-a716-446655440089';

      const response = await request(app)
        .delete(`/api/users/${someUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if admin tries to delete themselves', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 if user not found', async () => {
      const invalidId = '550e8400-e29b-41d4-a716-446655440090';
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/users/${invalidId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id/stats', () => {
    it('should allow user to view own stats', async () => {
      const mockUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Test User',
        role: Role.USER,
        createdAt: new Date(),
      };

      const mockStats = [
        { status: 'ACTIVE', _count: { id: 5 } },
        { status: 'COMPLETED', _count: { id: 10 } },
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.reservation.groupBy as jest.Mock).mockResolvedValue(mockStats);

      const response = await request(app)
        .get(`/api/users/${userId}/stats`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reservations.total).toBe(15);
    });

    it('should allow admin to view any user stats', async () => {
      const otherUserId = '550e8400-e29b-41d4-a716-446655440097';
      const mockUser = {
        id: otherUserId,
        email: 'other@example.com',
        name: 'Other User',
        role: Role.USER,
        createdAt: new Date(),
      };

      const mockStats = [{ status: 'ACTIVE', _count: { id: 3 } }];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.reservation.groupBy as jest.Mock).mockResolvedValue(mockStats);

      const response = await request(app)
        .get(`/api/users/${otherUserId}/stats`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 403 if user tries to view another user stats', async () => {
      const differentUserId = '550e8400-e29b-41d4-a716-446655440098';

      const response = await request(app)
        .get(`/api/users/${differentUserId}/stats`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/users/bulk', () => {
    it('should allow admin to bulk update users', async () => {
      const userIds = [
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003',
      ];
      const mockUsers = userIds.map((id) => ({ id }));

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      const response = await request(app)
        .patch('/api/users/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userIds, role: Role.ADMIN })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.updatedCount).toBe(3);
    });

    it('should return 403 if non-admin tries bulk update', async () => {
      const response = await request(app)
        .patch('/api/users/bulk')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userIds: ['550e8400-e29b-41d4-a716-446655440001'],
          role: Role.ADMIN,
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid user IDs', async () => {
      const userIds = [
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003',
      ];
      const mockUsers = [
        { id: '550e8400-e29b-41d4-a716-446655440001' },
        { id: '550e8400-e29b-41d4-a716-446655440002' },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const response = await request(app)
        .patch('/api/users/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userIds, role: Role.ADMIN })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if userIds array is empty', async () => {
      const response = await request(app)
        .patch('/api/users/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userIds: [], role: Role.ADMIN })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
