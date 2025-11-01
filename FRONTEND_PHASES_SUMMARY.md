# Tablu Stations Frontend - Quick Reference Guide

## 🚀 7 Phases Overview

### Phase 1: Foundation & Authentication 🔐
**Critical Priority**

**What to Build:**
- Login & Register pages
- JWT authentication
- Protected routes
- Basic app layout (header, sidebar)
- API client with Axios

**Key Files:**
- `src/services/api.client.ts`
- `src/pages/auth/Login.tsx`
- `src/pages/auth/Register.tsx`
- `src/store/authStore.ts`
- `src/types/api.types.ts`

**API Endpoints:**
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- GET `/api/v1/auth/me`

---

### Phase 2: Reservations Management (2-3 weeks) 📋
**Critical Priority**

**What to Build:**
- Reservations list with pagination
- Create/Edit/Delete reservation forms
- Search & filter functionality
- Reservation details page

**Key Components:**
- `ReservationsList.tsx`
- `ReservationForm.tsx`
- `ReservationDetails.tsx`
- `StatusBadge.tsx`

**API Endpoints:**
- GET `/api/v1/reservations`
- POST `/api/v1/reservations`
- GET `/api/v1/reservations/:id`
- PUT `/api/v1/reservations/:id`
- DELETE `/api/v1/reservations/:id`

---

### Phase 3: Status Management & Conflicts ⚠️
**High Priority**

**What to Build:**
- Status update controls
- Conflict detection warnings
- Available slots calendar
- Status summary dashboard

**Key Components:**
- `StatusManager.tsx`
- `ConflictChecker.tsx`
- `AvailableSlots.tsx`
- `StatusSummary.tsx`

**API Endpoints:**
- PATCH `/api/v1/status/reservations/:id/status`
- PATCH `/api/v1/status/reservations/:id/complete`
- GET `/api/v1/status/summary`
- POST `/api/v1/status/auto-update`
- POST `/api/v1/status/conflicts/check`
- GET `/api/v1/status/slots/available`

---

### Phase 4: Dashboard & Analytics (2-3 weeks) 📊
**High Priority**

**What to Build:**
- Dashboard with key metrics
- Revenue analytics charts
- Growth metrics comparison
- Customer analytics
- Peak hours analysis
- Forecast visualization

**Key Components:**
- `Dashboard.tsx`
- `RevenueChart.tsx`
- `GrowthMetrics.tsx`
- `CustomerAnalytics.tsx`
- `PeakHoursChart.tsx`
- `ForecastChart.tsx`

**API Endpoints:**
- GET `/api/v1/statistics/dashboard`
- GET `/api/v1/statistics/revenue`
- GET `/api/v1/statistics/analytics/growth`
- GET `/api/v1/statistics/analytics/customers`
- GET `/api/v1/statistics/analytics/peak-hours`
- GET `/api/v1/statistics/analytics/forecast`

---

### Phase 5: User Management 👥
**Medium Priority - Admin Only**

**What to Build:**
- Users list with pagination
- Create/Edit/Delete user (admin)
- User details with statistics
- Bulk user operations
- Role management

**Key Components:**
- `UsersList.tsx` (admin)
- `UserForm.tsx` (admin)
- `UserDetails.tsx`
- `UserStats.tsx`
- `BulkActions.tsx` (admin)

**API Endpoints:**
- GET `/api/v1/users`
- POST `/api/v1/users`
- GET `/api/v1/users/:id`
- PUT `/api/v1/users/:id`
- DELETE `/api/v1/users/:id`
- GET `/api/v1/users/:id/stats`
- PATCH `/api/v1/users/bulk`

---

### Phase 6: Enhanced UX & Polish ✨
**Medium Priority**

**What to Build:**
- Toast notifications
- Loading states & skeletons
- Error boundaries
- Responsive design
- Accessibility improvements
- Theme toggle (dark/light)
- Export functionality

**Key Improvements:**
- Mobile optimization
- Loading indicators
- User-friendly error messages
- Keyboard navigation
- Print-friendly layouts

---

### Phase 7: Advanced Features (2-3 weeks) 🚀
**Low Priority**

**What to Build:**
- Real-time updates (WebSocket)
- Calendar view with drag-drop
- Advanced filtering
- Custom reports
- Performance optimizations
- PWA features
- Offline support

**Advanced Components:**
- `CalendarView.tsx`
- `ReportBuilder.tsx`
- `AdvancedFilters.tsx`

---

## 📦 Quick Start Checklist

### Initial Setup
- [ ] Create React + TypeScript project with Vite
- [ ] Install dependencies (React Router, Axios, Zustand, MUI, etc.)
- [ ] Set up folder structure
- [ ] Configure ESLint & Prettier
- [ ] Create environment variables

### Phase 1 Must-Haves
- [ ] Copy API types from backend to `types/api.types.ts`
- [ ] Create Axios client with interceptors
- [ ] Build Login page
- [ ] Build Register page
- [ ] Set up authentication store
- [ ] Create ProtectedRoute wrapper
- [ ] Build basic layout (header + sidebar)

### Phase 2 Must-Haves
- [ ] Create reservations service
- [ ] Build reservations list table
- [ ] Add pagination component
- [ ] Build reservation form (create/edit)
- [ ] Add search & filter
- [ ] Implement delete with confirmation

---

## 🎨 Recommended Tech Stack

```json
{
  "framework": "React 18 + TypeScript",
  "routing": "React Router v6",
  "state": "Zustand",
  "ui": "Material-UI (MUI) or Tailwind CSS",
  "forms": "React Hook Form + Zod",
  "api": "Axios",
  "charts": "Recharts",
  "dates": "date-fns",
  "build": "Vite",
  "testing": "Vitest + React Testing Library"
}
```

---

## 🔑 Key TypeScript Types to Copy

```typescript
// Phase 1: Core types
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: Pagination;
}
```

---

## 🎯 Critical Path (MVP)

To get a working MVP as fast as possible:

1. **Week 1-2**: Phase 1 (Auth + Foundation)
2. **Week 3-5**: Phase 2 (Reservations CRUD)
3. **Week 6-7**: Phase 3 (Status & Conflicts)

**MVP Delivered**: Users can login, create/edit/delete reservations, check conflicts

---

## 📊 Timeline Estimate

| Milestone | Weeks | Features |
|-----------|-------|----------|
| **MVP** | 7 | Auth + Reservations + Status |
| **Full Featured** | 12 | + Analytics + User Management |
| **Polished** | 14 | + UX Enhancements |
| **Enterprise Ready** | 17 | + Advanced Features |

---

## 🛡️ Security Checklist

- [ ] Store JWT in httpOnly cookies or secure localStorage
- [ ] Implement token refresh mechanism
- [ ] Add CSRF protection
- [ ] Validate all inputs on frontend
- [ ] Sanitize user-generated content
- [ ] Implement role-based UI restrictions
- [ ] Add rate limiting on forms
- [ ] Use environment variables for API URLs

---

## 🧪 Testing Strategy

**Unit Tests** (80%+ coverage target):
- All utility functions
- Custom hooks
- Form validation logic

**Integration Tests**:
- API service calls
- Authentication flow
- CRUD operations

**E2E Tests** (Optional):
- Login → Create Reservation → Logout
- Admin user management flow
- Dashboard analytics loading

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet portrait */
lg: 1024px  /* Tablet landscape / Small desktop */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */
```

---

## 🎨 Color Scheme for Status

```css
WAITING:      Blue (#2196F3)
ACTIVE:       Green (#4CAF50)
ENDING_SOON:  Orange (#FF9800)
COMPLETED:    Gray (#9E9E9E)
```

---

## 📞 API Integration Tips

1. **Always use the TypeScript types** from API_DOCUMENTATION.md
2. **Handle all error cases**:
   - 400: Show validation errors
   - 401: Redirect to login
   - 403: Show permission denied
   - 404: Show not found message
   - 429: Show rate limit warning
   - 500: Show generic error

3. **Implement loading states** for all async operations
4. **Use optimistic updates** for better UX
5. **Implement retry logic** for failed requests

---

## 🚀 Getting Started Commands

```bash
# Create project
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install react-router-dom axios zustand react-hook-form zod
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install date-fns recharts react-toastify

# Install dev dependencies
npm install -D @types/node vitest @testing-library/react @testing-library/jest-dom

# Start development
npm run dev
```

---

## 📚 Resources

- **API Documentation**: `API_DOCUMENTATION.md`
- **Full Implementation Plan**: `FRONTEND_IMPLEMENTATION_PLAN.md`
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Backend Repository**: Link to backend repo

---

**Ready to Start?** Begin with Phase 1 and work your way through! 🎉
