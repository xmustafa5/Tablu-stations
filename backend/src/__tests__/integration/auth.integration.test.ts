import request from 'supertest';
import express, { Application } from 'express';
import authRoutes from '../../routes/auth.routes';
import { errorHandler } from '../../middleware/errorHandler';
import prisma from '../../utils/prisma';
import * as passwordUtils from '../../utils/password';

// Mock Prisma
jest.mock('../../utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock password utils
jest.mock('../../utils/password');

describe('Auth Integration Tests', () => {
  let app: Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
      };

      const mockCreatedUser = {
        id: 'user-123',
        email: newUser.email,
        name: newUser.name,
        password: 'hashed-password',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashed-password');

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(response.body.data.user.name).toBe(newUser.name);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return 400 if email already exists', async () => {
      const existingUser = {
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Existing User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-456',
        email: existingUser.email,
        name: existingUser.name,
        password: 'hashed-password',
        role: 'USER',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(existingUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'Password123!',
      };

      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        name: 'Test User',
        password: '$2b$10$xyz...', // This will be mocked in the service
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user for valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the sequence: first findUnique returns null (user doesn't exist), then create returns user
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);  // For registration check
      (prisma.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: 'hashed-password',
      });
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashed-password');

      // Then findUnique returns the user (for getCurrentUser call)
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockUser);

      // First register to get a valid token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
        });

      const token = registerResponse.body.data.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBeDefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('No token provided');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Authentication failed');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        password: 'hashed-password',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashed-password');

      // Register to get a valid token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          name: 'Test User',
        });

      const token = registerResponse.body.data.token;

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
