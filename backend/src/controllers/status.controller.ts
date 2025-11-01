import { Request, Response, NextFunction } from 'express';
import statusTransitionService from '../services/statusTransition.service';
import conflictCheckerService from '../services/conflictChecker.service';

export class StatusController {
  async transitionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await statusTransitionService.transitionStatus(
        id,
        status,
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        message: 'Status transition successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async completeReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { id } = req.params;

      const result = await statusTransitionService.completeReservation(
        id,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: 'Reservation completed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatusSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await statusTransitionService.getStatusSummary(
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatusesAutomatically(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await statusTransitionService.updateStatusesAutomatically();

      res.status(200).json({
        success: true,
        message: 'Statuses updated automatically',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkConflicts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { location, startTime, endTime, excludeReservationId } = req.body;

      const conflicts = await conflictCheckerService.checkConflicts({
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        excludeReservationId,
      });

      res.status(200).json({
        success: true,
        data: {
          hasConflicts: conflicts.length > 0,
          conflictCount: conflicts.length,
          conflicts,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableSlots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { location, date, slotDuration } = req.query;

      const slots = await conflictCheckerService.getAvailableSlots(
        location as string,
        new Date(date as string),
        slotDuration ? parseInt(slotDuration as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: {
          location,
          date,
          slotDuration: slotDuration ? parseInt(slotDuration as string) : 60,
          availableSlots: slots,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getLocationStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { location, startDate, endDate } = req.query;

      const stats = await conflictCheckerService.getLocationConflictStats(
        location as string,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.status(200).json({
        success: true,
        data: {
          location,
          dateRange: {
            start: startDate,
            end: endDate,
          },
          ...stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getValidNextStatuses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // This is a simple endpoint to get valid transitions
      res.status(200).json({
        success: true,
        message: 'Use GET /api/v1/status/transitions to see all valid status transitions',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StatusController();
