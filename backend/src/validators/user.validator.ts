import { body, param, query } from 'express-validator';
import { Role } from '../generated/prisma';

export const createUserValidator = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(Object.values(Role))
    .withMessage('Role must be either ADMIN or USER'),
];

export const updateUserValidator = [
  param('id')
    .isUUID()
    .withMessage('Valid user ID is required'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(Object.values(Role))
    .withMessage('Role must be either ADMIN or USER'),
];

export const getUserByIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Valid user ID is required'),
];

export const deleteUserValidator = [
  param('id')
    .isUUID()
    .withMessage('Valid user ID is required'),
];

export const getUserListValidator = [
  query('role')
    .optional()
    .isIn(Object.values(Role))
    .withMessage('Role must be either ADMIN or USER'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

export const getUserStatsValidator = [
  param('id')
    .isUUID()
    .withMessage('Valid user ID is required'),
];

export const bulkUpdateUsersValidator = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('User IDs array is required and must not be empty'),
  body('userIds.*')
    .isUUID()
    .withMessage('Each user ID must be a valid UUID'),
  body('role')
    .optional()
    .isIn(Object.values(Role))
    .withMessage('Role must be either ADMIN or USER'),
];
