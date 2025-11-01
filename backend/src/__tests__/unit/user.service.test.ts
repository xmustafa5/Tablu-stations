import { UserService } from '../../services/user.service';
import prisma from '../../utils/prisma';
import { hashPassword } from '../../utils/password';
import { Role } from '../../generated/prisma';

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

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
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

      const result = await userService.getAllUsers({ page: 1, limit: 10 });

      expect(result.users).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);
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

      const result = await userService.getAllUsers({ role: Role.ADMIN });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].role).toBe(Role.ADMIN);
    });

    it('should search users by email or name', async () => {
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

      const result = await userService.getAllUsers({ search: 'john' });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].name).toBe('John Doe');
    });
  });

  describe('getUserById', () => {
    it('should return user with reservations', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [
          {
            id: 'res-1',
            advertiserName: 'Company A',
            customerName: 'Customer A',
            location: 'Station A',
            startTime: new Date(),
            endTime: new Date(),
            status: 'ACTIVE',
          },
        ],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getUserById('user-1');

      expect(result.id).toBe('user-1');
      expect(result.reservations).toHaveLength(1);
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserById('invalid-id')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('createUser', () => {
    it('should create new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'New User',
        role: Role.USER,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashed_password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'new-user-id',
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await userService.createUser(userData);

      expect(result.email).toBe(userData.email);
      expect(hashPassword).toHaveBeenCalledWith(userData.password);
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: userData.email,
      });

      await expect(userService.createUser(userData)).rejects.toThrow(
        'Email already exists'
      );
    });

    it('should default to USER role if not specified', async () => {
      const userData = {
        email: 'user@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashed_password');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'new-user-id',
        email: userData.email,
        name: userData.name,
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await userService.createUser(userData);

      expect(result.role).toBe(Role.USER);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'old@example.com',
        name: 'Old Name',
        role: Role.USER,
      };

      const updateData = {
        email: 'new@example.com',
        name: 'New Name',
      };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingUser) // First call for existence check
        .mockResolvedValueOnce(null); // Second call for email uniqueness check

      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...existingUser,
        ...updateData,
        updatedAt: new Date(),
      });

      const result = await userService.updateUser('user-1', updateData);

      expect(result.email).toBe(updateData.email);
      expect(result.name).toBe(updateData.name);
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.updateUser('invalid-id', { name: 'New Name' })
      ).rejects.toThrow('User not found');
    });

    it('should throw error if email already taken', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'user1@example.com',
      };

      const anotherUser = {
        id: 'user-2',
        email: 'user2@example.com',
      };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(anotherUser);

      await expect(
        userService.updateUser('user-1', { email: 'user2@example.com' })
      ).rejects.toThrow('Email already exists');
    });

    it('should hash password when updating', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User',
        role: Role.USER,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      (hashPassword as jest.Mock).mockResolvedValue('new_hashed_password');
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...existingUser,
        updatedAt: new Date(),
      });

      await userService.updateUser('user-1', { password: 'NewPassword123' });

      expect(hashPassword).toHaveBeenCalledWith('NewPassword123');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'user@example.com',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
      (prisma.user.delete as jest.Mock).mockResolvedValue(existingUser);

      const result = await userService.deleteUser('user-1');

      expect(result.message).toBe('User deleted successfully');
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.deleteUser('invalid-id')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        role: Role.USER,
        createdAt: new Date(),
      };

      const mockReservationStats = [
        { status: 'ACTIVE', _count: { id: 5 } },
        { status: 'COMPLETED', _count: { id: 10 } },
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.reservation.groupBy as jest.Mock).mockResolvedValue(
        mockReservationStats
      );

      const result = await userService.getUserStats('user-1');

      expect(result.user.id).toBe('user-1');
      expect(result.reservations.total).toBe(15);
      expect(result.reservations.byStatus.ACTIVE).toBe(5);
      expect(result.reservations.byStatus.COMPLETED).toBe(10);
    });

    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserStats('invalid-id')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('bulkUpdateUsers', () => {
    it('should update multiple users successfully', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];
      const mockUsers = userIds.map((id) => ({ id }));

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await userService.bulkUpdateUsers(userIds, {
        role: Role.ADMIN,
      });

      expect(result.updatedCount).toBe(3);
      expect(result.message).toBe('3 user(s) updated successfully');
    });

    it('should throw error if some user IDs are invalid', async () => {
      const userIds = ['user-1', 'user-2', 'invalid-id'];
      const mockUsers = [{ id: 'user-1' }, { id: 'user-2' }];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      await expect(
        userService.bulkUpdateUsers(userIds, { role: Role.ADMIN })
      ).rejects.toThrow('Some user IDs are invalid');
    });
  });
});
