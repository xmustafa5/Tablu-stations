import { Router } from 'express';
import * as viewerStatisticsController from '../controllers/viewerStatistics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/viewer-statistics/all:
 *   get:
 *     summary: Get viewer statistics for all locations
 *     tags: [Viewer Statistics]
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
 *         description: List of viewer statistics for all locations
 */
router.get('/all', viewerStatisticsController.getAllLocationsViewers);

/**
 * @swagger
 * /api/v1/viewer-statistics/location/{locationId}:
 *   get:
 *     summary: Get viewer statistics for a single location
 *     tags: [Viewer Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Viewer statistics for the location
 */
router.get('/location/:locationId', viewerStatisticsController.getLocationViewers);

/**
 * @swagger
 * /api/v1/viewer-statistics/location/{locationId}/date-range:
 *   get:
 *     summary: Get viewers for a specific date range for a location
 *     tags: [Viewer Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Viewer data for the specified date range
 */
router.get(
  '/location/:locationId/date-range',
  viewerStatisticsController.getViewersForDateRange
);

/**
 * @swagger
 * /api/v1/viewer-statistics/multiple-locations:
 *   post:
 *     summary: Get viewers for multiple locations in a date range
 *     tags: [Viewer Statistics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - locationIds
 *               - startDate
 *               - endDate
 *             properties:
 *               locationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Viewer data for multiple locations
 */
router.post('/multiple-locations', viewerStatisticsController.getMultipleLocationsViewers);

/**
 * @swagger
 * /api/v1/viewer-statistics/cost-per-view:
 *   post:
 *     summary: Calculate cost per view for multiple locations
 *     tags: [Viewer Statistics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - locationIds
 *               - totalCost
 *               - startDate
 *               - endDate
 *             properties:
 *               locationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               totalCost:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Cost per view calculation results
 */
router.post('/cost-per-view', viewerStatisticsController.calculateCostPerView);

/**
 * @swagger
 * /api/v1/viewer-statistics/best-plan:
 *   post:
 *     summary: Get best location plan based on cost optimization
 *     tags: [Viewer Statistics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totalCost
 *               - startDate
 *               - endDate
 *             properties:
 *               totalCost:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               maxLocations:
 *                 type: number
 *     responses:
 *       200:
 *         description: Best location plan recommendation
 */
router.post('/best-plan', viewerStatisticsController.getBestLocationPlan);

/**
 * @swagger
 * /api/v1/viewer-statistics/location/{locationId}/monthly-viewers:
 *   put:
 *     summary: Update monthly viewers for a location
 *     tags: [Viewer Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: locationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monthlyViewers
 *             properties:
 *               monthlyViewers:
 *                 type: number
 *     responses:
 *       200:
 *         description: Monthly viewers updated successfully
 */
router.put(
  '/location/:locationId/monthly-viewers',
  viewerStatisticsController.updateMonthlyViewers
);

export default router;
