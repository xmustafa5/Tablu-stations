import { Request, Response, NextFunction } from 'express';
import statisticsService from '../services/statistics.service';
import analyticsService from '../services/analytics.service';

export class StatisticsController {
  async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const stats = await statisticsService.getDashboardStats(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRevenueStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const stats = await statisticsService.getRevenueStats(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOccupancyStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const stats = await statisticsService.getOccupancyStats(
        new Date(startDate as string),
        new Date(endDate as string),
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPopularLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, limit } = req.query;

      const locations = await statisticsService.getPopularLocations(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        req.user?.userId,
        limit ? parseInt(limit as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: locations,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReservationTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, interval } = req.query;

      const trends = await statisticsService.getReservationTrends(
        new Date(startDate as string),
        new Date(endDate as string),
        interval as 'day' | 'week' | 'month',
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: trends,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGrowthMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentStart, currentEnd, previousStart, previousEnd } = req.query;

      const metrics = await analyticsService.getGrowthMetrics(
        new Date(currentStart as string),
        new Date(currentEnd as string),
        new Date(previousStart as string),
        new Date(previousEnd as string),
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const metrics = await analyticsService.getCustomerMetrics(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPerformanceMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const metrics = await analyticsService.getPerformanceMetrics(
        new Date(startDate as string),
        new Date(endDate as string),
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPeakHours(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const analysis = await analyticsService.getPeakHoursAnalysis(
        new Date(startDate as string),
        new Date(endDate as string),
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDayOfWeekAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const analysis = await analyticsService.getDayOfWeekAnalysis(
        new Date(startDate as string),
        new Date(endDate as string),
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }

  async getForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { historicalDays, forecastDays } = req.query;

      const forecast = await analyticsService.getForecast(
        historicalDays ? parseInt(historicalDays as string) : undefined,
        forecastDays ? parseInt(forecastDays as string) : undefined,
        req.user?.userId
      );

      res.status(200).json({
        success: true,
        data: forecast,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StatisticsController();
