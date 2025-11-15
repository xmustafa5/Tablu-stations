import { Request, Response, NextFunction } from 'express';
import viewerStatisticsService from '../services/viewerStatistics.service';

/**
 * Get viewer statistics for a single location
 */
export const getLocationViewers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { locationId } = req.params;
    const statistics = await viewerStatisticsService.getLocationViewers(locationId);
    res.json(statistics);
  } catch (error) {
    next(error);
  }
};

/**
 * Get viewer statistics for all locations
 */
export const getAllLocationsViewers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const statistics = await viewerStatisticsService.getAllLocationsViewers(includeInactive);
    res.json(statistics);
  } catch (error) {
    next(error);
  }
};

/**
 * Get viewers for a specific date range for a location
 */
export const getViewersForDateRange = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { locationId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'startDate and endDate are required' });
      return;
    }

    const statistics = await viewerStatisticsService.getViewersForDateRange(
      locationId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(statistics);
  } catch (error) {
    next(error);
  }
};

/**
 * Get viewers for multiple locations in a date range
 */
export const getMultipleLocationsViewers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { locationIds, startDate, endDate } = req.body;

    if (!locationIds || !Array.isArray(locationIds) || locationIds.length === 0) {
      res.status(400).json({ message: 'locationIds array is required' });
      return;
    }

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'startDate and endDate are required' });
      return;
    }

    const statistics = await viewerStatisticsService.getMultipleLocationsViewersForDateRange(
      locationIds,
      new Date(startDate),
      new Date(endDate)
    );

    res.json(statistics);
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate cost per view for multiple locations
 */
export const calculateCostPerView = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { locationIds, totalCost, startDate, endDate } = req.body;

    if (!locationIds || !Array.isArray(locationIds) || locationIds.length === 0) {
      res.status(400).json({ message: 'locationIds array is required' });
      return;
    }

    if (totalCost === undefined || totalCost === null) {
      res.status(400).json({ message: 'totalCost is required' });
      return;
    }

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'startDate and endDate are required' });
      return;
    }

    const result = await viewerStatisticsService.calculateCostPerView(
      locationIds,
      Number(totalCost),
      new Date(startDate),
      new Date(endDate)
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get best location plan based on cost optimization
 */
export const getBestLocationPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { totalCost, startDate, endDate, maxLocations } = req.body;

    if (totalCost === undefined || totalCost === null) {
      res.status(400).json({ message: 'totalCost is required' });
      return;
    }

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'startDate and endDate are required' });
      return;
    }

    const result = await viewerStatisticsService.getBestLocationPlan(
      Number(totalCost),
      new Date(startDate),
      new Date(endDate),
      maxLocations ? Number(maxLocations) : undefined
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Update monthly viewers for a location
 */
export const updateMonthlyViewers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { locationId } = req.params;
    const { monthlyViewers } = req.body;

    if (monthlyViewers === undefined || monthlyViewers === null) {
      res.status(400).json({ message: 'monthlyViewers is required' });
      return;
    }

    await viewerStatisticsService.updateMonthlyViewers(locationId, Number(monthlyViewers));
    res.json({ message: 'Monthly viewers updated successfully' });
  } catch (error) {
    next(error);
  }
};
