import { AuthService } from '../../services/auth.service';
import prisma from '../../utils/prisma';
import * as passwordUtils from '../../utils/password';
import * as jwtUtils from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';

// Mock dependencies
jest.mock('../../utils/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../../utils/password');
jest.mock('../../utils/jwt');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerInput = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: registerInput.email,
        name: registerInput.name,
        password: 'hashed-password',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue('hashed-password');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('jwt-token');

      const result = await authService.register(registerInput);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerInput.email },
      });
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(registerInput.password);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerInput.email,
          password: 'hashed-password',
          name: registerInput.name,
        },
      });
      expect(jwtUtils.generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
        token: 'jwt-token',
      });
    });

    it('should throw error if email already exists', async () => {
      const existingUser = {
        id: 'user-123',
        email: registerInput.email,
        name: 'Existing User',
        password: 'hashed-password',
        role: 'USER',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      await expect(authService.register(registerInput)).rejects.toThrow(
        new AppError('Email already exists', 400)
      );

      expect(passwordUtils.hashPassword).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginInput = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login user successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: loginInput.email,
        name: 'Test User',
        password: 'hashed-password',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('jwt-token');

      const result = await authService.login(loginInput);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginInput.email },
      });
      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
        loginInput.password,
        mockUser.password
      );
      expect(jwtUtils.generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        },
        token: 'jwt-token',
      });
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginInput)).rejects.toThrow(
        new AppError('Invalid credentials', 401)
      );

      expect(passwordUtils.comparePassword).not.toHaveBeenCalled();
      expect(jwtUtils.generateToken).not.toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
      const mockUser = {
        id: 'user-123',
        email: loginInput.email,
        name: 'Test User',
        password: 'hashed-password',
        role: 'USER',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (passwordUtils.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginInput)).rejects.toThrow(
        new AppError('Invalid credentials', 401)
      );

      expect(jwtUtils.generateToken).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user data for valid userId', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser('user-123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.getCurrentUser('invalid-id')).rejects.toThrow(
        new AppError('User not found', 404)
      );
    });
  });
});
