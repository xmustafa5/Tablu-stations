import { body, query, ValidationChain } from 'express-validator';
import { ReservationStatus } from '../generated/prisma';

export const createReservationValidator: ValidationChain[] = [
  body('advertiserName')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Advertiser name must be between 2 and 200 characters'),
  body('customerName')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Customer name must be between 2 and 200 characters'),
  body('location')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Location must be between 5 and 500 characters'),
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      const startTime = new Date(req.body.startTime);
      const endTime = new Date(value);
      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('status')
    .optional()
    .isIn(Object.values(ReservationStatus))
    .withMessage('Invalid status value'),
];

export const updateReservationValidator: ValidationChain[] = [
  body('advertiserName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Advertiser name must be between 2 and 200 characters'),
  body('customerName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Customer name must be between 2 and 200 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Location must be between 5 and 500 characters'),
  body('startTime')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date'),
  body('status')
    .optional()
    .isIn(Object.values(ReservationStatus))
    .withMessage('Invalid status value'),
];

export const getReservationsValidator: ValidationChain[] = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('status')
    .optional()
    .isIn(Object.values(ReservationStatus))
    .withMessage('Invalid status value'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Limit must be between 1 and 500'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'startTime', 'endTime', 'advertiserName', 'customerName'])
    .withMessage('Invalid sortBy field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

export const getCalendarValidator: ValidationChain[] = [
  query('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  query('year')
    .isInt({ min: 2000, max: 2100 })
    .withMessage('Year must be between 2000 and 2100'),
];
