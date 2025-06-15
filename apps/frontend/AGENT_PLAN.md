<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/frontend/AGENT_PLAN.md -->
# AI Agent Implementation Plan: UniCal Frontend (Next.js)

This plan guides frontend development, aligning with backend phases, FRD.md, BRD.md, Challenges.md, and SETUP_PLAN.md.

**Core Principles:**
*   **Component-Based:** Reusable components, clear separation of concerns.
*   **Best Practices:** React/Next.js standards, state management, performance, A11y, testing.
*   **TODO-Driven:** Use `[MODULE_OR_FEATURE_NAME]_PLAN.md` in relevant directories for detailed tasks. Populate these from this master plan.
*   **Iterative Refinement:** Address UI/UX challenges progressively, informed by Challenges.md.
*   **Phased Rollout:** Align with FRD and backend capabilities.

**Note on FRD Alignment:** Initial product: simplified/SSO login (unified user model, multi-role), unified calendar, core event CRUD, Google/Outlook sync, basic lead management for admins. Advanced features post-initial product.

## Phase 1: Core Setup & Foundational UI (Aligns with SETUP_PLAN Phases 1-2)
**Goal:** Establish a runnable Next.js project with basic layout, UI component structure, and environment setup.

*   [x] **Project Setup Verification:** Confirm Next.js 15 (App Router), TypeScript, Tailwind CSS, ESLint, Prettier (per `SETUP_PLAN.md`).
*   [x] **Environment Variables:** Setup `.env.local`: `NEXT_PUBLIC_BACKEND_API_URL`.
*   [x] **Basic Layout & Global Styles (`app/layout.tsx`, `app/globals.css`):** Implement main layout (Tailwind), global styles, custom fonts (per `SETUP_PLAN.md`).
*   [x] **UI Component Library Structure (`/components/ui/UI_COMPONENTS_PLAN.md`):** Plan common UI components. Implement basic Button, Input (Tailwind, @headlessui/react).
*   [x] **Core Directory Structure:** Establish `/components/`, `/lib/`, `/app/`, `/styles/`, `/contexts/`.
*   [x] **Layout Components (`/components/layout/LAYOUT_COMPONENTS_PLAN.md`):** Develop Navbar, Footer. Integrate auth status (user info, login/logout). Update `LAYOUT_COMPONENTS_PLAN.md`.
*   [x] **Basic Pages:** Create landing page, dashboard, calendar, integrations, and settings pages.

## Phase 2: Authentication & Initial Page Structure (Aligns with SETUP_PLAN Phase 3 & 7)
**Goal:** Implement user authentication using next-auth v5 with username/password, Google, and Microsoft providers, supporting a unified user model and multi-role RBAC. Create basic page structure with protected routes.

*   [x] **Authentication Setup (`/lib/auth/AUTH_FEATURE_PLAN.md`):**
    *   Use [next-auth v5](https://authjs.dev/getting-started/installation) for authentication.
    *   Support username/password, Google, and Microsoft providers.
    *   Backend will manage unified user profiles and roles; frontend auth will focus on obtaining tokens and session state.
    *   Ensure session information includes user roles for client-side conditional rendering if needed (primary RBAC is backend enforced).
    *   Follow [migration guide](https://authjs.dev/getting-started/migrating-to-v5) if upgrading from previous versions.
    *   Add environment variables for provider credentials and next-auth secret.
    *   Create `/auth.ts` config file exporting next-auth handlers and provider configs.
    *   Create API route at `/api/auth/[...nextauth]/route.ts` to handle auth requests.
    *   Wrap app in `SessionProvider` from `next-auth/react` ([see guide](https://nextjs.org/learn/dashboard-app/adding-authentication)).
    *   Update login/logout UI to use next-auth's `signIn`/`signOut` functions.
    *   Use `useSession` hook in client components and `auth()` in server components to access session/user info.
    *   Protect routes using session checks in both server and client components. Admin routes will require specific roles.
    *   Update `AUTH_FEATURE_PLAN.md` with detailed steps and code snippets.
*   [x] **API Client Setup (`/lib/api/API_CLIENT_PLAN.md`):** Create API client for backend requests (`NEXT_PUBLIC_BACKEND_API_URL`). Plan for authenticated requests (Auth0 access token). Update `API_CLIENT_PLAN.md`.
*   [x] **Initial Page Structure (`app/`):
    *   `app/page.tsx` (Public landing).
    *   `app/(protected)/dashboard/page.tsx` (Placeholder dashboard - protected).
    *   `app/(auth)/login/page.tsx` (If dedicated login page for simplified/SSO).
    *   Implement protected route logic (`useUser` or `getSession`). Use `loading.tsx`, `error.tsx`.
*   [x] **Layout Components (`/components/layout/LAYOUT_COMPONENTS_PLAN.md`):** Develop Navbar, Footer. Integrate auth status (user info, login/logout). Update `LAYOUT_COMPONENTS_PLAN.md`.

## Phase 3: Core Calendar Functionality (Aligns with SETUP_PLAN Phase 4 & FRD Core Features)
**Goal:** Implement UI for connecting calendar accounts, viewing aggregated calendars, and managing events.

*   [ ] **Integrations Management UI (`/app/(protected)/integrations/INTEGRATIONS_FEATURE_PLAN.md`):
    *   **FR3.2.1 & FR3.2.2 Connect Google/Microsoft Calendar:** UI to initiate OAuth (buttons to backend endpoints).
    *   **FR3.2.5 Manage Connected Accounts:** UI to display connected accounts, "Disconnect" option.
    *   **FR3.5.4 Sync Control (Calendar Selection):** UI to list user's native calendars, allow selection for syncing.
    *   Update `INTEGRATIONS_FEATURE_PLAN.md`.
*   [ ] **Unified Calendar View UI (`/app/(protected)/calendar/CALENDAR_FEATURE_PLAN.md`):
    *   **FR3.3.1 Standard Calendar Views:** Integrate `@event-calendar/core` (daygrid, timegrid, list, interaction). Implement Day, Week, Month views. Fetch/display aggregated events.
    *   **FR3.3.2 Visual Differentiation:** Basic color-coding for event sources.
    *   **FR3.3.3 Calendar Visibility Toggle:** UI to show/hide events from specific native calendars.
    *   **FR3.3.4 Event Display & Details Modal:** Display event info. On click, show modal (Title, Start/End, Description, Location, Source). Edit/Delete buttons (stubbed).
    *   **FR3.3.5 Time Zone Support:** Display events in user's local time (backend provides UTC).
    *   Update `CALENDAR_FEATURE_PLAN.md`.
*   [ ] **Event Management UI (within `CALENDAR_FEATURE_PLAN.md`):
    *   **FR3.4.1 Create Event:** Modal/form (Title, Start/End, All-day, Target Calendar, Description, Location). API call.
    *   **FR3.4.3 Update Event:** Modal/form (pre-filled). API call.
    *   **FR3.4.4 Delete Event:** Confirmation dialog. API call.
    *   **FR3.4.5 Recurring Events (Display):** Display recurring events (master/instances).
    *   **FR3.7.1 Privacy Indication (Display):** Visually indicate "private" events.
    *   **FR3.9.1 Event Reminders (Display):** Display reminder info in details modal.

## Phase 4: State Management, Refinement & Testing Setup (Aligns with SETUP_PLAN Phase 5, 8, 9, 10)
**Goal:** Implement robust state management, refine UI/UX, ensure error handling, and set up testing infrastructure.

*   [ ] **State Management (`/lib/state/STATE_MANAGEMENT_PLAN.md`):
    *   Implement global state manager (e.g., Zustand, Jotai) for calendar state, user preferences. Update `STATE_MANAGEMENT_PLAN.md`.
*   [ ] **UI Refinement & Responsiveness:** Test/fix responsiveness. Improve look & feel, transitions.
*   [ ] **Error Handling & Loading States:** Implement global error display (toasts/notifications). Consistent loading indicators.
*   [ ] **Accessibility (A11y) Review:** Initial A11y audit. Address critical issues.
*   [ ] **Linting & Formatting:** Ensure consistent ESLint, Prettier application.
*   [ ] **Testing Setup (`TESTING_SETUP_PLAN.md`):
    *   Configure Jest & React Testing Library. Write initial unit/integration tests. Update `TESTING_SETUP_PLAN.md`.
*   [ ] **SSR/Optimization Review:** Review Server/Client Components, Next.js optimizations.

## Phase 5: Admin Panel MVP UI (Aligns with Backend Admin Panel MVP)

**Goal:** Implement the user interface for the Admin Panel MVP, enabling administrators to manage all system users (unified table, multi-role) and leads, and view system information as per the updated `docs/Admin_FRD.md`.

*   [x] **Admin Panel Layout & Navigation (`/app/admin/layout.tsx`, `/components/admin/layout/ADMIN_LAYOUT_PLAN.md`):
    *   [x] Create a distinct layout for the Admin Panel with `/admin` URL prefix.
    *   [x] Implement navigation (sidebar/topbar) for Admin Panel sections (Dashboard, User Management, Lead Management, Audit Logs, etc.) based on user role(s) (Admin/Super Admin).
    *   [x] Ensure secure access to admin routes, redirecting if not authenticated or authorized with appropriate role(s).
*   [x] **Admin Authentication (`/app/admin/login/page.tsx`, `/lib/auth/ADMIN_AUTH_PLAN.md`):
    *   [x] Implement login page for Admin Panel users at `/admin/login`, integrating with next-auth (FR-GEN-001-MVP).
    *   [x] Handle session management specifically for admin-roled users.
*   [x] **Admin Dashboard (`/app/admin/dashboard/ADMIN_DASHBOARD_PLAN.md`):
    *   [x] Display KPIs: Total users (by type/role if possible), new registrations, active subscriptions (FR-GEN-002-MVP).
    *   [x] Provide quick links to user and lead management sections.
*   [x] **Global Search (`/components/admin/layout/ADMIN_LAYOUT_PLAN.md` - part of header):
    *   [x] Implement UI for global search of users (all types) and leads by name/email (FR-GEN-003-MVP).
    *   [ ] Display search results and allow navigation to user/lead details. (Backend integration needed)
*   [x] **Audit Logs (`/app/admin/audit-logs/ADMIN_AUDIT_LOGS_PLAN.md`):
    *   [x] Display audit logs with filtering options (date range, performing admin, entity type: User/Lead) (FR-GEN-004-MVP).
*   [x] **Unified User Management UI (`/app/admin/users/ADMIN_USERS_PLAN.md`):
    *   [x] View list of all system users with pagination, sorting, filtering (by role(s), status) (FR-USER-001-MVP).
    *   [ ] View user details (profile, assigned role(s), subscription status if applicable, contact info, basic interaction log) (FR-USER-002-MVP, FR-CRM-001-MVP, FR-CRM-002-MVP).
    *   [ ] Form to create users manually, assign role(s) (FR-USER-003-MVP).
    *   [ ] Form to update user basic info, status, and manage assigned role(s) (FR-USER-004-MVP).
    *   [x] Functionality to (soft) delete users (Super Admin role only) (FR-USER-005-MVP).
*   [ ] **Lead Management UI (`/app/admin/leads/ADMIN_LEADS_PLAN.md`):
    *   [ ] View list of leads with pagination, sorting, filtering (FR-LEAD-002-MVP).
    *   [ ] Form to create leads manually (FR-LEAD-001-MVP).
    *   [ ] View lead details (FR-LEAD-003-MVP).
    *   [ ] Form to update lead info and status (FR-LEAD-004-MVP).
    *   [ ] Functionality to convert lead to a user (pre-fills user creation form, assigns default role) (FR-LEAD-005-MVP).
*   [x] **Subscription Management UI (Basic View/Cancellation) (`/app/admin/subscriptions/ADMIN_SUBSCRIPTIONS_PLAN.md`):
    *   [x] View subscription plans (FR-SUB-001-MVP).
    *   [x] View user subscriptions with admin-initiated cancellation (FR-SUB-002-MVP).
*   [x] **API Integration (`/lib/api/admin.ts`, `/lib/api/admin-types.ts`):
    *   [x] Create typed API client for admin endpoints.
    *   [x] Implement functions for all admin operations (CRUD users, audit logs, subscriptions, etc.).
    *   [ ] Add authentication headers and error handling.

**Admin Panel Status:** Core admin panel layout, navigation, and main pages implemented with mock data. Backend integration needed for real functionality.

## Phase 6: Layout Refactoring & Route Separation (COMPLETED)
**Goal:** Properly separate admin and user pages with different layouts and auth checks.

*   [x] **Middleware Implementation (`middleware.ts`):**
    *   Created Next.js middleware for route protection using NextAuth.
    *   Implemented separate auth checks for admin vs regular user routes.
    *   Added proper redirects for authenticated/unauthenticated users.
*   [x] **Auth Utilities (`/lib/auth/roles.ts`):**
    *   Created role-based auth utilities with TypeScript enums.
    *   Added functions for role checking: `isAdmin()`, `isSuperAdmin()`, `hasRole()`.
    *   Created route type detection utilities: `getRouteType()`, `isAdminRoute()`, `isProtectedRoute()`.
*   [x] **Protected Layout (`/app/(protected)/layout.tsx`):**
    *   Created dedicated layout for user-facing protected routes.
    *   Implemented server-side auth checks with proper redirects.
    *   Added UserNavbar specific to authenticated user pages.
*   [x] **User Navigation (`/components/layout/UserNavbar.tsx`):**
    *   Created separate navigation component for authenticated users.
    *   Added navigation to Dashboard, Calendar, Integrations, Settings.
    *   Implemented responsive design with mobile menu support.
*   [x] **Conditional Layout (`/components/layout/ConditionalLayout.tsx`):**
    *   Created smart layout component that conditionally shows navbar/footer.
    *   Only shows public navbar/footer on public routes (landing, auth pages).
    *   Prevents layout duplication on admin and protected routes.
*   [x] **Admin Layout Fix:**
    *   Fixed admin layout to not create duplicate HTML structure.
    *   Removed nested `<html>` and `<body>` tags from admin layout.
    *   Maintained proper admin-specific UI structure.
*   [x] **Public Navbar Enhancement:**
    *   Updated public navbar to hide on protected/admin routes.
    *   Added Dashboard link for authenticated users on public pages.
    *   Improved mobile navigation experience.
*   [x] **Admin Login Enhancement:**
    *   Created reusable AdminLoginForm component.
    *   Maintained existing admin login functionality with improved structure.

**Route Structure After Refactoring:**
- **Public Routes** (`/`, `/login`, `/register`): Use main navbar + footer
- **Protected User Routes** (`/dashboard`, `/calendar`, etc.): Use UserNavbar + protected layout
- **Admin Routes** (`/admin/**`): Use AdminLayout with complete admin UI

**Benefits Achieved:**
- Clear separation between admin and user interfaces
- Proper auth checks at middleware level
- No duplicate HTML structure or conflicting layouts
- Type-safe role-based access control utilities
- Responsive design maintained across all route types

## Phase 7: Frontend Cleanup & Refactoring (COMPLETED)
**Goal:** Remove redundant files, layouts, and code to create a cleaner, more maintainable frontend structure.

*   [x] **Removed ConditionalLayout Component:**
    *   Eliminated unnecessary complexity in layout chain
    *   Simplified root layout to just provide SessionProvider
    *   Each route group now handles its own layout directly

*   [x] **Simplified Route Protection:**
    *   Removed redundant auth checks from layout components
    *   Middleware now handles all route protection logic
    *   Eliminated duplication between middleware and layouts

*   [x] **Created BaseNavbar Component:**
    *   Extracted common navbar logic into reusable component
    *   Reduced code duplication between public and user navbars
    *   Improved maintainability of navigation components

*   [x] **Improved Layout Structure:**
    *   Created dedicated layout for auth routes (`(auth)/layout.tsx`)
    *   Simplified protected layout (removed redundant auth checks)
    *   Simplified admin layout (removed redundant auth checks)
    *   Added proper layout to landing page

*   [x] **Removed Redundant Components:**
    *   Deleted `ConditionalLayout.tsx` (unnecessary complexity)
    *   Deleted `ProtectedRoute.tsx` (middleware handles protection)
    *   Updated barrel exports to remove deleted components

*   [x] **Refactored Navigation Components:**
    *   Navbar and UserNavbar now extend BaseNavbar
    *   Removed route-based hiding logic from public navbar
    *   Consolidated mobile menu logic in BaseNavbar

*   [x] **Optimized Auth Flow:**
    *   Middleware handles all route protection
    *   No duplicate auth checks in layouts
    *   Cleaner separation of concerns

**Final Optimized Structure:**
```
app/
├── layout.tsx                    # Root layout (minimal, just SessionProvider)
├── page.tsx                      # Landing page (includes Navbar + Footer)
├── (auth)/
│   ├── layout.tsx                # Auth layout (Navbar + Footer wrapper)
│   ├── login/page.tsx            # Login page
│   └── register/page.tsx         # Register page
├── (protected)/
│   ├── layout.tsx                # Protected layout (UserNavbar wrapper)
│   ├── dashboard/page.tsx        # User dashboard
│   ├── calendar/page.tsx         # Calendar view
│   └── ...
└── admin/
    ├── layout.tsx                # Admin layout (AdminLayout wrapper)
    ├── login/page.tsx            # Admin login
    └── ...

components/layout/
├── BaseNavbar.tsx                # Shared navbar component
├── Navbar.tsx                    # Public navbar (extends BaseNavbar)
├── UserNavbar.tsx               # User navbar (extends BaseNavbar)
├── Footer.tsx                    # Footer component
└── index.ts                     # Barrel exports

middleware.ts                     # Centralized route protection
```

**Code Reduction Achieved:**
- Removed 2 redundant components (ConditionalLayout, ProtectedRoute)
- Eliminated ~150 lines of duplicate navbar code
- Simplified 3 layout components
- Centralized all auth logic in middleware
- Improved maintainability and readability
