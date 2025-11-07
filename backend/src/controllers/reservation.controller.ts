import { Request, Response, NextFunction } from 'express';
import reservationService from '../services/reservation.service';
import { ReservationStatus } from '../generated/prisma';

export class ReservationController {
  async createReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const reservation = await reservationService.createReservation({
        ...req.body,
        userId: req.user.userId,
      });

      res.status(201).json({
        success: true,
        message: 'Reservation created successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await reservationService.getReservations({
        search: req.query.search as string,
        status: req.query.status as ReservationStatus,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        // Don't filter by userId - show all reservations to all users
      });

      res.status(200).json({
        success: true,
        data: result.reservations,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReservationById(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await reservationService.getReservationById(
        req.params.id,
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const reservation = await reservationService.updateReservation(
        req.params.id,
        req.user.userId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Reservation updated successfully',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReservation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const result = await reservationService.deleteReservation(
        req.params.id,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCalendarReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const month = parseInt(req.query.month as string);
      const year = parseInt(req.query.year as string);

      // Don't filter by userId - show all reservations to all users in calendar
      const result = await reservationService.getCalendarReservations(
        month,
        year,
        undefined
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReservationController();
