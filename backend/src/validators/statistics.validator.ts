import { query, ValidationChain } from 'express-validator';

export const dashboardStatsValidator: ValidationChain[] = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && req.query.startDate && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

export const revenueStatsValidator: ValidationChain[] = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && req.query.startDate && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

export const occupancyStatsValidator: ValidationChain[] = [
  query('startDate')
    .isISO8601()
    .withMessage('Start date is required and must be a valid ISO 8601 date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date is required and must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

export const popularLocationsValidator: ValidationChain[] = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const trendsValidator: ValidationChain[] = [
  query('startDate')
    .isISO8601()
    .withMessage('Start date is required and must be a valid ISO 8601 date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date is required and must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  query('interval')
    .isIn(['day', 'week', 'month'])
    .withMessage('Interval must be day, week, or month'),
];

export const growthMetricsValidator: ValidationChain[] = [
  query('currentStart')
    .isISO8601()
    .withMessage('Current start date is required and must be a valid ISO 8601 date'),
  query('currentEnd')
    .isISO8601()
    .withMessage('Current end date is required and must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && new Date(value) <= new Date(req.query.currentStart as string)) {
        throw new Error('Current end date must be after current start date');
      }
      return true;
    }),
  query('previousStart')
    .isISO8601()
    .withMessage('Previous start date is required and must be a valid ISO 8601 date'),
  query('previousEnd')
    .isISO8601()
    .withMessage('Previous end date is required and must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && new Date(value) <= new Date(req.query.previousStart as string)) {
        throw new Error('Previous end date must be after previous start date');
      }
      return true;
    }),
];

export const customerMetricsValidator: ValidationChain[] = [
  query('startDate')
    .isISO8601()
    .withMessage('Start date is required and must be a valid ISO 8601 date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date is required and must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

export const performanceMetricsValidator: ValidationChain[] = [
  query('startDate')
    .isISO8601()
    .withMessage('Start date is required and must be a valid ISO 8601 date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date is required and must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

export const peakHoursValidator: ValidationChain[] = [
  query('startDate')
    .isISO8601()
    .withMessage('Start date is required and must be a valid ISO 8601 date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date is required and must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

export const dayOfWeekValidator: ValidationChain[] = [
  query('startDate')
    .isISO8601()
    .withMessage('Start date is required and must be a valid ISO 8601 date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date is required and must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];

export const forecastValidator: ValidationChain[] = [
  query('historicalDays')
    .optional()
    .isInt({ min: 7, max: 365 })
    .withMessage('Historical days must be between 7 and 365'),
  query('forecastDays')
    .optional()
    .isInt({ min: 1, max: 90 })
    .withMessage('Forecast days must be between 1 and 90'),
];
