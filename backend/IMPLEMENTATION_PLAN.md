# Backend Implementation Plan - Tablu Station Reservation System

## Table of Contents
1. [Frontend Analysis](#frontend-analysis)
2. [Backend Architecture Overview](#backend-architecture-overview)
3. [Database Schema](#database-schema)
4. [Authentication System](#authentication-system)
5. [Middleware Implementation](#middleware-implementation)
6. [API Endpoints](#api-endpoints)
7. [Project Structure](#project-structure)
8. [Implementation Steps](#implementation-steps)

---

## Frontend Analysis

### Current Frontend Features
The frontend is a Next.js application for managing bus station billboard reservations with the following pages:

1. **Calendar View** ([page.tsx](../frontend/app/page.tsx))
   - Main landing page with calendar visualization
   - Arabic RTL interface
   - Navigation to list view

2. **List View** ([list/page.tsx](../frontend/app/list/page.tsx))
   - Full reservation management (CRUD operations)
   - Search functionality by advertiser, customer, or location
   - Status filtering (waiting, active, ending_soon, completed, expired)
   - Client-side state management

### Reservation Data Model (Frontend)
```typescript
interface Reservation {
  id: string;
  advertiserName: string;
  customerName: string;
  location: string;
  startTime: string;        // ISO datetime format
  endTime: string;          // ISO datetime format
  status: "waiting" | "active" | "ending_soon" | "completed" ;
}
```

### Missing Features (Required for Backend)
- **Authentication**: No login/auth system exists
- **Data Persistence**: Currently using local state
- **API Integration**: No backend calls implemented

---

## Backend Architecture Overview

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5
- **Database ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, bcrypt, express-rate-limit, CORS
- **Logging**: Morgan
- **Performance**: Compression

### Core Features to Implement
1. RESTful API for reservations
2. JWT-based authentication system
3. Role-based access control (Admin, User)
4. Protected routes middleware
5. Input validation and sanitization
6. Error handling
7. Request logging

---

## Database Schema

### Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // or "mysql" or "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // hashed with bcrypt
  name      String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  reservations Reservation[]

  @@map("users")
}

enum Role {
  ADMIN
  USER
}

model Reservation {
  id             String            @id @default(uuid())
  advertiserName String
  customerName   String
  location       String
  startTime      DateTime
  endTime        DateTime
  status         ReservationStatus @default(WAITING)
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  userId         String
  user           User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@index([startTime, endTime])
  @@map("reservations")
}

enum ReservationStatus {
  WAITING
  ACTIVE
  ENDING_SOON
  COMPLETED
}
```

---

## Authentication System

### Login Page Structure
Create a login page in the frontend at `frontend/app/(auth)/login/page.tsx`:

```typescript
// Route group (auth) for authentication pages
// Structure: frontend/app/(auth)/login/page.tsx

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
```

### JWT Authentication Flow

1. **User Login**:
   - User submits email/password
   - Backend validates credentials
   - Returns JWT token + user data

2. **Token Storage**:
   - Store JWT in httpOnly cookie (recommended) or localStorage
   - Include token in Authorization header for API calls

3. **Token Verification**:
   - Middleware validates token on protected routes
   - Decode token to get user information
   - Check token expiration

4. **Token Refresh**:
   - Implement refresh token mechanism
   - Access token: 15 minutes expiry
   - Refresh token: 7 days expiry

---

## Middleware Implementation

### 1. Authentication Middleware (`src/middleware/auth.middleware.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
```

### 2. Authorization Middleware (`src/middleware/authorize.middleware.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};
```

### 3. Validation Middleware (`src/middleware/validate.middleware.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    next();
  };
};
```

### 4. Error Handler Middleware (`src/middleware/errorHandler.middleware.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
```

---

## API Endpoints

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication Endpoints

#### 1. Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}

Response (201 Created):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

Error Response (400):
{
  "success": false,
  "message": "Email already exists"
}
```

#### 2. Login
```http
POST /api/v1/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  }
}

Error Response (401):
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### 3. Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "refresh_token_here"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "token": "new_access_token"
  }
}
```

#### 4. Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2025-10-15T09:00:00.000Z"
  }
}
```

#### 5. Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Reservation Endpoints

#### 1. Get All Reservations
```http
GET /api/v1/reservations
Authorization: Bearer {token}

Query Parameters:
- search: string (optional) - Search by advertiser, customer, or location
- status: string (optional) - Filter by status (waiting|active|ending_soon|completed|expired)
- page: number (default: 1)
- limit: number (default: 20)
- sortBy: string (default: "createdAt")
- sortOrder: string (default: "desc")

Response (200 OK):
{
  "success": true,
  "data": {
    "reservations": [
      {
        "id": "uuid",
        "advertiserName": "شركة الحلول التقنية",
        "customerName": "أحمد محمد",
        "location": "شارع الرئيسي - وسط المدينة",
        "startTime": "2025-10-15T09:00:00.000Z",
        "endTime": "2025-10-22T17:00:00.000Z",
        "status": "waiting",
        "createdAt": "2025-10-10T08:00:00.000Z",
        "updatedAt": "2025-10-10T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### 2. Get Single Reservation
```http
GET /api/v1/reservations/:id
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "data": {
    "id": "uuid",
    "advertiserName": "شركة الحلول التقنية",
    "customerName": "أحمد محمد",
    "location": "شارع الرئيسي - وسط المدينة",
    "startTime": "2025-10-15T09:00:00.000Z",
    "endTime": "2025-10-22T17:00:00.000Z",
    "status": "waiting",
    "createdAt": "2025-10-10T08:00:00.000Z",
    "updatedAt": "2025-10-10T08:00:00.000Z"
  }
}

Error Response (404):
{
  "success": false,
  "message": "Reservation not found"
}
```

#### 3. Create Reservation
```http
POST /api/v1/reservations
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "advertiserName": "شركة الحلول التقنية",
  "customerName": "أحمد محمد",
  "location": "شارع الرئيسي - وسط المدينة",
  "startTime": "2025-10-15T09:00:00.000Z",
  "endTime": "2025-10-22T17:00:00.000Z",
  "status": "waiting"
}

Validation Rules:
- advertiserName: required, string, 2-200 chars
- customerName: required, string, 2-200 chars
- location: required, string, 5-500 chars
- startTime: required, valid ISO datetime, must be in future
- endTime: required, valid ISO datetime, must be after startTime
- status: optional, enum (waiting|active|ending_soon|completed|expired)

Response (201 Created):
{
  "success": true,
  "message": "Reservation created successfully",
  "data": {
    "id": "uuid",
    "advertiserName": "شركة الحلول التقنية",
    "customerName": "أحمد محمد",
    "location": "شارع الرئيسي - وسط المدينة",
    "startTime": "2025-10-15T09:00:00.000Z",
    "endTime": "2025-10-22T17:00:00.000Z",
    "status": "waiting",
    "createdAt": "2025-10-10T08:00:00.000Z",
    "updatedAt": "2025-10-10T08:00:00.000Z"
  }
}

Error Response (400):
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "endTime",
      "message": "End time must be after start time"
    }
  ]
}
```

#### 4. Update Reservation
```http
PUT /api/v1/reservations/:id
Authorization: Bearer {token}
Content-Type: application/json

Request Body (all fields optional):
{
  "advertiserName": "شركة الحلول التقنية المحدثة",
  "customerName": "أحمد محمد",
  "location": "شارع الرئيسي - وسط المدينة",
  "startTime": "2025-10-15T09:00:00.000Z",
  "endTime": "2025-10-22T17:00:00.000Z",
  "status": "active"
}

Response (200 OK):
{
  "success": true,
  "message": "Reservation updated successfully",
  "data": {
    "id": "uuid",
    "advertiserName": "شركة الحلول التقنية المحدثة",
    // ... other fields
  }
}
```

#### 5. Delete Reservation
```http
DELETE /api/v1/reservations/:id
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "message": "Reservation deleted successfully"
}

Error Response (404):
{
  "success": false,
  "message": "Reservation not found"
}

Error Response (403):
{
  "success": false,
  "message": "You don't have permission to delete this reservation"
}
```

#### 6. Get Calendar Data
```http
GET /api/v1/reservations/calendar
Authorization: Bearer {token}

Query Parameters:
- month: number (1-12) - Month to fetch
- year: number - Year to fetch

Response (200 OK):
{
  "success": true,
  "data": {
    "month": 10,
    "year": 2025,
    "reservations": [
      {
        "id": "uuid",
        "advertiserName": "شركة الحلول التقنية",
        "startTime": "2025-10-15T09:00:00.000Z",
        "endTime": "2025-10-22T17:00:00.000Z",
        "status": "waiting"
      }
    ]
  }
}
```

#### 7. Bulk Status Update (Admin Only)
```http
PATCH /api/v1/reservations/bulk-status
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "reservationIds": ["uuid1", "uuid2", "uuid3"],
  "status": "completed"
}

Response (200 OK):
{
  "success": true,
  "message": "3 reservations updated successfully",
  "data": {
    "updated": 3
  }
}
```

---

### Statistics Endpoints (Optional)

#### Get Dashboard Stats
```http
GET /api/v1/stats/dashboard
Authorization: Bearer {token}

Response (200 OK):
{
  "success": true,
  "data": {
    "totalReservations": 150,
    "activeReservations": 45,
    "endingSoon": 12,
    "completed": 80,
    "byStatus": {
      "waiting": 13,
      "active": 45,
      "ending_soon": 12,
      "completed": 80,
      "expired": 0
    },
    "recentReservations": []
  }
}
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts         # Prisma client configuration
│   │   └── env.ts              # Environment variables validation
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   ├── authorize.middleware.ts # Role-based authorization
│   │   ├── validate.middleware.ts  # Request validation
│   │   └── errorHandler.middleware.ts # Global error handler
│   │
│   ├── routes/
│   │   ├── index.ts                # Main router
│   │   ├── auth.routes.ts          # Authentication routes
│   │   ├── reservation.routes.ts   # Reservation CRUD routes
│   │   └── stats.routes.ts         # Statistics routes
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts      # Authentication logic
│   │   ├── reservation.controller.ts # Reservation CRUD logic
│   │   └── stats.controller.ts     # Statistics logic
│   │
│   ├── services/
│   │   ├── auth.service.ts         # Auth business logic
│   │   ├── reservation.service.ts  # Reservation business logic
│   │   ├── token.service.ts        # JWT token management
│   │   └── status.service.ts       # Auto-update reservation status
│   │
│   ├── validators/
│   │   ├── auth.validator.ts       # Auth request validation
│   │   └── reservation.validator.ts # Reservation validation
│   │
│   ├── types/
│   │   ├── express.d.ts            # Express type extensions
│   │   └── index.ts                # Shared types
│   │
│   ├── utils/
│   │   ├── logger.ts               # Custom logger
│   │   ├── responseHandler.ts      # Standardized API responses
│   │   └── errors.ts               # Custom error classes
│   │
│   ├── app.ts                      # Express app setup
│   └── server.ts                   # Server entry point
│
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Database seeding
│
├── .env.example                    # Environment variables template
├── .env                            # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Implementation Steps

### Phase 1: Project Setup
1. ✅ Initialize project structure
2. ✅ Install dependencies
3. Create environment configuration
4. Setup TypeScript configuration
5. Initialize Prisma

### Phase 2: Database Setup
1. Define Prisma schema
2. Create initial migration
3. Setup database connection
4. Create seed data

### Phase 3: Core Infrastructure
1. Setup Express app with middleware
   - Helmet (security headers)
   - CORS
   - Compression
   - Morgan (logging)
   - Rate limiting
2. Create error handling middleware
3. Setup validation middleware
4. Create response utilities

### Phase 4: Authentication System
1. Create User model
2. Implement password hashing (bcrypt)
3. Create JWT token service
4. Build authentication middleware
5. Build authorization middleware
6. Create auth routes and controllers
   - Register
   - Login
   - Refresh token
   - Logout
   - Get current user

### Phase 5: Reservation CRUD
1. Create Reservation model
2. Build reservation service
3. Create reservation validators
4. Build reservation routes and controllers
   - List with filters and pagination
   - Get by ID
   - Create
   - Update
   - Delete
   - Calendar view

### Phase 6: Additional Features
1. Auto-update reservation status (cron job)
2. Statistics endpoints
3. Bulk operations
4. Search functionality

### Phase 7: Frontend Integration
1. Create login page in `(auth)` route group
2. Create Next.js middleware for auth
3. Implement API client service
4. Update reservation components to use API
5. Add auth context provider
6. Protect routes

### Phase 8: Testing & Deployment
1. API testing (Postman/Thunder Client)
2. Integration testing
3. Setup environment variables
4. Deploy database
5. Deploy backend
6. Deploy frontend

---

## Environment Variables

Create `.env` file:

```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tablu_stations"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"
JWT_REFRESH_EXPIRES_IN="7d"

# CORS
FRONTEND_URL="http://localhost:3000"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Frontend Middleware Implementation

Create `frontend/middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Redirect to login if not authenticated and trying to access protected route
  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to home if authenticated and trying to access auth routes
  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## Security Considerations

1. **Password Security**
   - Use bcrypt with salt rounds >= 10
   - Enforce strong password policy

2. **JWT Security**
   - Use strong secret keys (min 32 characters)
   - Short expiration times for access tokens
   - Implement refresh token rotation
   - Store tokens in httpOnly cookies

3. **API Security**
   - Rate limiting on all endpoints
   - Input validation and sanitization
   - SQL injection protection (Prisma handles this)
   - XSS protection (Helmet)
   - CSRF protection for cookie-based auth

4. **Authorization**
   - Role-based access control
   - Resource ownership verification
   - Least privilege principle

5. **Data Protection**
   - Use HTTPS in production
   - Sanitize error messages (no sensitive data)
   - Implement request logging
   - Regular security audits

---

## API Response Format

All API responses follow this structure:

```typescript
// Success Response
{
  success: true,
  message?: string,
  data: any
}

// Error Response
{
  success: false,
  message: string,
  errors?: Array<{
    field: string,
    message: string
  }>
}

// Paginated Response
{
  success: true,
  data: {
    items: any[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    }
  }
}
```

---

## Next Steps

1. Start with Phase 1: Initialize the project structure
2. Setup Prisma and create database schema
3. Implement authentication system
4. Build reservation CRUD operations
5. Create frontend login page and middleware
6. Integrate frontend with backend API
7. Test all endpoints
8. Deploy

---

## Notes

- All Arabic text is properly handled with RTL support
- Date/time fields use ISO 8601 format
- Status is automatically calculated based on current date vs start/end times
- Soft delete can be implemented by adding `deletedAt` field
- Add indexes for performance on frequently queried fields
- Consider implementing WebSocket for real-time updates
- Implement file upload for billboard images (optional enhancement)

---

**Generated for Tablu Station Reservation System**
**Date: 2025-11-01**
