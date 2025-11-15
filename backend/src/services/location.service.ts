import prisma from '../utils/prisma';
import { AppError } from '../middleware/errorHandler';

export interface CreateLocationDto {
  name: string;
  description?: string;
  isActive?: boolean;
  limit?: number;
  monthlyViewers?: number;
}

export interface UpdateLocationDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  limit?: number;
  monthlyViewers?: number;
}

export interface LocationResponse {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  limit: number;
  monthlyViewers: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    reservations: number;
  };
}

export class LocationService {
  /**
   * Get all locations
   */
  async getAllLocations(includeInactive = false): Promise<LocationResponse[]> {
    const locations = await prisma.location.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return locations;
  }

  /**
   * Get location by ID
   */
  async getLocationById(id: string): Promise<LocationResponse> {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    if (!location) {
      throw new AppError('Location not found', 404);
    }

    return location;
  }

  /**
   * Create a new location
   */
  async createLocation(data: CreateLocationDto): Promise<LocationResponse> {
    // Check if location name already exists
    const existingLocation = await prisma.location.findUnique({
      where: { name: data.name },
    });

    if (existingLocation) {
      throw new AppError('Location with this name already exists', 400);
    }

    const location = await prisma.location.create({
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
        limit: data.limit ?? 10,
        monthlyViewers: data.monthlyViewers ?? 0,
      },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    return location;
  }

  /**
   * Update a location
   */
  async updateLocation(id: string, data: UpdateLocationDto): Promise<LocationResponse> {
    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      throw new AppError('Location not found', 404);
    }

    // If updating name, check if new name is already taken
    if (data.name && data.name !== existingLocation.name) {
      const nameExists = await prisma.location.findUnique({
        where: { name: data.name },
      });

      if (nameExists) {
        throw new AppError('Location with this name already exists', 400);
      }
    }

    const location = await prisma.location.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.limit !== undefined && { limit: data.limit }),
        ...(data.monthlyViewers !== undefined && { monthlyViewers: data.monthlyViewers }),
      },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    return location;
  }

  /**
   * Delete a location (soft delete by setting isActive to false)
   */
  async deleteLocation(id: string, hardDelete = false): Promise<void> {
    // Check if location exists
    const existingLocation = await prisma.location.findUnique({
      where: { id },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    if (!existingLocation) {
      throw new AppError('Location not found', 404);
    }

    // Check if location has reservations
    if (existingLocation._count.reservations > 0 && hardDelete) {
      throw new AppError(
        'Cannot delete location with existing reservations. Deactivate instead or delete all reservations first.',
        400
      );
    }

    if (hardDelete && existingLocation._count.reservations === 0) {
      // Hard delete if no reservations
      await prisma.location.delete({
        where: { id },
      });
    } else {
      // Soft delete (deactivate)
      await prisma.location.update({
        where: { id },
        data: { isActive: false },
      });
    }
  }

  /**
   * Get location statistics
   */
  async getLocationStatistics(id: string, startDate?: Date, endDate?: Date) {
    const location = await prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new AppError('Location not found', 404);
    }

    const whereClause: any = {
      locationId: id,
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = startDate;
      if (endDate) whereClause.createdAt.lte = endDate;
    }

    const [totalReservations, statusBreakdown, reservations] = await Promise.all([
      // Total reservations count
      prisma.reservation.count({
        where: whereClause,
      }),

      // Status breakdown
      prisma.reservation.groupBy({
        by: ['status'],
        where: whereClause,
        _count: {
          status: true,
        },
      }),

      // Get all reservations for duration calculation
      prisma.reservation.findMany({
        where: whereClause,
        select: {
          startTime: true,
          endTime: true,
        },
      }),
    ]);

    // Calculate total duration in hours
    let totalDurationHours = 0;
    reservations.forEach((reservation) => {
      const durationMs = reservation.endTime.getTime() - reservation.startTime.getTime();
      totalDurationHours += durationMs / (1000 * 60 * 60);
    });

    const averageDuration = totalReservations > 0 ? totalDurationHours / totalReservations : 0;

    // Format status breakdown
    const statusStats = {
      waiting: 0,
      active: 0,
      endingSoon: 0,
      completed: 0,
    };

    statusBreakdown.forEach((item) => {
      const key = item.status.toLowerCase() as keyof typeof statusStats;
      if (key === 'ending_soon') {
        statusStats.endingSoon = item._count.status;
      } else {
        statusStats[key] = item._count.status;
      }
    });

    return {
      location: {
        id: location.id,
        name: location.name,
        description: location.description,
      },
      totalReservations,
      totalDurationHours: parseFloat(totalDurationHours.toFixed(2)),
      averageDuration: parseFloat(averageDuration.toFixed(2)),
      statusBreakdown: statusStats,
    };
  }
}

export default new LocationService();
