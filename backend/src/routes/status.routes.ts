import { Router } from 'express';
import statusController from '../controllers/status.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  transitionStatusValidator,
  checkConflictsValidator,
  getAvailableSlotsValidator,
  getLocationStatsValidator,
} from '../validators/status.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Status transition endpoints
router.patch(
  '/reservations/:id/status',
  validate(transitionStatusValidator),
  statusController.transitionStatus
);

router.patch(
  '/reservations/:id/complete',
  statusController.completeReservation
);

// Status summary
router.get(
  '/summary',
  statusController.getStatusSummary
);

// Automatic status updates (typically called by cron job)
router.post(
  '/auto-update',
  statusController.updateStatusesAutomatically
);

// Conflict checking endpoints
router.post(
  '/conflicts/check',
  validate(checkConflictsValidator),
  statusController.checkConflicts
);

router.get(
  '/slots/available',
  validate(getAvailableSlotsValidator),
  statusController.getAvailableSlots
);

router.get(
  '/locations/stats',
  validate(getLocationStatsValidator),
  statusController.getLocationStats
);

export default router;
