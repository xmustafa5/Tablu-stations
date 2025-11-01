import { Router } from 'express';
import statisticsController from '../controllers/statistics.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  dashboardStatsValidator,
  revenueStatsValidator,
  occupancyStatsValidator,
  popularLocationsValidator,
  trendsValidator,
  growthMetricsValidator,
  customerMetricsValidator,
  performanceMetricsValidator,
  peakHoursValidator,
  dayOfWeekValidator,
  forecastValidator,
} from '../validators/statistics.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Statistics endpoints
router.get(
  '/dashboard',
  validate(dashboardStatsValidator),
  statisticsController.getDashboardStats
);

router.get(
  '/revenue',
  validate(revenueStatsValidator),
  statisticsController.getRevenueStats
);

router.get(
  '/occupancy',
  validate(occupancyStatsValidator),
  statisticsController.getOccupancyStats
);

router.get(
  '/locations/popular',
  validate(popularLocationsValidator),
  statisticsController.getPopularLocations
);

router.get(
  '/trends',
  validate(trendsValidator),
  statisticsController.getReservationTrends
);

// Analytics endpoints
router.get(
  '/analytics/growth',
  validate(growthMetricsValidator),
  statisticsController.getGrowthMetrics
);

router.get(
  '/analytics/customers',
  validate(customerMetricsValidator),
  statisticsController.getCustomerMetrics
);

router.get(
  '/analytics/performance',
  validate(performanceMetricsValidator),
  statisticsController.getPerformanceMetrics
);

router.get(
  '/analytics/peak-hours',
  validate(peakHoursValidator),
  statisticsController.getPeakHours
);

router.get(
  '/analytics/day-of-week',
  validate(dayOfWeekValidator),
  statisticsController.getDayOfWeekAnalysis
);

router.get(
  '/analytics/forecast',
  validate(forecastValidator),
  statisticsController.getForecast
);

export default router;
