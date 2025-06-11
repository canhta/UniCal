<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/frontend/AGENT_PLAN.md -->
# AI Agent Implementation Plan: UniCal Frontend (Next.js)

This plan guides frontend development, aligning with backend phases, FRD.md, BRD.md, Challenges.md, and SETUP_PLAN.md.

**Core Principles:**
*   **Component-Based:** Reusable components, clear separation of concerns.
*   **Best Practices:** React/Next.js standards, state management, performance, A11y, testing.
*   **TODO-Driven:** Use `[MODULE_OR_FEATURE_NAME]_PLAN.md` in relevant directories for detailed tasks. Populate these from this master plan.
*   **Iterative Refinement:** Address UI/UX challenges progressively, informed by Challenges.md.
*   **Phased Rollout:** Align with FRD and backend capabilities.

**Note on FRD Alignment:** Initial product: simplified/SSO login, unified calendar, core event CRUD, Google/Outlook sync. Advanced features post-initial product.

## Phase 1: Core Setup & Foundational UI (Aligns with SETUP_PLAN Phases 1-2)
**Goal:** Establish a runnable Next.js project with basic layout, UI component structure, and environment setup.

*   [ ] **Project Setup Verification:** Confirm Next.js 15 (App Router), TypeScript, Tailwind CSS, ESLint, Prettier (per `SETUP_PLAN.md`).
*   [ ] **Environment Variables:** Setup `.env.local`: `NEXT_PUBLIC_API_BASE_URL`, Auth0 placeholders (fill in Phase 2).
*   [ ] **Basic Layout & Global Styles (`app/layout.tsx`, `app/globals.css`):** Implement main layout (Tailwind), global styles, custom fonts (per `SETUP_PLAN.md`).
*   [ ] **UI Component Library Structure (`src/components/ui/UI_COMPONENTS_PLAN.md`):** Plan common UI components. Implement basic Button, Input (Tailwind, @headlessui/react).
*   [ ] **Core Directory Structure:** Establish `src/components/`, `src/lib/`, `src/app/`, `src/styles/`, `src/contexts/`.

## Phase 2: Authentication & Initial Page Structure (Aligns with SETUP_PLAN Phase 3 & 7)
**Goal:** Implement user authentication (primarily Auth0 SSO) and create basic page structure with protected routes.

*   [ ] **Authentication Setup (`src/lib/auth/AUTH_FEATURE_PLAN.md`):
    *   **FR3.1.3 SSO (Google & Microsoft):** Integrate `@auth0/nextjs-auth0` (env vars, API route, UserProvider). Implement UI for "Sign in with Google/Microsoft" buttons. Handle Auth0 callback. Implement logout.
    *   **FR3.1.0 Simplified Email-Only Login (UI Focus):** UI for email login. *If backend supports non-Auth0 simple JWT, implement; otherwise, Auth0 handles this via its email/passwordless options or by users selecting Google/Microsoft.* Update `AUTH_FEATURE_PLAN.md`.
*   [ ] **API Client Setup (`src/lib/api/API_CLIENT_PLAN.md`):** Create API client for backend requests (`NEXT_PUBLIC_API_BASE_URL`). Plan for authenticated requests (Auth0 access token). Update `API_CLIENT_PLAN.md`.
*   [ ] **Initial Page Structure (`app/`):
    *   `app/page.tsx` (Public landing).
    *   `app/(protected)/dashboard/page.tsx` (Placeholder dashboard - protected).
    *   `app/(auth)/login/page.tsx` (If dedicated login page for simplified/SSO).
    *   Implement protected route logic (`useUser` or `getSession`). Use `loading.tsx`, `error.tsx`.
*   [ ] **Layout Components (`src/components/layout/LAYOUT_COMPONENTS_PLAN.md`):** Develop Navbar, Footer. Integrate auth status (user info, login/logout). Update `LAYOUT_COMPONENTS_PLAN.md`.

## Phase 3: Core Calendar Functionality (Aligns with SETUP_PLAN Phase 4 & FRD Core Features)
**Goal:** Implement UI for connecting calendar accounts, viewing aggregated calendars, and managing events.

*   [ ] **Integrations Management UI (`src/app/(protected)/integrations/INTEGRATIONS_FEATURE_PLAN.md`):
    *   **FR3.2.1 & FR3.2.2 Connect Google/Microsoft Calendar:** UI to initiate OAuth (buttons to backend endpoints).
    *   **FR3.2.5 Manage Connected Accounts:** UI to display connected accounts, "Disconnect" option.
    *   **FR3.5.4 Sync Control (Calendar Selection):** UI to list user's native calendars, allow selection for syncing.
    *   Update `INTEGRATIONS_FEATURE_PLAN.md`.
*   [ ] **Unified Calendar View UI (`src/app/(protected)/calendar/CALENDAR_FEATURE_PLAN.md`):
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

*   [ ] **State Management (`src/lib/state/STATE_MANAGEMENT_PLAN.md`):
    *   Implement global state manager (e.g., Zustand, Jotai) for calendar state, user preferences. Update `STATE_MANAGEMENT_PLAN.md`.
*   [ ] **UI Refinement & Responsiveness:** Test/fix responsiveness. Improve look & feel, transitions.
*   [ ] **Error Handling & Loading States:** Implement global error display (toasts/notifications). Consistent loading indicators.
*   [ ] **Accessibility (A11y) Review:** Initial A11y audit. Address critical issues.
*   [ ] **Linting & Formatting:** Ensure consistent ESLint, Prettier application.
*   [ ] **Testing Setup (`TESTING_SETUP_PLAN.md`):
    *   Configure Jest & React Testing Library. Write initial unit/integration tests. Update `TESTING_SETUP_PLAN.md`.
*   [ ] **SSR/Optimization Review:** Review Server/Client Components, Next.js optimizations.

## Phase 5: Advanced Features (Post-Initial Product - Placeholder)
**Goal:** Implement features beyond the initial product scope, as defined in FRD.
*   Features: Full Email/Password Account Management (FR3.1.1, FR3.1.2, FR3.1.4, FR3.1.5), Advanced Calendar Views, Advanced Event Management, Personal Booking Page, Granular Privacy, AI Features, Task Integration.
*   (Each will have its own `[FEATURE_NAME]_PLAN.md`)

## General Agent Workflow:
1.  **Understand Phase Goals:** Internalize objectives for each phase.
2.  **Create/Update Detailed Plans:** For items referencing `*_PLAN.md`, create/update that file with detailed, actionable TODOs, linking to FRD requirements.
3.  **Implement Incrementally:** Execute TODOs. Create/update components, pages, services. Integrate with backend APIs (mock if necessary, mark for later real integration).
4.  **Testing:** Write unit/integration tests concurrently.
5.  **Commit Frequently:** Small, logical commits with clear messages.
6.  **Address Challenges:** Refer to `Challenges.md` for guidance.
7.  **Iterate:** Refine UI/UX based on visual output and usability.
8.  **Seek Clarification:** If a task is ambiguous, ask before proceeding.

*(Agent: Start by creating directory structure and initial `*_PLAN.md` files for Phase 1 & 2, then proceed with implementation.)*
