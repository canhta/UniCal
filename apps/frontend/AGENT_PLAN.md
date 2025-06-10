# AI Agent Implementation Plan: UniCal Frontend (Next.js)

This plan guides frontend development, aligning with backend phases, FRD.md, BRD.md, Challenges.md, and SETUP_PLAN.md.

**Core Principles:**
*   **Component-Based:** Reusable components, clear separation of concerns.
*   **Best Practices:** React/Next.js standards, state management, performance, A11y, testing.
*   **TODO-Driven:** Use `[MODULE_OR_FEATURE_NAME]_PLAN.md` in relevant directories for detailed tasks.
*   **Iterative Refinement:** Address UI/UX challenges progressively, informed by the Challenges.md.
*   **Phased Rollout:** Align with FRD and backend capabilities, focusing on initial product features first.

**Note on FRD Alignment:** The initial product focuses on simplified email-only login, then SSO (Google/Microsoft), unified calendar view, core event CRUD, and two-way sync for Google/Outlook. Advanced features are post-initial product.

## Phase 1: Core Setup & Foundational UI (Aligns with SETUP_PLAN Phases 1-2)

1.  **Project Setup Verification:** Confirm Next.js 15 (App Router), TypeScript, Tailwind CSS, ESLint, Prettier are correctly configured as per `SETUP_PLAN.md`.
2.  **Environment Variables:** Setup `.env.local` with `NEXT_PUBLIC_API_BASE_URL` and placeholders for Auth0 variables (to be filled in Phase 2).
3.  **Basic Layout & Global Styles (`apps/frontend/app/layout.tsx`, `apps/frontend/app/globals.css`):**
    *   Implement main application layout using Tailwind CSS.
    *   Define global styles and integrate custom fonts (as per `SETUP_PLAN.md`).
4.  **UI Component Library Structure (`apps/frontend/src/components/ui/UI_COMPONENTS_PLAN.md`):**
    *   Create initial plan for common UI components (Button, Input, Modal, Card, Dropdowns, Toggles).
    *   Implement a few basic components (e.g., Button, Input) using Tailwind CSS and @headlessui/react.
5.  **Core Directory Structure:**
    *   `apps/frontend/src/components/` (for UI, features, layout)
    *   `apps/frontend/src/lib/` (for API client, utils, hooks, auth)
    *   `apps/frontend/src/app/` (for pages/routes)
    *   `apps/frontend/src/styles/` (if more specific global styles needed beyond `globals.css`)
    *   `apps/frontend/src/contexts/` (for React Context if not using a global state manager initially)

## Phase 2: Authentication & Initial Page Structure (Aligns with SETUP_PLAN Phase 3 & 7)

1.  **Authentication Setup (`apps/frontend/src/lib/auth/AUTH_FEATURE_PLAN.md`):
    *   **FR3.1.0 Simplified Email-Only Login (UI Focus):** Implement UI for email-only login. This will initially be a placeholder or a direct call to a simplified backend endpoint if available. *Defer full Auth0 integration for this step if backend supports a simpler JWT mechanism first, otherwise proceed with Auth0 for simplified flow.* 
    *   **FR3.1.3 Single Sign-On (SSO) - Google & Microsoft:**
        *   Integrate `@auth0/nextjs-auth0` as per `SETUP_PLAN.md` (environment variables, API route, UserProvider).
        *   Implement UI for "Sign in with Google" and "Sign in with Microsoft" buttons.
        *   Handle Auth0 callback (`/api/auth/callback`).
        *   Implement basic logout functionality.
        *   Create `apps/frontend/src/lib/auth/AUTH_FEATURE_PLAN.md` with detailed steps.
2.  **API Client Setup (`apps/frontend/src/lib/api/API_CLIENT_PLAN.md`):
    *   Create a basic API client service/utility functions for making requests to the backend (`NEXT_PUBLIC_API_BASE_URL`).
    *   Plan for handling authenticated requests (attaching Auth0 access token).
    *   Create `apps/frontend/src/lib/api/API_CLIENT_PLAN.md`.
3.  **Initial Page Structure (`apps/frontend/app/`):
    *   `app/page.tsx` (Public landing page).
    *   `app/(protected)/dashboard/page.tsx` (Placeholder for main dashboard after login - protected route).
    *   `app/(auth)/login/page.tsx` (If implementing a dedicated login page for simplified/SSO flow).
    *   Implement basic protected route logic using `useUser` or `getSession`.
    *   Utilize `loading.tsx` and `error.tsx` conventions.
4.  **Layout Components (`apps/frontend/src/components/layout/LAYOUT_COMPONENTS_PLAN.md`):
    *   Develop Navbar and Footer components.
    *   Integrate authentication status (display user info, login/logout buttons).
    *   Create `apps/frontend/src/components/layout/LAYOUT_COMPONENTS_PLAN.md`.

## Phase 3: Core Calendar Functionality (Aligns with SETUP_PLAN Phase 4 & FRD Core Features)

1.  **Integrations Management UI (`apps/frontend/src/app/(protected)/integrations/INTEGRATIONS_FEATURE_PLAN.md`):
    *   **FR3.2.1 & FR3.2.2 Connect Google/Microsoft Calendar:** UI to initiate OAuth flow (buttons linking to backend endpoints).
    *   **FR3.2.5 Manage Connected Accounts:** UI to display connected calendar accounts and a "Disconnect" option.
    *   **FR3.5.4 Sync Control (Calendar Selection):** UI to list user's calendars from a connected account and allow selection for syncing (checkboxes).
    *   Create `apps/frontend/src/app/(protected)/integrations/INTEGRATIONS_FEATURE_PLAN.md`.
2.  **Unified Calendar View UI (`apps/frontend/src/app/(protected)/calendar/CALENDAR_FEATURE_PLAN.md`):
    *   **FR3.3.1 Standard Calendar Views:** Integrate `@event-calendar/core` (and plugins like daygrid, timegrid, list, interaction) as per `SETUP_PLAN.md`.
        *   Implement Day, Week, Month views with navigation.
        *   Fetch and display aggregated event data from the backend API.
    *   **FR3.3.2 Visual Differentiation:** Implement basic, fixed color-coding for events from different sources (Google/Outlook).
    *   **FR3.3.3 Calendar Visibility Toggle:** UI to show/hide events from specific selected native calendars.
    *   **FR3.3.4 Event Display & Details Modal:** Display essential event info in views. On click, show a modal with Title, Start/End, Description, Location, Source. Include Edit/Delete buttons (stubbed initially).
    *   **FR3.3.5 Time Zone Support:** Ensure frontend displays events in the user's browser local time zone (backend provides UTC).
    *   Create `apps/frontend/src/app/(protected)/calendar/CALENDAR_FEATURE_PLAN.md`.
3.  **Event Management UI (within `CALENDAR_FEATURE_PLAN.md`):
    *   **FR3.4.1 Create Event:** Modal/form for Title, Start/End, All-day, Target Calendar (dropdown of user's connected native calendars), Description, Location. API call to create.
    *   **FR3.4.3 Update Event:** Modal/form (pre-filled) to edit core event fields. API call to update.
    *   **FR3.4.4 Delete Event:** Confirmation dialog and API call to delete.
    *   **FR3.4.5 Recurring Events (Display):** Ensure recurring events (master and instances/exceptions fetched from backend) are displayed correctly. (Creation/editing of recurrence rules from UniCal is Post-Initial Product).
    *   **FR3.7.1 Privacy Indication (Display):** Visually indicate "private" events if this information is provided by the backend.
    *   **FR3.9.1 Event Reminders (Display):** Display reminder information from native events in the event details modal (text only).

## Phase 4: State Management, Refinement & Testing Setup (Aligns with SETUP_PLAN Phase 5, 8, 9, 10)

1.  **State Management (`apps/frontend/src/lib/state/STATE_MANAGEMENT_PLAN.md`):
    *   Evaluate and implement a global state manager (e.g., Zustand, Jotai) if React Context becomes insufficient for calendar state, user preferences, etc.
    *   Manage calendar view state, event data, selected filters, UI states.
    *   Create `apps/frontend/src/lib/state/STATE_MANAGEMENT_PLAN.md`.
2.  **UI Refinement & Responsiveness:**
    *   Thoroughly test and fix responsiveness across common screen sizes.
    *   Improve overall look and feel, transitions, and micro-interactions.
3.  **Error Handling & Loading States:**
    *   Implement global error display (e.g., toasts/notifications for API errors).
    *   Ensure consistent loading indicators for data fetching and mutations.
4.  **Accessibility (A11y) Review:**
    *   Perform an initial A11y audit using browser tools and linters. Address critical issues.
5.  **Linting & Formatting:** Ensure ESLint and Prettier are consistently applied.
6.  **Testing Setup (`TESTING_SETUP_PLAN.md`):
    *   Configure Jest and React Testing Library as per `SETUP_PLAN.md`.
    *   Write initial unit/integration tests for key components and utility functions.
    *   Create `TESTING_SETUP_PLAN.md`.
7.  **SSR/Optimization Review:** Review usage of Server Components, Client Components, and Next.js optimization features (`next/image`, `next/font`).

## Phase 5: Advanced Features (Post-Initial Product - Placeholder for Future)

*   This phase will cover features marked as "Later Phase" or "Post-Initial Product" in the FRD, such as:
    *   Full Email/Password User Account Management (Registration, Password Reset, Profile Management - FR3.1.1, FR3.1.2, FR3.1.4, FR3.1.5)
    *   Advanced Calendar View Features (Agenda view, customizable colors)
    *   Advanced Event Management (Multi-calendar event creation, rich text, attendee management from UCS, creating/editing recurrence rules from UCS)
    *   Personal Booking Page
    *   Granular Privacy Controls within UCS
    *   AI-Driven Features
    *   Task Integration
    *   (Each will have its own `[FEATURE_NAME]_PLAN.md`)

## General Agent Workflow:

1.  **Understand Phase Goals:** For each phase, understand the objectives based on this plan and the FRD.
2.  **Create/Update Detailed Plans:** For each numbered item that refers to a `*_PLAN.md` file, create that Markdown file in the specified directory. Populate it with detailed TODOs, breaking down the feature/module into smaller, actionable tasks. These plans should reference specific FRD requirements (e.g., "Implement FR3.2.1 UI button").
3.  **Implement Incrementally:** Work through the TODOs in the detailed plans. Create/update components, pages, services, and types.
4.  **API Integration:** Integrate with backend API endpoints as they become available. Mock data or use a mock server if the backend is not ready for a specific feature, but clearly mark this for later integration.
5.  **Testing:** Write unit and integration tests for new UI components and logic.
6.  **Commit Frequently:** Make small, logical commits.
7.  **Address Challenges:** Refer to `Challenges.md` for guidance on technical hurdles (e.g., time zone handling, API rate limits from a frontend perspective like managing loading states during polling).
8.  **Iterate:** UI/UX is iterative. Be prepared to refine based on visual output and usability.

*(Agent: Start by creating the directory structure and the initial set of `*_PLAN.md` files mentioned in Phase 1 and 2, then proceed with implementation.)*
