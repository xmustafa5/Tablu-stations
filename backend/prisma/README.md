# Database Seeding

This directory contains the database schema and seeding script for the Tablu Stations backend.

## Prerequisites

1. PostgreSQL database running
2. `.env` file configured with `DATABASE_URL`
3. Dependencies installed (`npm install`)

## Running Migrations

To create/update the database schema:

```bash
npm run prisma:migrate
```

## Seeding the Database

The seed script will populate your database with:
- **Admin user** (for testing admin features)
- **2 Regular users** (for testing user features)
- **5 Sample reservations** (with different statuses)

### Run the seed script:

```bash
npm run prisma:seed
```

Or using Prisma CLI directly:

```bash
npx prisma db seed
```

### Automatic Seeding

The seed script is automatically run when you:
- Run `npx prisma migrate reset` (resets database and runs seed)
- Run `npx prisma db push --force-reset`

## Seeded User Credentials

### Admin User
- **Email:** admin@example.com
- **Password:** Password123
- **Role:** ADMIN

### Regular Users
1. **Email:** user@example.com
   - **Password:** password123
   - **Name:** John Doe
   - **Role:** USER

2. **Email:** jane@example.com
   - **Password:** password123
   - **Name:** Jane Smith
   - **Role:** USER

## Sample Data

The seed script creates 5 sample reservations with different statuses:
- **WAITING** - Future reservations not yet started
- **ACTIVE** - Currently ongoing reservations
- **ENDING_SOON** - Reservations ending within 3 days
- **COMPLETED** - Past reservations that have ended

## Customizing Seed Data

Edit `prisma/seed.ts` to modify:
- User credentials
- Number of users
- Sample reservations
- Reservation data

## Resetting the Database

To completely reset and reseed the database:

```bash
npx prisma migrate reset
```

This will:
1. Drop the database
2. Create a new database
3. Run all migrations
4. Run the seed script

## Viewing Data

To open Prisma Studio and view/edit your data:

```bash
npm run prisma:studio
```

This opens a GUI at `http://localhost:5555` where you can browse and edit your database.
