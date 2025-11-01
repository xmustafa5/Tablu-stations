/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 *   - name: Reservations
 *     description: Reservation management
 *   - name: Status
 *     description: Reservation status management and conflicts
 *   - name: Statistics
 *     description: Dashboard statistics and analytics
 *   - name: Users
 *     description: User management (Admin only)
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Password123
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     description: Authenticate user and receive JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user
 *     description: Get authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Get all reservations
 *     description: Get paginated list of reservations with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           $ref: '#/components/schemas/ReservationStatus'
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by advertiser, customer, or location
 *     responses:
 *       200:
 *         description: Reservations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Create reservation
 *     description: Create a new reservation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - advertiserName
 *               - customerName
 *               - location
 *               - startTime
 *               - endTime
 *             properties:
 *               advertiserName:
 *                 type: string
 *                 minLength: 2
 *                 example: Acme Corp
 *               customerName:
 *                 type: string
 *                 minLength: 2
 *                 example: Jane Smith
 *               location:
 *                 type: string
 *                 minLength: 2
 *                 example: Station A - Platform 1
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-01T09:00:00.000Z
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-08T09:00:00.000Z
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/reservations/{id}:
 *   get:
 *     tags: [Reservations]
 *     summary: Get reservation by ID
 *     description: Get a single reservation by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/reservations/{id}:
 *   put:
 *     tags: [Reservations]
 *     summary: Update reservation
 *     description: Update an existing reservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               advertiserName:
 *                 type: string
 *                 example: Updated Corp
 *               customerName:
 *                 type: string
 *                 example: Updated Customer
 *               location:
 *                 type: string
 *                 example: Station B - Platform 2
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-02T09:00:00.000Z
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-09T09:00:00.000Z
 *     responses:
 *       200:
 *         description: Reservation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/reservations/{id}:
 *   delete:
 *     tags: [Reservations]
 *     summary: Delete reservation
 *     description: Delete a reservation by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Reservation deleted successfully
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/status/summary:
 *   get:
 *     tags: [Status]
 *     summary: Get status summary
 *     description: Get count of reservations by status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     WAITING:
 *                       type: integer
 *                       example: 10
 *                     ACTIVE:
 *                       type: integer
 *                       example: 25
 *                     ENDING_SOON:
 *                       type: integer
 *                       example: 5
 *                     COMPLETED:
 *                       type: integer
 *                       example: 100
 */

/**
 * @swagger
 * /api/v1/status/reservations/{id}/status:
 *   patch:
 *     tags: [Status]
 *     summary: Update reservation status
 *     description: Manually update a reservation's status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 $ref: '#/components/schemas/ReservationStatus'
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     oldStatus:
 *                       $ref: '#/components/schemas/ReservationStatus'
 *                     newStatus:
 *                       $ref: '#/components/schemas/ReservationStatus'
 *                     reservation:
 *                       $ref: '#/components/schemas/Reservation'
 */

/**
 * @swagger
 * /api/v1/status/reservations/{id}/complete:
 *   patch:
 *     tags: [Status]
 *     summary: Complete reservation
 *     description: Mark a reservation as completed
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     oldStatus:
 *                       $ref: '#/components/schemas/ReservationStatus'
 *                     newStatus:
 *                       type: string
 *                       example: COMPLETED
 *                     reservation:
 *                       $ref: '#/components/schemas/Reservation'
 */

/**
 * @swagger
 * /api/v1/status/auto-update:
 *   post:
 *     tags: [Status]
 *     summary: Auto-update reservation statuses
 *     description: Automatically update reservation statuses based on current time
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statuses updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     activatedCount:
 *                       type: integer
 *                       example: 5
 *                     endingSoonCount:
 *                       type: integer
 *                       example: 3
 */

/**
 * @swagger
 * /api/v1/status/conflicts/check:
 *   post:
 *     tags: [Status]
 *     summary: Check for conflicts
 *     description: Check if a reservation conflicts with existing reservations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *               - startTime
 *               - endTime
 *             properties:
 *               location:
 *                 type: string
 *                 example: Station A - Platform 1
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-01T09:00:00.000Z
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-12-08T09:00:00.000Z
 *               excludeReservationId:
 *                 type: string
 *                 format: uuid
 *                 example: 550e8400-e29b-41d4-a716-446655440001
 *     responses:
 *       200:
 *         description: Conflict check completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasConflicts:
 *                       type: boolean
 *                       example: true
 *                     conflictCount:
 *                       type: integer
 *                       example: 2
 *                     conflicts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Reservation'
 */

/**
 * @swagger
 * /api/v1/status/slots/available:
 *   get:
 *     tags: [Status]
 *     summary: Get available time slots
 *     description: Get available time slots for a location on a specific date
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: Location to check
 *         example: Station A
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *         example: 2025-12-01
 *       - in: query
 *         name: slotDuration
 *         schema:
 *           type: integer
 *           default: 60
 *         description: Duration of each slot in minutes
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     location:
 *                       type: string
 *                       example: Station A
 *                     date:
 *                       type: string
 *                       example: 2025-12-01
 *                     availableSlots:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           startTime:
 *                             type: string
 *                             format: date-time
 *                           endTime:
 *                             type: string
 *                             format: date-time
 *                           available:
 *                             type: boolean
 */

/**
 * @swagger
 * /api/v1/statistics/dashboard:
 *   get:
 *     tags: [Statistics]
 *     summary: Get dashboard statistics
 *     description: Get comprehensive dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalReservations:
 *                       type: integer
 *                       example: 150
 *                     activeReservations:
 *                       type: integer
 *                       example: 25
 *                     completedReservations:
 *                       type: integer
 *                       example: 100
 *                     pendingReservations:
 *                       type: integer
 *                       example: 25
 *                     totalRevenue:
 *                       type: number
 *                       example: 15000.00
 *                     averageDuration:
 *                       type: number
 *                       example: 7.5
 *                     occupancyRate:
 *                       type: number
 *                       example: 75.5
 */

/**
 * @swagger
 * /api/v1/statistics/revenue:
 *   get:
 *     tags: [Statistics]
 *     summary: Get revenue statistics
 *     description: Get revenue breakdown by status and location
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Revenue statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       example: 15000.00
 *                     revenueByStatus:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                     revenueByLocation:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           location:
 *                             type: string
 *                           revenue:
 *                             type: number
 *                           reservationCount:
 *                             type: integer
 */

/**
 * @swagger
 * /api/v1/statistics/analytics/growth:
 *   get:
 *     tags: [Statistics]
 *     summary: Get growth metrics
 *     description: Compare current period with previous period
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: currentStart
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: currentEnd
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: previousStart
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: previousEnd
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Growth metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentPeriodReservations:
 *                       type: integer
 *                       example: 150
 *                     previousPeriodReservations:
 *                       type: integer
 *                       example: 100
 *                     growthRate:
 *                       type: number
 *                       example: 50
 *                     growthPercentage:
 *                       type: number
 *                       example: 50.00
 */

/**
 * @swagger
 * /api/v1/statistics/analytics/customers:
 *   get:
 *     tags: [Statistics]
 *     summary: Get customer metrics
 *     description: Get customer analytics and top customers
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Customer metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCustomers:
 *                       type: integer
 *                       example: 50
 *                     newCustomers:
 *                       type: integer
 *                       example: 20
 *                     returningCustomers:
 *                       type: integer
 *                       example: 30
 *                     averageReservationsPerCustomer:
 *                       type: number
 *                       example: 3.0
 *                     topCustomers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           reservationCount:
 *                             type: integer
 *                           totalRevenue:
 *                             type: number
 */

/**
 * @swagger
 * /api/v1/statistics/analytics/peak-hours:
 *   get:
 *     tags: [Statistics]
 *     summary: Get peak hours analysis
 *     description: Analyze reservation patterns by hour of day
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Peak hours analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       hour:
 *                         type: integer
 *                         example: 9
 *                       reservationCount:
 *                         type: integer
 *                         example: 25
 *                       averageOccupancy:
 *                         type: number
 *                         example: 8.5
 */

/**
 * @swagger
 * /api/v1/statistics/analytics/forecast:
 *   get:
 *     tags: [Statistics]
 *     summary: Get forecast data
 *     description: Predict future reservations based on historical data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: historicalDays
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of historical days to analyze
 *       - in: query
 *         name: forecastDays
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days to forecast
 *     responses:
 *       200:
 *         description: Forecast data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       predictedReservations:
 *                         type: integer
 *                       confidence:
 *                         type: string
 *                         enum: [high, medium, low]
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     description: Get paginated list of users (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: role
 *         schema:
 *           $ref: '#/components/schemas/Role'
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags: [Users]
 *     summary: Create user (Admin only)
 *     description: Create a new user account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *               role:
 *                 $ref: '#/components/schemas/Role'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Only admins can create users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     description: Get detailed user information including reservations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       properties:
 *                         reservations:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     description: Update user information (users can update themselves, admins can update anyone)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               role:
 *                 $ref: '#/components/schemas/Role'
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (Admin only)
 *     description: Delete a user account (admins cannot delete themselves)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       400:
 *         description: Cannot delete own account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Only admins can delete users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/users/{id}/stats:
 *   get:
 *     tags: [Users]
 *     summary: Get user statistics
 *     description: Get reservation statistics for a user (users can view own stats, admins can view anyone's)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                         role:
 *                           $ref: '#/components/schemas/Role'
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                     reservations:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         byStatus:
 *                           type: object
 *                           additionalProperties:
 *                             type: integer
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/users/bulk:
 *   patch:
 *     tags: [Users]
 *     summary: Bulk update users (Admin only)
 *     description: Update multiple users at once
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               role:
 *                 $ref: '#/components/schemas/Role'
 *     responses:
 *       200:
 *         description: Users updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCount:
 *                       type: integer
 *                       example: 5
 *                     message:
 *                       type: string
 *                       example: 5 user(s) updated successfully
 *       403:
 *         description: Only admins can perform bulk updates
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

export {};
