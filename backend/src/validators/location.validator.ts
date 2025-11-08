import { body, param, query, ValidationChain } from 'express-validator';

export const createLocationValidator: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Location name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Location name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const updateLocationValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid location ID format'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Location name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const locationIdValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid location ID format'),
];

export const locationStatisticsValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('Invalid location ID format'),
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

export const getAllLocationsValidator: ValidationChain[] = [
  query('includeInactive')
    .optional()
    .isBoolean()
    .withMessage('includeInactive must be a boolean'),
];
