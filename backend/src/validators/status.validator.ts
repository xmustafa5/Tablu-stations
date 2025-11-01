import { body, param, query, ValidationChain } from 'express-validator';
import { ReservationStatus } from '../generated/prisma';

export const transitionStatusValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid reservation ID'),
  body('status')
    .isIn(Object.values(ReservationStatus))
    .withMessage('Invalid status value'),
];

export const checkConflictsValidator: ValidationChain[] = [
  body('location')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),
  body('excludeReservationId')
    .optional()
    .isUUID()
    .withMessage('Invalid reservation ID'),
];

export const getAvailableSlotsValidator: ValidationChain[] = [
  query('location')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  query('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  query('slotDuration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Slot duration must be between 15 and 480 minutes'),
];

export const getLocationStatsValidator: ValidationChain[] = [
  query('location')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  query('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query && new Date(value) <= new Date(req.query.startDate as string)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
];
