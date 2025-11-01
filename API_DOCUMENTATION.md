# Tablu Stations API Documentation

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://api.tablu.com`

## API Documentation UI
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/api-docs.json`

## Table of Contents
1. [Authentication](#authentication)
2. [Enums](#enums)
3. [Data Models](#data-models)
4. [API Endpoints](#api-endpoints)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Authentication

All API endpoints (except `/auth/register` and `/auth/login`) require authentication using JWT Bearer tokens.

### Headers
```
Authorization: Bearer <your_jwt_token>
```

### Token Structure
```typescript
{
  userId: string;      // UUID
  email: string;
  role?: 'USER' | 'ADMIN';
  iat: number;         // Issued at timestamp
  exp: number;         // Expiration timestamp
}
```

---

## Enums

### ReservationStatus
```typescript
enum ReservationStatus {
  WAITING = 'WAITING',           // Start time is in the future
  ACTIVE = 'ACTIVE',            // Current time is between start and end
  ENDING_SOON = 'ENDING_SOON',  // Less than 48 hours until end time
  COMPLETED = 'COMPLETED'        // End time has passed
}
```

### Role
```typescript
enum Role {
  USER = 'USER',     // Regular user with access to own reservations
  ADMIN = 'ADMIN'    // Administrator with full access
}
```

---

## Data Models

### User
```typescript
interface User {
  id: string;              // UUID
  email: string;
  name: string;
  role: Role;              // 'USER' | 'ADMIN'
  createdAt: string;       // ISO 8601 date-time
  updatedAt: string;       // ISO 8601 date-time
}
```

### Reservation
```typescript
interface Reservation {
  id: string;              // UUID
  advertiserName: string;
  customerName: string;
  location: string;
  startTime: string;       // ISO 8601 date-time
  endTime: string;         // ISO 8601 date-time
  status: ReservationStatus;
  userId: string;          // UUID
  createdAt: string;       // ISO 8601 date-time
  updatedAt: string;       // ISO 8601 date-time
}
```

### Pagination
```typescript
interface Pagination {
  total: number;           // Total number of items
  page: number;            // Current page number
  limit: number;           // Items per page
  totalPages: number;      // Total number of pages
}
```

### API Response
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: Pagination;
}

interface ValidationError {
  field: string;
  message: string;
}
```

---

## API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe"
}
```

**Validation Rules:**
- Email: Valid email format
- Password: Minimum 8 characters, must contain uppercase, lowercase, and number
- Name: 2-100 characters

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### Reservations

#### Get All Reservations
```http
GET /api/v1/reservations?page=1&limit=10&status=ACTIVE&search=station
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (WAITING, ACTIVE, ENDING_SOON, COMPLETED)
- `search` (optional): Search by advertiser, customer, or location

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "advertiserName": "Acme Corp",
      "customerName": "Jane Smith",
      "location": "Station A - Platform 1",
      "startTime": "2025-12-01T09:00:00.000Z",
      "endTime": "2025-12-08T09:00:00.000Z",
      "status": "ACTIVE",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### Create Reservation
```http
POST /api/v1/reservations
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "advertiserName": "Acme Corp",
  "customerName": "Jane Smith",
  "location": "Station A - Platform 1",
  "startTime": "2025-12-01T09:00:00.000Z",
  "endTime": "2025-12-08T09:00:00.000Z"
}
```

**Validation Rules:**
- advertiserName: 2-100 characters
- customerName: 2-100 characters
- location: 2-200 characters
- startTime: Valid ISO 8601 date-time, must be in future
- endTime: Valid ISO 8601 date-time, must be after startTime

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "advertiserName": "Acme Corp",
    "customerName": "Jane Smith",
    "location": "Station A - Platform 1",
    "startTime": "2025-12-01T09:00:00.000Z",
    "endTime": "2025-12-08T09:00:00.000Z",
    "status": "WAITING",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Get Reservation by ID
```http
GET /api/v1/reservations/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "advertiserName": "Acme Corp",
    "customerName": "Jane Smith",
    "location": "Station A - Platform 1",
    "startTime": "2025-12-01T09:00:00.000Z",
    "endTime": "2025-12-08T09:00:00.000Z",
    "status": "ACTIVE",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Update Reservation
```http
PUT /api/v1/reservations/:id
Authorization: Bearer <token>
```

**Request Body:** (All fields optional)
```json
{
  "advertiserName": "Updated Corp",
  "customerName": "John Doe",
  "location": "Station B - Platform 2",
  "startTime": "2025-12-02T09:00:00.000Z",
  "endTime": "2025-12-09T09:00:00.000Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "advertiserName": "Updated Corp",
    "customerName": "John Doe",
    "location": "Station B - Platform 2",
    "startTime": "2025-12-02T09:00:00.000Z",
    "endTime": "2025-12-09T09:00:00.000Z",
    "status": "WAITING",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  }
}
```

#### Delete Reservation
```http
DELETE /api/v1/reservations/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Reservation deleted successfully"
}
```

---

### Status Management

#### Update Reservation Status
```http
PATCH /api/v1/status/reservations/:id/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "ACTIVE"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "oldStatus": "WAITING",
    "newStatus": "ACTIVE",
    "reservation": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "status": "ACTIVE",
      "updatedAt": "2025-01-02T00:00:00.000Z"
    }
  }
}
```

#### Complete Reservation
```http
PATCH /api/v1/status/reservations/:id/complete
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "oldStatus": "ACTIVE",
    "newStatus": "COMPLETED",
    "reservation": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "status": "COMPLETED",
      "updatedAt": "2025-01-02T00:00:00.000Z"
    }
  }
}
```

#### Get Status Summary
```http
GET /api/v1/status/summary
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "WAITING": 10,
    "ACTIVE": 25,
    "ENDING_SOON": 5,
    "COMPLETED": 100
  }
}
```

#### Auto-Update Statuses
```http
POST /api/v1/status/auto-update
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "activatedCount": 5,
    "endingSoonCount": 3
  }
}
```

#### Check Conflicts
```http
POST /api/v1/status/conflicts/check
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "location": "Station A - Platform 1",
  "startTime": "2025-12-01T09:00:00.000Z",
  "endTime": "2025-12-08T09:00:00.000Z",
  "excludeReservationId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hasConflicts": true,
    "conflictCount": 2,
    "conflicts": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "advertiserName": "Company B",
        "customerName": "Customer B",
        "location": "Station A - Platform 1",
        "startTime": "2025-12-01T10:00:00.000Z",
        "endTime": "2025-12-01T12:00:00.000Z",
        "status": "ACTIVE"
      }
    ]
  }
}
```

#### Get Available Slots
```http
GET /api/v1/status/slots/available?location=Station A&date=2025-12-01&slotDuration=60
Authorization: Bearer <token>
```

**Query Parameters:**
- `location` (required): Location to check
- `date` (required): Date in YYYY-MM-DD format
- `slotDuration` (optional): Duration in minutes (default: 60)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "location": "Station A",
    "date": "2025-12-01",
    "availableSlots": [
      {
        "startTime": "2025-12-01T09:00:00.000Z",
        "endTime": "2025-12-01T10:00:00.000Z",
        "available": true
      },
      {
        "startTime": "2025-12-01T10:00:00.000Z",
        "endTime": "2025-12-01T11:00:00.000Z",
        "available": false
      }
    ]
  }
}
```

---

### Statistics & Analytics

#### Get Dashboard Statistics
```http
GET /api/v1/statistics/dashboard?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalReservations": 150,
    "activeReservations": 25,
    "completedReservations": 100,
    "pendingReservations": 25,
    "totalRevenue": 15000.00,
    "averageDuration": 7.5,
    "occupancyRate": 75.5
  }
}
```

#### Get Revenue Statistics
```http
GET /api/v1/statistics/revenue?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 15000.00,
    "revenueByStatus": {
      "COMPLETED": 10000.00,
      "ACTIVE": 5000.00
    },
    "revenueByLocation": [
      {
        "location": "Station A",
        "revenue": 8000.00,
        "reservationCount": 50
      }
    ]
  }
}
```

#### Get Growth Metrics
```http
GET /api/v1/statistics/analytics/growth?currentStart=2025-02-01&currentEnd=2025-02-28&previousStart=2025-01-01&previousEnd=2025-01-31
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "currentPeriodReservations": 150,
    "previousPeriodReservations": 100,
    "growthRate": 50,
    "growthPercentage": 50.00
  }
}
```

#### Get Customer Metrics
```http
GET /api/v1/statistics/analytics/customers?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 50,
    "newCustomers": 20,
    "returningCustomers": 30,
    "averageReservationsPerCustomer": 3.0,
    "topCustomers": [
      {
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "reservationCount": 10,
        "totalRevenue": 5000.00
      }
    ]
  }
}
```

#### Get Peak Hours Analysis
```http
GET /api/v1/statistics/analytics/peak-hours?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "hour": 9,
      "reservationCount": 25,
      "averageOccupancy": 8.5
    },
    {
      "hour": 14,
      "reservationCount": 20,
      "averageOccupancy": 6.0
    }
  ]
}
```

#### Get Forecast
```http
GET /api/v1/statistics/analytics/forecast?historicalDays=30&forecastDays=7
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-02-01",
      "predictedReservations": 15,
      "confidence": "high"
    },
    {
      "date": "2025-02-02",
      "predictedReservations": 12,
      "confidence": "medium"
    }
  ]
}
```

---

### User Management (Admin Only)

#### Get All Users
```http
GET /api/v1/users?page=1&limit=10&role=USER&search=john
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Create User (Admin Only)
```http
POST /api/v1/users
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "Password123",
  "name": "New User",
  "role": "USER"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "USER",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "User created successfully"
}
```

#### Get User by ID
```http
GET /api/v1/users/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "reservations": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "advertiserName": "Acme Corp",
        "customerName": "Jane Smith",
        "location": "Station A - Platform 1",
        "startTime": "2025-12-01T09:00:00.000Z",
        "endTime": "2025-12-08T09:00:00.000Z",
        "status": "ACTIVE"
      }
    ]
  }
}
```

#### Update User
```http
PUT /api/v1/users/:id
Authorization: Bearer <token>
```

**Request Body:** (All fields optional)
```json
{
  "email": "updated@example.com",
  "name": "Updated Name",
  "role": "ADMIN",
  "password": "NewPassword123"
}
```

**Authorization:**
- Users can update themselves (except role)
- Admins can update anyone
- Only admins can change roles

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "updated@example.com",
    "name": "Updated Name",
    "role": "USER",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-02T00:00:00.000Z"
  },
  "message": "User updated successfully"
}
```

#### Delete User (Admin Only)
```http
DELETE /api/v1/users/:id
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### Get User Statistics
```http
GET /api/v1/users/:id/stats
Authorization: Bearer <token>
```

**Authorization:**
- Users can view their own stats
- Admins can view anyone's stats

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "reservations": {
      "total": 15,
      "byStatus": {
        "ACTIVE": 5,
        "COMPLETED": 10
      }
    }
  }
}
```

#### Bulk Update Users (Admin Only)
```http
PATCH /api/v1/users/bulk
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "userIds": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002"
  ],
  "role": "ADMIN"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "updatedCount": 2,
    "message": "2 user(s) updated successfully"
  }
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Authentication required)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

### Common Error Messages
- `"No token provided"` - Authorization header missing
- `"Invalid or expired token"` - JWT token is invalid or expired
- `"Authentication failed"` - Token verification failed
- `"Validation failed"` - Request body validation errors
- `"Only admins can..."`- Insufficient permissions
- `"You do not have permission to access this..."` - Authorization error
- `"...not found"` - Resource not found

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Response**: 429 Too Many Requests
- **Message**: "Too many requests from this IP, please try again later."

---

## CORS

**Allowed Origins:**
- Development: `http://localhost:5173`
- Production: Configure via `CORS_ORIGIN` environment variable

**Credentials**: Enabled

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tablu_stations

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## TypeScript Types for Frontend

```typescript
// Copy these types to your frontend project

// Enums
export enum ReservationStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  ENDING_SOON = 'ENDING_SOON',
  COMPLETED = 'COMPLETED'
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

// Models
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  advertiserName: string;
  customerName: string;
  location: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: Pagination;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Request DTOs
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateReservationRequest {
  advertiserName: string;
  customerName: string;
  location: string;
  startTime: string;
  endTime: string;
}

export interface UpdateReservationRequest {
  advertiserName?: string;
  customerName?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: Role;
  password?: string;
}
```

---

## Example API Client (Axios)

```typescript
import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized (redirect to login)
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
      }
    );
  }

  // Auth
  async register(data: RegisterRequest) {
    return this.client.post<ApiResponse<{ user: User; token: string }>>('/api/v1/auth/register', data);
  }

  async login(data: LoginRequest) {
    return this.client.post<ApiResponse<{ user: User; token: string }>>('/api/v1/auth/login', data);
  }

  async getCurrentUser() {
    return this.client.get<ApiResponse<User>>('/api/v1/auth/me');
  }

  // Reservations
  async getReservations(params?: {
    page?: number;
    limit?: number;
    status?: ReservationStatus;
    search?: string;
  }) {
    return this.client.get<ApiResponse<Reservation[]>>('/api/v1/reservations', { params });
  }

  async createReservation(data: CreateReservationRequest) {
    return this.client.post<ApiResponse<Reservation>>('/api/v1/reservations', data);
  }

  async getReservation(id: string) {
    return this.client.get<ApiResponse<Reservation>>(`/api/v1/reservations/${id}`);
  }

  async updateReservation(id: string, data: UpdateReservationRequest) {
    return this.client.put<ApiResponse<Reservation>>(`/api/v1/reservations/${id}`, data);
  }

  async deleteReservation(id: string) {
    return this.client.delete<ApiResponse<void>>(`/api/v1/reservations/${id}`);
  }

  // Statistics
  async getDashboardStats(params?: { startDate?: string; endDate?: string }) {
    return this.client.get('/api/v1/statistics/dashboard', { params });
  }

  // Users (Admin)
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: Role;
    search?: string;
  }) {
    return this.client.get<ApiResponse<User[]>>('/api/v1/users', { params });
  }

  async createUser(data: CreateUserRequest) {
    return this.client.post<ApiResponse<User>>('/api/v1/users', data);
  }
}

export const apiClient = new ApiClient(import.meta.env.VITE_API_URL || 'http://localhost:3000');
```

---

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Get Reservations
curl -X GET http://localhost:3000/api/v1/reservations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Swagger UI

Visit `http://localhost:3000/api-docs` in your browser to interact with the API using the Swagger UI interface.

---

## Support

For issues or questions about the API, please contact the development team or open an issue in the repository.

**Last Updated**: January 2025
**API Version**: 1.0.0
