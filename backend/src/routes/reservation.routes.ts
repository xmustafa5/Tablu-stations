import { Router } from 'express';
import reservationController from '../controllers/reservation.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createReservationValidator,
  updateReservationValidator,
  getReservationsValidator,
  getCalendarValidator,
} from '../validators/reservation.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get calendar reservations
router.get(
  '/calendar',
  validate(getCalendarValidator),
  reservationController.getCalendarReservations
);

// Get all reservations with filtering
router.get(
  '/',
  validate(getReservationsValidator),
  reservationController.getReservations
);

// Get single reservation by ID
router.get('/:id', reservationController.getReservationById);

// Create new reservation
router.post(
  '/',
  validate(createReservationValidator),
  reservationController.createReservation
);

// Update reservation
router.put(
  '/:id',
  validate(updateReservationValidator),
  reservationController.updateReservation
);

// Delete reservation
router.delete('/:id', reservationController.deleteReservation);

export default router;
