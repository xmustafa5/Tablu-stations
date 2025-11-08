import { Request, Response, NextFunction } from 'express';
import locationService from '../services/location.service';

export class LocationController {
  /**
   * Get all locations
   */
  async getAllLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const locations = await locationService.getAllLocations(includeInactive);

      res.status(200).json({
        success: true,
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get location by ID
   */
  async getLocationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const location = await locationService.getLocationById(id);

      res.status(200).json({
        success: true,
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new location
   */
  async createLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, isActive } = req.body;
      const location = await locationService.createLocation({
        name,
        description,
        isActive,
      });

      res.status(201).json({
        success: true,
        data: location,
        message: 'Location created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a location
   */
  async updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;

      const location = await locationService.updateLocation(id, {
        name,
        description,
        isActive,
      });

      res.status(200).json({
        success: true,
        data: location,
        message: 'Location updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a location
   */
  async deleteLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const hardDelete = req.query.hard === 'true';

      await locationService.deleteLocation(id, hardDelete);

      res.status(200).json({
        success: true,
        message: hardDelete
          ? 'Location deleted successfully'
          : 'Location deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get location statistics
   */
  async getLocationStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const statistics = await locationService.getLocationStatistics(
        id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LocationController();
