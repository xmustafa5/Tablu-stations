# Station Rental Backend API

Express TypeScript backend for the station rental system with Prisma ORM.

## Tech Stack

- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Morgan** - Request logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials and JWT secret

4. Generate Prisma Client:
```bash
pnpm prisma:generate
```

5. Run database migrations:
```bash
pnpm prisma:migrate
```

## Development

Start the development server:
```bash
pnpm dev
```

The server will run on `http://localhost:3000`

## Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm prisma:generate` - Generate Prisma Client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:studio` - Open Prisma Studio

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts       # JWT authentication
│   │   ├── errorHandler.ts
│   │   └── requestLogger.ts
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   │   ├── jwt.ts        # JWT helpers
│   │   ├── password.ts   # Password hashing
│   │   └── prisma.ts     # Prisma client
│   └── server.ts         # Express app entry point
├── .env.example          # Environment variables template
└── tsconfig.json         # TypeScript configuration
```

## API Endpoints

### Health Check
- `GET /health` - Server health check

### TODO: Add your API endpoints here
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/stations` - Get all stations
- `POST /api/stations` - Create station (admin)
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking

## Database Models

### User
- id, email, password, name, role, timestamps

### Station
- id, name, description, location, coordinates, pricePerHour, available, timestamps

### Booking
- id, userId, stationId, startTime, endTime, totalCost, status, timestamps

## Security Features

- Helmet for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- JWT authentication
- Password hashing with bcrypt
- Request logging

## Environment Variables

See `.env.example` for required environment variables.
