import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createUserValidator,
  updateUserValidator,
  getUserByIdValidator,
  deleteUserValidator,
  getUserListValidator,
  getUserStatsValidator,
  bulkUpdateUsersValidator,
} from '../validators/user.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User management routes

// Bulk operations must come before :id routes
router.patch(
  '/bulk',
  validate(bulkUpdateUsersValidator),
  userController.bulkUpdateUsers
);

router.get(
  '/',
  validate(getUserListValidator),
  userController.getAllUsers
);

router.post(
  '/',
  validate(createUserValidator),
  userController.createUser
);

router.get(
  '/:id/stats',
  validate(getUserStatsValidator),
  userController.getUserStats
);

router.get(
  '/:id',
  validate(getUserByIdValidator),
  userController.getUserById
);

router.put(
  '/:id',
  validate(updateUserValidator),
  userController.updateUser
);

router.delete(
  '/:id',
  validate(deleteUserValidator),
  userController.deleteUser
);

export default router;
