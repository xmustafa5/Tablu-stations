import prisma from '../utils/prisma';
import { hashPassword } from '../utils/password';
import { Role } from '../generated/prisma';
import { AppError } from '../middleware/errorHandler';

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface UpdateUserDTO {
  email?: string;
  name?: string;
  role?: Role;
  password?: string;
}

export interface UserListFilters {
  role?: Role;
  search?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  /**
   * Get all users with optional filters and pagination
   */
  async getAllUsers(filters: UserListFilters = {}) {
    const {
      role,
      search,
      page = 1,
      limit = 10,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        reservations: {
          select: {
            id: true,
            advertiserName: true,
            customerName: true,
            location: true,
            startTime: true,
            endTime: true,
            status: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Create new user (admin only)
   */
  async createUser(data: CreateUserDTO) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || Role.USER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user by ID
   */
  async updateUser(userId: string, data: UpdateUserDTO) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // If email is being updated, check for duplicates
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new AppError('Email already exists', 400);
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (data.email) updateData.email = data.email;
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Delete user by ID
   */
  async deleteUser(userId: string) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // Delete user (cascades to reservations)
    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const [user, reservationStats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.reservation.groupBy({
        by: ['status'],
        where: { userId },
        _count: { id: true },
      }),
    ]);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const statusCounts = reservationStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    const totalReservations = reservationStats.reduce(
      (sum, stat) => sum + stat._count.id,
      0
    );

    return {
      user,
      reservations: {
        total: totalReservations,
        byStatus: statusCounts,
      },
    };
  }

  /**
   * Bulk update users (admin only)
   */
  async bulkUpdateUsers(userIds: string[], data: UpdateUserDTO) {
    // Validate user IDs exist
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true },
    });

    if (users.length !== userIds.length) {
      throw new AppError('Some user IDs are invalid', 400);
    }

    // Prepare update data
    const updateData: any = {};
    if (data.role) updateData.role = data.role;

    // Bulk update
    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: updateData,
    });

    return {
      updatedCount: result.count,
      message: `${result.count} user(s) updated successfully`,
    };
  }
}

export default new UserService();
