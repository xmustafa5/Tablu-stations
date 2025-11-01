# Tablu Stations Frontend Implementation Plan

## Overview
This document outlines the phased approach to implementing the Tablu Stations frontend application based on the API documentation. Each phase builds upon the previous one, ensuring a solid foundation and incremental feature delivery.

---

## Technology Stack Recommendations
- **Framework**: React 18+ with TypeScript
- **Routing**: React Router v6
- **State Management**: Zustand or Redux Toolkit
- **API Client**: Axios with interceptors
- **UI Framework**: Material-UI (MUI) or Tailwind CSS + Headless UI
- **Form Handling**: React Hook Form + Zod validation
- **Date/Time**: date-fns or Day.js
- **Charts**: Recharts or Chart.js
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

---

## Phase 1: Foundation & Authentication
**Duration**: 1-2 weeks
**Priority**: Critical

### Features
1. **Project Setup**
   - Initialize React + TypeScript project with Vite
   - Configure ESLint, Prettier, and TypeScript strict mode
   - Set up folder structure (components, pages, hooks, services, types, utils)
   - Install and configure dependencies

2. **Type Definitions**
   - Create `types/api.types.ts` with all enums, interfaces, and DTOs from API docs
   - Set up TypeScript enums: `ReservationStatus`, `Role`
   - Define all request/response interfaces

3. **API Client Setup**
   - Create `services/api.client.ts` with Axios instance
   - Implement request interceptor for JWT token injection
   - Implement response interceptor for error handling
   - Add token storage/retrieval utilities
   - Create auth service with register, login, getCurrentUser methods

4. **Authentication Pages**
   - **Login Page** (`/login`)
     - Email and password form with validation
     - Error message display
     - "Remember me" functionality
     - Redirect to dashboard after successful login

   - **Register Page** (`/register`)
     - Email, password, name form with validation
     - Password strength indicator
     - Validation rules (min 8 chars, uppercase, lowercase, number)
     - Redirect to dashboard after successful registration

   - **Auth Context/Store**
     - Global authentication state management
     - User profile storage
     - Token management
     - Auto-login on app load (check stored token)
     - Logout functionality

5. **Protected Routes**
   - Create `ProtectedRoute` component
   - Redirect unauthenticated users to login
   - Implement role-based route guards

6. **Basic Layout**
   - App shell with header/navbar
   - Sidebar navigation (collapsible)
   - User profile dropdown in header
   - Logout button

### Deliverables
- ✅ Working login/register functionality
- ✅ Token-based authentication
- ✅ Protected routes
- ✅ Basic app layout with navigation
- ✅ Type-safe API client

---

## Phase 2: Reservations Management (Core Feature)
**Duration**: 2-3 weeks
**Priority**: Critical

### Features
1. **Reservations List Page** (`/reservations`)
   - Data table with pagination
   - Columns: Advertiser, Customer, Location, Start Time, End Time, Status
   - Status badge with color coding (WAITING/ACTIVE/ENDING_SOON/COMPLETED)
   - Search functionality (by advertiser, customer, location)
   - Filter by status dropdown
   - Pagination controls (page size: 10, 25, 50, 100)
   - Loading states and skeleton loaders
   - Empty state when no reservations

2. **Create Reservation** (`/reservations/new`)
   - Form with fields: advertiserName, customerName, location, startTime, endTime
   - Date/time pickers for start and end times
   - Real-time validation
   - Check for conflicts before submission
   - Success/error notifications
   - Redirect to reservations list on success

3. **Edit Reservation** (`/reservations/:id/edit`)
   - Pre-populate form with existing data
   - Same validation as create
   - Update functionality
   - Optimistic UI updates

4. **Reservation Details Page** (`/reservations/:id`)
   - Display all reservation details
   - Status history/timeline
   - Edit and Delete buttons
   - Back to list navigation

5. **Delete Reservation**
   - Confirmation modal before deletion
   - Optimistic UI update after deletion
   - Error handling

6. **Reservation Status Component**
   - Visual badge component for status display
   - Color coding:
     - WAITING: Blue
     - ACTIVE: Green
     - ENDING_SOON: Orange
     - COMPLETED: Gray

### API Endpoints Used
- `GET /api/v1/reservations` - List reservations
- `POST /api/v1/reservations` - Create reservation
- `GET /api/v1/reservations/:id` - Get single reservation
- `PUT /api/v1/reservations/:id` - Update reservation
- `DELETE /api/v1/reservations/:id` - Delete reservation

### Deliverables
- ✅ Full CRUD operations for reservations
- ✅ Search and filter functionality
- ✅ Pagination
- ✅ Form validation with error messages
- ✅ Responsive UI

---

## Phase 3: Status Management & Conflict Detection
**Duration**: 1-2 weeks
**Priority**: High

### Features
1. **Status Management Panel** (can be integrated into reservation details)
   - Manual status update dropdown
   - Status change confirmation
   - Status history display
   - "Complete Reservation" button for quick completion

2. **Conflict Detection**
   - Real-time conflict check when creating/editing reservations
   - Display conflicting reservations with details
   - Warning messages before saving
   - Conflict resolution suggestions

3. **Available Slots Viewer** (`/reservations/availability`)
   - Calendar view for a specific date
   - Location selector
   - Time slot duration selector (default: 60 minutes)
   - Visual representation of available/booked slots
   - Click to book functionality

4. **Auto-Status Update**
   - Admin button to trigger auto-status update
   - Display results (activated count, ending soon count)
   - Background job indicator (if implemented)

5. **Status Summary Dashboard Widget**
   - Visual cards showing count by status
   - WAITING, ACTIVE, ENDING_SOON, COMPLETED counts
   - Color-coded cards

### API Endpoints Used
- `PATCH /api/v1/status/reservations/:id/status` - Update status
- `PATCH /api/v1/status/reservations/:id/complete` - Complete reservation
- `GET /api/v1/status/summary` - Get status summary
- `POST /api/v1/status/auto-update` - Auto-update statuses
- `POST /api/v1/status/conflicts/check` - Check conflicts
- `GET /api/v1/status/slots/available` - Get available slots

### Deliverables
- ✅ Manual status management
- ✅ Conflict detection and warnings
- ✅ Available slots calendar
- ✅ Status summary visualization
- ✅ Auto-update functionality

---

## Phase 4: Dashboard & Analytics
**Duration**: 2-3 weeks
**Priority**: High

### Features
1. **Dashboard Home** (`/dashboard`)
   - Key metrics cards:
     - Total Reservations
     - Active Reservations
     - Completed Reservations
     - Pending (Waiting) Reservations
     - Average Duration
     - Occupancy Rate
   - Date range selector (last 7 days, 30 days, custom range)
   - Refresh button

2. **Revenue Analytics** (`/analytics/revenue`)
   - Total revenue display
   - Revenue by status pie chart
   - Revenue by location bar chart
   - Top performing locations table
   - Export to CSV functionality

3. **Growth Metrics** (`/analytics/growth`)
   - Period comparison selector (current vs previous)
   - Growth rate percentage display
   - Line chart showing trend
   - Growth indicators (up/down arrows)

4. **Customer Analytics** (`/analytics/customers`)
   - Total customers count
   - New vs Returning customers chart
   - Average reservations per customer
   - Top customers table with revenue
   - Customer segmentation

5. **Peak Hours Analysis** (`/analytics/peak-hours`)
   - Bar chart showing reservations by hour
   - Average occupancy by hour
   - Heatmap visualization (optional)
   - Insights and recommendations

6. **Forecast Dashboard** (`/analytics/forecast`)
   - Predicted reservations for next 7 days
   - Confidence level indicators
   - Line chart with historical + predicted data
   - Adjust forecast parameters (historical days)

### API Endpoints Used
- `GET /api/v1/statistics/dashboard` - Dashboard stats
- `GET /api/v1/statistics/revenue` - Revenue stats
- `GET /api/v1/statistics/analytics/growth` - Growth metrics
- `GET /api/v1/statistics/analytics/customers` - Customer metrics
- `GET /api/v1/statistics/analytics/peak-hours` - Peak hours
- `GET /api/v1/statistics/analytics/forecast` - Forecast data

### Deliverables
- ✅ Comprehensive dashboard with key metrics
- ✅ Multiple analytics pages with visualizations
- ✅ Interactive charts and graphs
- ✅ Date range filtering
- ✅ Export functionality

---

## Phase 5: User Management (Admin Only)
**Duration**: 1-2 weeks
**Priority**: Medium

### Features
1. **Users List Page** (`/admin/users`)
   - Admin-only access (role guard)
   - Data table with pagination
   - Columns: Name, Email, Role, Created Date, Actions
   - Search by name or email
   - Filter by role (USER/ADMIN)
   - Bulk actions selector

2. **Create User** (`/admin/users/new`)
   - Admin-only form
   - Fields: email, password, name, role
   - Password generation button
   - Validation
   - Success notification

3. **User Details Page** (`/admin/users/:id`)
   - Display user information
   - List user's reservations
   - User statistics (reservation counts by status)
   - Edit and Delete buttons

4. **Edit User** (`/admin/users/:id/edit`)
   - Update email, name, role
   - Password reset option
   - Self-edit restrictions (can't change own role)
   - Authorization checks

5. **Delete User**
   - Admin-only action
   - Prevent self-deletion
   - Confirmation modal with warning about cascade delete
   - Show reservation count before deletion

6. **User Statistics View**
   - Individual user stats
   - Reservation breakdown by status
   - User activity timeline

7. **Bulk Update Users**
   - Select multiple users (checkboxes)
   - Bulk role change
   - Confirmation modal
   - Progress indicator

### API Endpoints Used
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user (admin)
- `GET /api/v1/users/:id` - Get user details
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (admin)
- `GET /api/v1/users/:id/stats` - User statistics
- `PATCH /api/v1/users/bulk` - Bulk update users (admin)

### Deliverables
- ✅ Complete user management for admins
- ✅ Role-based access control
- ✅ Bulk operations
- ✅ User statistics
- ✅ Self-protection mechanisms

---

## Phase 6: Enhanced UX & Polish
**Duration**: 1-2 weeks
**Priority**: Medium

### Features
1. **Global Search**
   - Search bar in header
   - Search across reservations and users
   - Quick results dropdown
   - Navigate to details

2. **Notifications System**
   - Toast notifications for success/error/info
   - Notification center with history
   - In-app notifications for:
     - Reservations ending soon
     - Conflicts detected
     - Status changes

3. **Loading States**
   - Skeleton loaders for tables and cards
   - Spinner for form submissions
   - Progress indicators for long operations
   - Lazy loading for images and components

4. **Error Handling**
   - Global error boundary
   - User-friendly error messages
   - Retry mechanisms
   - Offline detection

5. **Responsive Design**
   - Mobile-optimized layouts
   - Tablet breakpoints
   - Touch-friendly interactions
   - Responsive navigation (hamburger menu on mobile)

6. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Focus management
   - Screen reader support
   - Color contrast compliance

7. **User Preferences**
   - Theme toggle (light/dark mode)
   - Table density options
   - Default page size preferences
   - Language selection (i18n ready)

8. **Export/Print Features**
   - Export reservations to CSV/Excel
   - Print-friendly reservation details
   - PDF generation for reports

### Deliverables
- ✅ Polished user experience
- ✅ Responsive across devices
- ✅ Accessible interface
- ✅ Comprehensive error handling
- ✅ User preferences

---

## Phase 7: Advanced Features & Optimization
**Duration**: 2-3 weeks
**Priority**: Low

### Features
1. **Real-time Updates**
   - WebSocket integration for live updates
   - Real-time status changes
   - Live reservation updates

2. **Calendar View**
   - Full calendar view for reservations
   - Month, week, day views
   - Drag-and-drop to reschedule
   - Color-coded by status

3. **Advanced Filtering**
   - Date range filters
   - Multi-select filters
   - Saved filter presets
   - Filter combinations

4. **Reporting**
   - Custom report builder
   - Scheduled reports
   - Email report delivery
   - Report templates

5. **Performance Optimization**
   - React Query for server state management
   - Infinite scrolling for large lists
   - Virtual scrolling for tables
   - Code splitting and lazy loading
   - Image optimization
   - Bundle size optimization

6. **PWA Features**
   - Service worker for offline support
   - Install prompt
   - Push notifications
   - Background sync

7. **Advanced Analytics**
   - Custom date range comparisons
   - Trend analysis
   - Predictive insights
   - Anomaly detection

### Deliverables
- ✅ Real-time capabilities
- ✅ Advanced visualization options
- ✅ Performance optimizations
- ✅ PWA functionality
- ✅ Advanced analytics

---

## Testing Strategy

### Unit Testing
- Test all utility functions
- Test React hooks
- Test API client methods
- Test form validation logic
- **Target**: 80%+ coverage

### Integration Testing
- Test API integration
- Test user flows (login → create reservation → logout)
- Test authentication flows
- Test CRUD operations

### E2E Testing (Optional)
- Cypress or Playwright
- Critical user journeys
- Authentication flows
- Reservation creation flow

---

## Folder Structure

```
frontend/
├── public/
│   └── assets/
├── src/
│   ├── assets/              # Images, fonts, etc.
│   ├── components/
│   │   ├── common/          # Shared components (Button, Input, Modal, etc.)
│   │   ├── layout/          # Layout components (Header, Sidebar, Footer)
│   │   ├── reservations/    # Reservation-specific components
│   │   ├── users/           # User management components
│   │   └── analytics/       # Analytics components
│   ├── pages/
│   │   ├── auth/            # Login, Register
│   │   ├── reservations/    # Reservation pages
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── analytics/       # Analytics pages
│   │   └── admin/           # Admin pages (user management)
│   ├── hooks/               # Custom React hooks
│   ├── services/
│   │   ├── api.client.ts    # Axios instance
│   │   ├── auth.service.ts  # Auth API calls
│   │   ├── reservation.service.ts
│   │   ├── user.service.ts
│   │   └── analytics.service.ts
│   ├── store/               # State management (Zustand/Redux)
│   │   ├── authStore.ts
│   │   ├── reservationStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── api.types.ts     # All API types from backend
│   │   └── app.types.ts     # Frontend-specific types
│   ├── utils/
│   │   ├── date.utils.ts
│   │   ├── validation.utils.ts
│   │   ├── format.utils.ts
│   │   └── storage.utils.ts
│   ├── constants/
│   │   └── index.ts         # API URLs, app constants
│   ├── routes/
│   │   └── index.tsx        # Route configuration
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .env.development
├── .env.production
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Environment Variables

```env
# .env.development
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Tablu Stations
VITE_ENABLE_DEV_TOOLS=true

# .env.production
VITE_API_URL=https://api.tablu.com
VITE_APP_NAME=Tablu Stations
VITE_ENABLE_DEV_TOOLS=false
```

---

## Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^3.3.0",
    "recharts": "^2.12.0",
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "react-toastify": "^10.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.1.0",
    "vitest": "^1.3.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/jest-dom": "^6.4.0",
    "eslint": "^8.56.0",
    "prettier": "^3.2.0"
  }
}
```

---

## Development Workflow

### Phase Implementation Order
1. **Phase 1** → Foundation (required for all subsequent phases)
2. **Phase 2** → Core feature (critical business functionality)
3. **Phase 3** → Enhances Phase 2 functionality
4. **Phase 4** → Adds business intelligence
5. **Phase 5** → Admin functionality
6. **Phase 6** → UX improvements
7. **Phase 7** → Advanced features

### Sprint Planning
- **2-week sprints** recommended
- Daily standups for team coordination
- Sprint reviews after each phase
- Continuous integration/deployment

### Code Quality
- TypeScript strict mode enabled
- ESLint + Prettier configured
- Pre-commit hooks with Husky
- Code reviews required
- Component documentation with JSDoc

---

## Success Metrics

### Phase 1-2 (Core)
- User can register, login, and manage reservations
- All CRUD operations working
- Response time < 1 second

### Phase 3-4 (Enhanced)
- Conflict detection working 100%
- Analytics dashboard loads in < 2 seconds
- Charts render smoothly

### Phase 5-6 (Complete)
- Admin features fully functional
- Mobile responsive on all screens
- Accessibility score > 90

### Phase 7 (Optimized)
- Lighthouse score > 90
- Time to Interactive < 3 seconds
- First Contentful Paint < 1.5 seconds

---

## Risk Mitigation

### Technical Risks
1. **API Changes**: Use TypeScript types to catch breaking changes early
2. **Performance**: Implement pagination, lazy loading, and code splitting from start
3. **Browser Compatibility**: Use modern build tools with automatic polyfills

### Project Risks
1. **Scope Creep**: Stick to phased approach, document feature requests for future
2. **Timeline Delays**: Prioritize critical phases (1-3), defer advanced features
3. **Resource Constraints**: Focus on MVP features first

---

## Deployment Strategy

### Development
- Deploy to dev environment on every push to `develop` branch
- URL: `https://dev.tablu-stations.com`

### Staging
- Deploy to staging on PR merge to `main`
- URL: `https://staging.tablu-stations.com`
- QA testing environment

### Production
- Deploy to production on release tag
- URL: `https://tablu-stations.com`
- Blue-green deployment for zero downtime

### CI/CD Pipeline
1. Lint and type check
2. Run unit tests
3. Build production bundle
4. Run E2E tests (staging only)
5. Deploy to environment

---

## Phase Summary Table

| Phase | Duration | Priority | Features | Complexity |
|-------|----------|----------|----------|------------|
| 1 | 1-2 weeks | Critical | Auth + Foundation | Medium |
| 2 | 2-3 weeks | Critical | Reservations CRUD | Medium |
| 3 | 1-2 weeks | High | Status & Conflicts | Medium |
| 4 | 2-3 weeks | High | Dashboard & Analytics | High |
| 5 | 1-2 weeks | Medium | User Management | Medium |
| 6 | 1-2 weeks | Medium | UX & Polish | Low |
| 7 | 2-3 weeks | Low | Advanced Features | High |
| **Total** | **10-17 weeks** | | | |

---

## Next Steps

1. **Review this plan** with the development team
2. **Set up development environment** and project structure
3. **Begin Phase 1** implementation
4. **Schedule regular check-ins** after each phase
5. **Iterate based on feedback** from stakeholders

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Prepared For**: Tablu Stations Frontend Team
