import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { Role } from '../generated/prisma';
import { AppError } from '../middleware/errorHandler';

class UserController {
  /**
   * Get all users with optional filters
   * GET /api/v1/users
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, search, page, limit } = req.query;

      const result = await userService.getAllUsers({
        role: role as Role,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/v1/users/:id
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new user (admin only)
   * POST /api/v1/users
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if requester is admin
      if (req.user?.role !== Role.ADMIN) {
        throw new AppError('Only admins can create users', 403);
      }

      const { email, password, name, role } = req.body;

      const user = await userService.createUser({
        email,
        password,
        name,
        role,
      });

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user by ID
   * PUT /api/v1/users/:id
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { email, name, role, password } = req.body;

      // Check authorization
      // User can update themselves, admin can update anyone
      if (req.user?.userId !== id && req.user?.role !== Role.ADMIN) {
        throw new AppError('You do not have permission to update this user', 403);
      }

      // Only admin can change role
      if (role && req.user?.role !== Role.ADMIN) {
        throw new AppError('Only admins can change user roles', 403);
      }

      const user = await userService.updateUser(id, {
        email,
        name,
        role,
        password,
      });

      res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user by ID (admin only)
   * DELETE /api/v1/users/:id
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Check if requester is admin
      if (req.user?.role !== Role.ADMIN) {
        throw new AppError('Only admins can delete users', 403);
      }

      // Prevent self-deletion
      if (req.user?.userId === id) {
        throw new AppError('You cannot delete your own account', 400);
      }

      const result = await userService.deleteUser(id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   * GET /api/v1/users/:id/stats
   */
  async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Users can view their own stats, admins can view anyone's
      if (req.user?.userId !== id && req.user?.role !== Role.ADMIN) {
        throw new AppError('You do not have permission to view these statistics', 403);
      }

      const stats = await userService.getUserStats(id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk update users (admin only)
   * PATCH /api/v1/users/bulk
   */
  async bulkUpdateUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if requester is admin
      if (req.user?.role !== Role.ADMIN) {
        throw new AppError('Only admins can perform bulk updates', 403);
      }

      const { userIds, role } = req.body;

      const result = await userService.bulkUpdateUsers(userIds, { role });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
