import { Router } from 'express';
import locationController from '../controllers/location.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createLocationValidator,
  updateLocationValidator,
  locationIdValidator,
  locationStatisticsValidator,
  getAllLocationsValidator,
} from '../validators/location.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/locations:
 *   get:
 *     summary: Get all locations
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Include inactive locations
 *     responses:
 *       200:
 *         description: List of locations
 */
router.get(
  '/',
  validate(getAllLocationsValidator),
  locationController.getAllLocations
);

/**
 * @swagger
 * /api/v1/locations/{id}:
 *   get:
 *     summary: Get location by ID
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Location details
 *       404:
 *         description: Location not found
 */
router.get(
  '/:id',
  validate(locationIdValidator),
  locationController.getLocationById
);

/**
 * @swagger
 * /api/v1/locations/{id}/statistics:
 *   get:
 *     summary: Get location statistics
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Location statistics
 */
router.get(
  '/:id/statistics',
  validate(locationStatisticsValidator),
  locationController.getLocationStatistics
);

/**
 * @swagger
 * /api/v1/locations:
 *   post:
 *     summary: Create a new location (Admin only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Location created successfully
 */
router.post(
  '/',
  authorize(['ADMIN']),
  validate(createLocationValidator),
  locationController.createLocation
);

/**
 * @swagger
 * /api/v1/locations/{id}:
 *   put:
 *     summary: Update a location (Admin only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Location updated successfully
 */
router.put(
  '/:id',
  authorize(['ADMIN']),
  validate(updateLocationValidator),
  locationController.updateLocation
);

/**
 * @swagger
 * /api/v1/locations/{id}:
 *   delete:
 *     summary: Delete/deactivate a location (Admin only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: hard
 *         schema:
 *           type: boolean
 *         description: Hard delete (only if no reservations exist)
 *     responses:
 *       200:
 *         description: Location deleted/deactivated successfully
 */
router.delete(
  '/:id',
  authorize(['ADMIN']),
  validate(locationIdValidator),
  locationController.deleteLocation
);

export default router;
