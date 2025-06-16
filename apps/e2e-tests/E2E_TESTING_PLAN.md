# UniCal E2E Testing Plan

## Overview

This comprehensive E2E testing plan covers all application flows for UniCal based on the Functional Requirements Document (FRD), backend/frontend agent plans, and current implementation status. The plan follows the phased development approach and maps test scenarios to specific functional requirements.

## 🎯 **Current Implementation Status**

### ✅ **Phase 1: Authentication Tests - COMPLETED**
All authentication-related test scenarios have been implemented and are ready for execution:

- **Basic Login/Logout** (`/tests/auth/login.spec.ts`) ✅
- **Single Sign-On (SSO)** (`/tests/auth/sso.spec.ts`) ✅  
- **User Registration** (`/tests/auth/registration.spec.ts`) ✅
- **Password Management** (`/tests/auth/password-management.spec.ts`) ✅

### 📋 **Phase 2-6: Future Implementation - TODO**
Placeholder test files created for future implementation:

- **Calendar Functionality** - Views, events, navigation
- **Platform Integrations** - Google/Microsoft OAuth and sync
- **Admin Panel** - User management, audit logs
- **API Testing** - Direct backend API validation
- **Cross-Platform & Accessibility** - Mobile, keyboard navigation

## Test Coverage Strategy

### 1. Test Organization Structure
```
tests/
├── auth/                          # Authentication flows
│   ├── login.spec.ts             # Basic login/logout
│   ├── sso.spec.ts               # SSO (Google/Microsoft)
│   ├── registration.spec.ts      # User registration
│   └── password-management.spec.ts # Password reset/change
├── calendar/                      # Calendar functionality
│   ├── views.spec.ts             # Day/Week/Month views
│   ├── events.spec.ts            # Event CRUD operations
│   ├── visibility.spec.ts        # Calendar toggle visibility
│   └── navigation.spec.ts        # Calendar navigation
├── integrations/                  # Platform integrations
│   ├── google-oauth.spec.ts      # Google Calendar OAuth
│   ├── microsoft-oauth.spec.ts   # Microsoft OAuth
│   ├── sync.spec.ts              # Two-way synchronization
│   └── account-management.spec.ts # Connected accounts
├── admin/                         # Admin panel flows
│   ├── admin-auth.spec.ts        # Admin authentication
│   ├── user-management.spec.ts   # User CRUD operations
│   ├── lead-management.spec.ts   # Lead management
│   ├── audit-logs.spec.ts        # Audit logging
│   └── dashboard.spec.ts         # Admin dashboard
├── api/                           # API testing
│   ├── auth-api.spec.ts          # Authentication APIs
│   ├── calendar-api.spec.ts      # Calendar APIs
│   ├── sync-api.spec.ts          # Sync APIs
│   └── admin-api.spec.ts         # Admin APIs
├── responsive/                    # Responsive testing
│   ├── mobile-auth.spec.ts       # Mobile authentication
│   ├── mobile-calendar.spec.ts   # Mobile calendar
│   └── tablet-views.spec.ts      # Tablet views
└── accessibility/                 # Accessibility testing
    ├── keyboard-navigation.spec.ts
    ├── screen-reader.spec.ts
    └── aria-compliance.spec.ts
```

## Phase 1: Core Authentication & Setup Tests

### 1.1 Basic Authentication (FR3.1.0, FR3.2.1, FR3.4.1)

#### Test Scenarios:
- **Login Flow Success**
  - User enters valid credentials
  - System authenticates and redirects to dashboard
  - Session is maintained across page refreshes
  - Logout functionality works correctly

- **Login Flow Failure**
  - Invalid credentials show appropriate error
  - Account lockout after multiple failures
  - Error messages are user-friendly

- **Session Management**
  - Session expires after timeout
  - Session regeneration on login
  - Secure cookie handling

#### Test Files:
```typescript
// tests/auth/login.spec.ts
describe('Basic Authentication', () => {
  test('successful login with valid credentials', async ({ page }) => {
    // Implementation follows Page Object Pattern
  });
  
  test('failed login with invalid credentials', async ({ page }) => {
    // Error handling validation
  });
  
  test('session persistence across page refresh', async ({ page }) => {
    // Session management testing
  });
});
```

### 1.2 Single Sign-On (FR3.2.2)

#### Test Scenarios:
- **Google SSO**
  - OAuth flow initiation
  - Google consent screen interaction
  - Successful authentication and account linking
  - Error handling for denied consent

- **Microsoft SSO**
  - OAuth flow initiation  
  - Microsoft consent screen interaction
  - Successful authentication and account linking
  - Error handling for denied consent

#### Test Files:
```typescript
// tests/auth/sso.spec.ts
describe('Single Sign-On', () => {
  test('Google SSO successful flow', async ({ page, context }) => {
    // Mock or use test Google account
  });
  
  test('Microsoft SSO successful flow', async ({ page, context }) => {
    // Mock or use test Microsoft account
  });
});
```

### 1.3 User Registration (FR3.1.1)

#### Test Scenarios:
- **Registration Success**
  - Valid email and password
  - Email verification flow
  - Account activation

- **Registration Validation**
  - Email format validation
  - Password strength requirements
  - Duplicate email handling

## Phase 2: Calendar Integration Tests

### 2.1 Multi-Platform Connectivity (FR3.5.1, FR3.5.2, FR3.5.5)

#### Test Scenarios:
- **Google Calendar Connection**
  - OAuth flow initiation from integrations page
  - Calendar selection and permission granting
  - Account successfully added to connected accounts
  - Calendar events appear in unified view

- **Microsoft Outlook Connection**
  - Similar flow for Microsoft integration
  - Account management and disconnection

- **Connected Account Management**
  - View all connected accounts
  - Disconnect accounts
  - Re-authentication when tokens expire

#### Test Files:
```typescript
// tests/integrations/google-oauth.spec.ts
describe('Google Calendar Integration', () => {
  test('complete OAuth flow and calendar sync', async ({ page }) => {
    // End-to-end integration testing
  });
  
  test('calendar selection and initial sync', async ({ page }) => {
    // Calendar selection UI testing
  });
});
```

### 2.2 Unified Calendar Views (FR3.6.1, FR3.6.2, FR3.6.3, FR3.6.4)

#### Test Scenarios:
- **Calendar Views**
  - Day view displays events correctly
  - Week view navigation and event display
  - Month view with proper event rendering
  - View switching maintains date context

- **Visual Differentiation**
  - Events from different platforms have distinct colors
  - Color coding is consistent across views
  - Legend shows platform associations

- **Calendar Visibility Toggle**
  - Hide/show specific connected calendars
  - Preferences are saved and persist
  - Real-time updates when toggling

- **Event Display**
  - Click event shows detailed modal
  - Hover shows quick preview (desktop)
  - Overlapping events are handled properly

#### Test Files:
```typescript
// tests/calendar/views.spec.ts
describe('Calendar Views', () => {
  test('day view navigation and event display', async ({ page }) => {
    // Test day view functionality
  });
  
  test('week view with multiple events', async ({ page }) => {
    // Test week view interactions
  });
  
  test('month view navigation', async ({ page }) => {
    // Test month view functionality
  });
});

// tests/calendar/visibility.spec.ts
describe('Calendar Visibility', () => {
  test('toggle calendar visibility', async ({ page }) => {
    // Test show/hide functionality
  });
  
  test('visibility preferences persistence', async ({ page }) => {
    // Test preference saving
  });
});
```

### 2.3 Event Management (FR3.7.1, FR3.7.2, FR3.7.3, FR3.7.4, FR3.7.5)

#### Test Scenarios:
- **Create Event**
  - Event creation form with all fields
  - Target calendar selection
  - Event appears in both UniCal and native platform
  - Validation and error handling

- **Read Event Details**
  - Click event opens detailed modal
  - All event information is displayed correctly
  - Privacy indicators show properly

- **Update Event**
  - Edit event from details modal
  - Changes sync to native platform
  - Conflict resolution testing

- **Delete Event**
  - Confirmation dialog before deletion
  - Event removed from all platforms
  - Error handling for failed deletions

- **Recurring Events**
  - Display recurring events correctly
  - Single instance modifications
  - Exception handling

#### Test Files:
```typescript
// tests/calendar/events.spec.ts
describe('Event Management', () => {
  test('create new event with all fields', async ({ page }) => {
    // Complete event creation flow
  });
  
  test('edit existing event', async ({ page }) => {
    // Event editing workflow
  });
  
  test('delete event with confirmation', async ({ page }) => {
    // Event deletion with confirmation
  });
  
  test('recurring event display and editing', async ({ page }) => {
    // Recurring event handling
  });
});
```

## Phase 3: Synchronization Tests

### 3.1 Two-Way Synchronization (FR3.8.1, FR3.8.2, FR3.8.3, FR3.8.4)

#### Test Scenarios:
- **Real-time Sync**
  - Changes in UniCal appear in native platform
  - Changes in native platform appear in UniCal
  - Webhook processing verification
  - Polling fallback testing

- **Sync Depth**
  - All supported fields sync correctly
  - Data integrity across platforms
  - Time zone handling

- **Conflict Resolution**
  - Last update wins implementation
  - Timestamp-based resolution
  - Error handling for sync failures

- **Sync Control**
  - Calendar selection for syncing
  - Manual sync triggers
  - Sync status indicators

#### Test Files:
```typescript
// tests/integrations/sync.spec.ts
describe('Two-Way Synchronization', () => {
  test('event created in UniCal syncs to Google', async ({ page }) => {
    // Create event and verify sync
  });
  
  test('event modified in external platform syncs to UniCal', async ({ page }) => {
    // External modification detection
  });
  
  test('conflict resolution with last update wins', async ({ page }) => {
    // Conflict scenario testing
  });
  
  test('manual sync trigger', async ({ page }) => {
    // Manual sync functionality
  });
});
```

## Phase 4: Admin Panel Tests

### 4.1 Admin Authentication & Authorization

#### Test Scenarios:
- **Admin Login**
  - Admin-specific login flow
  - Role-based access control
  - Redirect to admin dashboard

- **Permission Validation**
  - Super Admin vs Admin permissions
  - Protected route access
  - Unauthorized access handling

#### Test Files:
```typescript
// tests/admin/admin-auth.spec.ts
describe('Admin Authentication', () => {
  test('admin login and dashboard access', async ({ page }) => {
    // Admin authentication flow
  });
  
  test('role-based permissions enforcement', async ({ page }) => {
    // Permission validation
  });
});
```

### 4.2 User Management (FR-USER-001 to FR-USER-007)

#### Test Scenarios:
- **User List View**
  - Display all users with pagination
  - Filtering by role and status
  - Sorting functionality
  - Search users by name/email

- **User Details**
  - View complete user profile
  - Role assignments display
  - Subscription status
  - Interaction history

- **User CRUD Operations**
  - Create new user with role assignment
  - Update user information
  - Soft delete users (Super Admin only)
  - Role management

#### Test Files:
```typescript
// tests/admin/user-management.spec.ts
describe('User Management', () => {
  test('view user list with filters', async ({ page }) => {
    // User listing and filtering
  });
  
  test('create new user with roles', async ({ page }) => {
    // User creation workflow
  });
  
  test('edit user information and roles', async ({ page }) => {
    // User editing functionality
  });
  
  test('soft delete user (Super Admin)', async ({ page }) => {
    // Deletion with permission check
  });
});
```

### 4.3 Lead Management (FR-LEAD-001 to FR-LEAD-006)

#### Test Scenarios:
- **Lead CRUD Operations**
  - Create leads manually
  - View lead details
  - Update lead information
  - Convert leads to users
  - Soft delete leads

- **Lead List Management**
  - Pagination and filtering
  - Status updates
  - Search functionality

#### Test Files:
```typescript
// tests/admin/lead-management.spec.ts
describe('Lead Management', () => {
  test('create and manage leads', async ({ page }) => {
    // Lead creation and management
  });
  
  test('convert lead to user', async ({ page }) => {
    // Lead conversion workflow
  });
});
```

### 4.4 Audit Logs & Dashboard (FR-GEN-002, FR-GEN-004)

#### Test Scenarios:
- **Audit Logging**
  - View audit logs with filters
  - Search by admin and entity type
  - Date range filtering

- **Admin Dashboard**
  - KPI display (user counts, registrations)
  - Quick navigation links
  - Real-time data updates

#### Test Files:
```typescript
// tests/admin/audit-logs.spec.ts
describe('Audit Logs', () => {
  test('view and filter audit logs', async ({ page }) => {
    // Audit log functionality
  });
});

// tests/admin/dashboard.spec.ts
describe('Admin Dashboard', () => {
  test('dashboard KPIs and navigation', async ({ page }) => {
    // Dashboard functionality
  });
});
```

## Phase 5: API Testing

### 5.1 Authentication API Tests

#### Test Scenarios:
- JWT token generation and validation
- Token refresh functionality
- Session management APIs
- OAuth callback handling

#### Test Files:
```typescript
// tests/api/auth-api.spec.ts
describe('Authentication API', () => {
  test('JWT token lifecycle', async ({ request }) => {
    // API-level authentication testing
  });
  
  test('OAuth callback processing', async ({ request }) => {
    // OAuth API testing
  });
});
```

### 5.2 Calendar API Tests

#### Test Scenarios:
- Event CRUD operations
- Calendar synchronization APIs
- Error handling and validation
- Rate limiting behavior

#### Test Files:
```typescript
// tests/api/calendar-api.spec.ts
describe('Calendar API', () => {
  test('event CRUD operations', async ({ request }) => {
    // API event management
  });
  
  test('sync endpoints', async ({ request }) => {
    // Sync API testing
  });
});
```

## Phase 6: Cross-Platform & Accessibility

### 6.1 Responsive Design Tests

#### Test Scenarios:
- Mobile authentication flows
- Calendar views on different screen sizes
- Touch interactions
- Mobile-specific UI components

#### Test Files:
```typescript
// tests/responsive/mobile-calendar.spec.ts
describe('Mobile Calendar', () => {
  test('calendar views on mobile devices', async ({ page }) => {
    // Mobile calendar testing
  });
});
```

### 6.2 Accessibility Tests

#### Test Scenarios:
- Keyboard navigation
- Screen reader compatibility
- ARIA labels and roles
- Color contrast compliance

#### Test Files:
```typescript
// tests/accessibility/keyboard-navigation.spec.ts
describe('Keyboard Navigation', () => {
  test('complete app navigation with keyboard only', async ({ page }) => {
    // Keyboard accessibility testing
  });
});
```

## Test Data Management

### Test User Accounts
```typescript
// utils/test-data.ts
export const TEST_USERS = {
  REGULAR_USER: {
    email: 'test.user@example.com',
    password: 'TestUser123!',
    role: 'USER'
  },
  ADMIN_USER: {
    email: 'admin@example.com', 
    password: 'AdminPass123!',
    role: 'ADMIN'
  },
  SUPER_ADMIN: {
    email: 'superadmin@example.com',
    password: 'SuperAdmin123!',
    role: 'SUPER_ADMIN'
  }
};
```

### Mock Calendar Data
```typescript
export const MOCK_EVENTS = {
  GOOGLE_EVENT: {
    title: 'Test Google Event',
    start: '2025-06-16T10:00:00Z',
    end: '2025-06-16T11:00:00Z',
    source: 'google'
  },
  MICROSOFT_EVENT: {
    title: 'Test Microsoft Event', 
    start: '2025-06-16T14:00:00Z',
    end: '2025-06-16T15:00:00Z',
    source: 'microsoft'
  }
};
```

## Test Environment Setup

### Environment Variables
```bash
# .env
FRONTEND_URL=http://localhost:3030
BACKEND_URL=http://localhost:3000
TEST_USER_EMAIL=test.user@example.com
TEST_USER_PASSWORD=TestUser123!
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=AdminPass123!
GOOGLE_TEST_ACCOUNT_EMAIL=testcalendar@gmail.com
MICROSOFT_TEST_ACCOUNT_EMAIL=testcalendar@outlook.com
```

### Database Seeding
```typescript
// global-setup.ts
export default async function globalSetup() {
  // Seed test database with required data
  // Create test users with different roles
  // Set up mock calendar connections
}
```

## Continuous Integration Integration

### Test Pipeline
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Start services
        run: docker-compose up -d
      - name: Run E2E tests
        run: yarn workspace @unical/e2e-tests test
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: apps/e2e-tests/playwright-report/
```

## Test Execution Strategy

### Development Phase Testing
1. **Unit Tests**: Run during development
2. **Integration Tests**: Run on feature completion
3. **E2E Critical Path**: Run daily
4. **Full E2E Suite**: Run on release candidates

### Production Testing
1. **Smoke Tests**: Run post-deployment
2. **Critical User Flows**: Run hourly
3. **Full Regression**: Run weekly

## Success Metrics

### Coverage Targets
- **Functional Requirements**: 100% of FRD requirements tested
- **User Journeys**: All critical paths covered
- **Browser Compatibility**: Chrome, Firefox, Safari
- **Device Coverage**: Desktop, tablet, mobile
- **Accessibility**: WCAG 2.1 AA compliance

### Performance Benchmarks
- **Page Load Times**: < 3 seconds
- **Authentication Flow**: < 5 seconds
- **Calendar View Rendering**: < 2 seconds
- **Sync Operation**: < 10 seconds

This comprehensive E2E testing plan ensures all UniCal application flows are thoroughly tested across different phases of development, maintaining quality and reliability throughout the implementation process.
