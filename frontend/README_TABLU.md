# Tablu Stations Frontend

A modern reservation management system built with Next.js 16, TypeScript, TanStack Query, and Shadcn UI.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn UI (Radix UI)
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Package Manager**: pnpm

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001)

### 4. Build for Production
```bash
pnpm build
pnpm start
```

## Project Structure

```
frontend/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Auth routes group
│   │   ├── login/            # Login page
│   │   └── register/         # Register page
│   ├── dashboard/            # Dashboard page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
│
├── components/               # React components
│   ├── ui/                   # Shadcn UI components
│   └── protected-route.tsx   # Route protection
│
├── lib/                      # Utilities and services
│   ├── hooks/                # Custom React hooks
│   ├── providers/            # Context providers
│   ├── services/             # API services
│   ├── store/                # State management
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
│
└── public/                   # Static assets
```

## Features

### Phase 1: Foundation & Authentication ✅
- User registration and login
- JWT authentication
- Protected routes
- Auto-login with token persistence
- Password strength validation
- Toast notifications
- Loading states
- Error handling

### Phase 2: Reservations (Coming Soon)
- List reservations with pagination
- Create/edit/delete reservations
- Search and filter
- Status badges

### Phase 3: Status Management (Coming Soon)
- Update reservation status
- Conflict detection
- Available slots calendar

### Phase 4: Analytics (Coming Soon)
- Dashboard statistics
- Revenue analytics
- Growth metrics
- Customer insights

### Phase 5: User Management (Coming Soon)
- Admin user management
- Role-based access
- User statistics

## API Integration

The frontend connects to the Tablu Stations backend API:
- **Base URL**: Configured via `NEXT_PUBLIC_API_URL`
- **Authentication**: JWT Bearer tokens
- **Error Handling**: Global error interceptor
- **Auto Redirect**: 401 responses redirect to login

### API Services

Located in `lib/services/`:
- `api.client.ts` - Axios instance with interceptors
- `auth.service.ts` - Authentication API calls

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Linting
pnpm lint             # Run ESLint

# Type Checking
pnpm type-check       # Run TypeScript compiler
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Tablu Stations` |
| `NEXT_PUBLIC_APP_VERSION` | App version | `1.0.0` |

## Authentication Flow

1. **Login/Register**
   - User submits credentials
   - Backend returns JWT token
   - Token stored in localStorage
   - User redirected to dashboard

2. **Protected Routes**
   - Check for token in localStorage
   - Fetch current user from API
   - Allow/deny access based on auth status
   - Support role-based access (USER/ADMIN)

3. **Auto-Login**
   - On app load, check for existing token
   - If found, fetch current user
   - If valid, restore session
   - If invalid, redirect to login

4. **Logout**
   - Clear token from localStorage
   - Clear React Query cache
   - Redirect to login

## Form Validation

Using React Hook Form + Zod:

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
    .regex(/[A-Z]/, 'Need uppercase')
    .regex(/[a-z]/, 'Need lowercase')
    .regex(/[0-9]/, 'Need number'),
});
```

## State Management

### Server State (TanStack Query)
- API data caching
- Automatic refetching
- Optimistic updates
- Loading/error states

### Client State (React Context)
- Authentication state
- User profile
- UI preferences

## Styling

### Tailwind CSS
- Utility-first CSS framework
- Dark mode support
- Responsive design
- Custom theme configuration

### Shadcn UI
- Pre-built accessible components
- Radix UI primitives
- Customizable with Tailwind

## Testing

```bash
# Run tests (when implemented)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Docker
```bash
# Build image
docker build -t tablu-frontend .

# Run container
docker run -p 3001:3001 tablu-frontend
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Documentation

- [Phase 1 Complete](./PHASE1_COMPLETE.md) - Phase 1 implementation details
- [API Documentation](../API_DOCUMENTATION.md) - Backend API reference
- [Frontend Implementation Plan](../FRONTEND_IMPLEMENTATION_PLAN.md) - Full roadmap

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 3001
npx kill-port 3001
```

### Clear Node Modules
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Reset Development Server
```bash
rm -rf .next
pnpm dev
```

## Support

For issues or questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details

---

**Built with ❤️ using Next.js and TypeScript**
