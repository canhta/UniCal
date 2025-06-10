# AI Agent Implementation Plan: UniCal Frontend (Next.js)

This plan guides frontend development, aligning with backend phases and FRD.md.

**Core Principles:**
*   **Component-Based:** Reusable components, clear separation of concerns.
*   **Best Practices:** React/Next.js standards, state management, performance, A11y, testing.
*   **TODO-Driven:** Use `[FEATURE_NAME]_PLAN.md` in feature directories for detailed tasks.
*   **Iterative Refinement:** Address UI/UX challenges progressively.

**Note on FRD Deviation:** Aligns with backend: simplified login (M1), then SSO (M2).

## Phase 1: Setup & Core UI Infrastructure

1.  **Project Setup:** Verify Next.js project (ESLint, Prettier, TS, Tailwind CSS).
2.  **Layout & Navigation:** Main layout (`app/layout.tsx`), basic navigation (placeholders).
3.  **State Management (`STATE_MANAGEMENT_PLAN.md`):** Setup (Zustand/Jotai/etc.). Initial global state (auth status).
4.  **API Client (`apps/frontend/src/lib/api/`):** Setup (`react-query`/`swr`). Initial types for initial phase APIs.
5.  **UI Components (`UI_COMPONENTS_PLAN.md`):** Core reusable components (Button, Input, Modal).

## Phase 2: Staged Feature Implementation (UI & Interaction)

**General Guidelines:** Create/update `[FEATURE_NAME]_PLAN.md`. Implement UI, integrate with API client, form validation, tests, responsiveness, basic A11y.

---
**Simplified User Login & Basic Setup**
*Goal: Email-only login UI, basic session management.*

1.  **Auth UI (Simplified - `AUTH_FEATURE_PLAN.md`):** Login page/form (email only). Call `/auth/simple-login`. Store JWT. Protected route. Logout.
---
**Single Sign-On (SSO) Implementation**
*Goal: UI for Google & Microsoft SSO.*

1.  **Auth UI (SSO - `AUTH_FEATURE_PLAN.md`):** "Sign in with Google/Microsoft" buttons. Redirect to backend OAuth. Callback page/route (`/auth/callback`) to update auth state.
---
**Core Scheduling Functionalities**
*Goal: UI for calendar connectivity, unified view, event management.*

1.  **Integrations UI (`INTEGRATIONS_FEATURE_PLAN.md`):** Connect/disconnect Google/Microsoft calendars. List accounts. (Optional: Select native calendars).
2.  **Calendar View UI (`CALENDAR_FEATURE_PLAN.md`):** Calendar library (FullCalendar/etc.). Day/Week/Month views. Fetch/display events. Visual differentiation. Visibility toggles. Event Details Modal. Time zone handling.
3.  **Event Management UI (in `CALENDAR_FEATURE_PLAN.md`):** Create/Edit/Delete event modals/forms. API calls. Recurrence/privacy/reminder display.
---
**Full Email/Password Authentication & Password Management (FRD)**
*Goal: UI for standard email/password auth, if needed.*

1.  **Auth UI (Full - `AUTH_FEATURE_PLAN.md`):** Registration page. Update Login page (add password). Forgot/Reset Password pages.
2.  **Account UI (`ACCOUNT_FEATURE_PLAN.md`):** "Account Settings" page with password change form.
---

## Phase 3: UI Refinement & State Management Hardening

1.  **Responsive Design:** Thorough testing and fixes.
2.  **Error Handling:** Global error display (toasts). Loading states.
3.  **Accessibility (A11y):** Audit and fixes.
4.  **State Management:** Optimization, review `STATE_MANAGEMENT_PLAN.md`.

## Phase 4: Integration & Testing

1.  **Testing:** Comprehensive component and E2E tests. High coverage. CI setup.
2.  **Code Quality:** Linting, formatting (CI). Peer reviews.
3.  **Build & Deployment:** Production build. Deployment setup (Vercel/Netlify).

**Agent Workflow:**
1.  **Phase 1:** Execute setup tasks.
2.  **Populate Feature Plans:** For each feature, fill `[FEATURE_NAME]_PLAN.md` with TODOs for the **current phase**, adapting FRD to frontend context & backend API for that phase.
3.  **Phase 2 (Phased Implementation):** Implement features per phase plans. Test. Commit.
4.  **Phase 3 (Refinement):** Refine UI/UX, state, error handling.
5.  **Phase 4 (Finalize):** Final testing, docs, deployment prep.

*(Agent: Adapt FRD requirements to populate feature plans per phase, considering backend API availability.)*
