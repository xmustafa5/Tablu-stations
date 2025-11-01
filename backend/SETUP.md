# Backend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database

Make sure you have PostgreSQL running and configure your `.env` file:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/tablu_stations"
JWT_SECRET="your-secret-key"
PORT=3000
```

### 3. Run Migrations

Create the database schema:

```bash
npm run prisma:migrate
```

### 4. Seed the Database

Populate the database with sample data:

```bash
npm run prisma:seed
```

This will create:
- **Admin User**: admin@example.com / Password123
- **Regular Users**: user@example.com / password123, jane@example.com / password123
- **Sample Reservations**: 5 reservations with different statuses

### 5. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed the database
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:coverage` - Run tests with coverage report

## Testing the API

Once the server is running, you can:

1. **Access Swagger Documentation**: http://localhost:3000/api-docs
2. **Test Login Endpoint**: POST http://localhost:3000/api/v1/auth/login
3. **View Database**: Run `npm run prisma:studio`

### Example Login Request

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Password123"
  }'
```

## Database Management

### Reset Database
To completely reset and reseed the database:
```bash
npx prisma migrate reset
```

### View Database
Open Prisma Studio to view/edit data:
```bash
npm run prisma:studio
```

### Create New Migration
After modifying `prisma/schema.prisma`:
```bash
npm run prisma:migrate
```

## Troubleshooting

### Issue: "Can't reach database server"
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env file
- Verify database exists

### Issue: "Seed script fails"
- Run `npm run prisma:generate` first
- Ensure migrations are up to date with `npm run prisma:migrate`
- Check for existing data conflicts

### Issue: "Port already in use"
- Change PORT in .env file
- Or stop the process using port 3000

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Database seeding script
│   └── migrations/        # Migration history
├── src/
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── utils/             # Utility functions
│   ├── validators/        # Request validators
│   └── server.ts          # Entry point
└── package.json
```
