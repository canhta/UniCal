# AI Agent Implementation Plan: UniCal Frontend (Next.js)

This document outlines the development plan for the UniCal frontend, focusing on MVP features as defined in `FRD.md` and consuming the backend API.

## Phase 1: Setup & Core UI Infrastructure

1.  **Project Initialization & Setup (Assumed mostly complete)**
    *   Verify Next.js project structure, ESLint, Prettier, TypeScript configuration.
    *   Setup Tailwind CSS (or chosen styling solution).
2.  **Core Layout & Navigation**
    *   Implement main application layout (`app/layout.tsx`) including header, sidebar (if applicable), and main content area.
    *   Basic navigation structure (e.g., links to Calendar, Integrations, Account Settings).
3.  **State Management**
    *   Choose and set up a state management solution (e.g., Zustand, Jotai, Redux Toolkit, or React Context for simpler needs).
    *   Manage global state for: user authentication status, connected accounts, selected calendar visibility.
4.  **API Client/Service**
    *   Create a service/utility functions to interact with the backend API (e.g., using `fetch` or a library like `axios` or `react-query`/`swr` for data fetching and caching).
    *   Define types/interfaces for API request/response payloads based on backend OpenAPI spec.
5.  **Authentication Flow UI**
    *   Create pages/components for:
        *   Registration (`/register`)
        *   Login (`/login`)
        *   Password Reset Request (`/forgot-password`)
        *   Password Reset Form (`/reset-password/:token`)
    *   Implement forms with validation (e.g., using `react-hook-form` and `zod`).
    *   Handle JWT storage (e.g., HttpOnly cookies managed by backend, or secure localStorage/sessionStorage for frontend-managed tokens) and inclusion in API requests.
    *   Protected routes/redirects based on auth state.
6.  **UI Component Library (Optional but Recommended)**
    *   Consider using a component library (e.g., Shadcn/ui, Material UI, Ant Design) or build common UI elements (buttons, modals, inputs, dropdowns, etc.).

## Phase 2: Implementing Core MVP Features (UI & Interaction)

1.  **User Account Management (FRD 3.1)**
    *   **Profile Management (FRD 3.1.5 - Password Change):**
        *   Create an "Account Settings" page.
        *   Form for changing password (current password, new password, confirm new password).
2.  **Multi-Platform Connectivity (FRD 3.2, 3.5.4)**
    *   **"Integrations" or "Connected Accounts" Page (`/integrations`):**
        *   Display buttons to "Connect Google Calendar" and "Connect Microsoft Calendar". Clicking these should redirect to the backend OAuth initiation endpoints.
        *   List currently connected accounts (fetched from backend API - FRD 3.2.5).
        *   For each connected account, show platform, account identifier, and a "Disconnect" button.
        *   Display basic sync status if provided by backend (e.g., "Last checked: [time]").
    *   **Calendar Selection UI (FRD 3.5.4):**
        *   After connecting an account, or when managing an existing connection, allow users to see a list of their native calendars (fetched from backend) with checkboxes to select which ones to sync/display.
        *   Save selection to the backend.
    *   **Authentication Error Handling (FRD 3.2.6):**
        *   Display user-friendly error messages if OAuth connection fails (e.g., based on query params from backend redirect).
3.  **Unified Calendar View (FRD 3.3)**
    *   **Main Calendar Page (`/calendar` or `/`):**
        *   Integrate a calendar component library (e.g., FullCalendar, TuiCalendar, react-big-calendar).
        *   **Standard Views (FRD 3.3.1):** Implement Day, Week, Month views. Buttons to switch between views. Navigation to previous/next periods.
        *   Fetch aggregated event data from the backend API for the current view and date range.
        *   **Visual Differentiation (FRD 3.3.2):** Assign colors to events based on their `platformSource` (e.g., Google blue, Outlook green). This logic will be in the frontend rendering.
        *   **Calendar Visibility Toggle (FRD 3.3.3):**
            *   Display a list of connected and selected native calendars (e.g., in a sidebar).
            *   Each with a checkbox to toggle its visibility on the main calendar view.
            *   Store visibility preferences locally (e.g., localStorage or state management) and filter events before passing to the calendar component.
        *   **Event Display (FRD 3.3.4):**
            *   Display event title and start time in calendar cells.
            *   On hover, show a tooltip with full title, start/end time, source calendar.
            *   On click, open an Event Details Modal.
        *   **Time Zone Support (FRD 3.3.5):**
            *   The calendar library should handle displaying UTC times (from backend) in the user's browser-detected local time zone.
4.  **Event Management (CRUD - FRD 3.4)**
    *   **Event Details Modal:**
        *   Triggered by clicking an event on the calendar.
        *   Displays: Title, Start/End Date & Time, Description (plain text), Location (plain text), Source Calendar, Reminder Info (FRD 3.9.1).
        *   Buttons for "Edit" and "Delete".
    *   **Event Creation/Editing Modal (FRD 3.4.1, 3.4.3):**
        *   Can be triggered by clicking a time slot, a "New Event" button, or the "Edit" button in the details modal.
        *   Form fields: Title, Start date/time, End date/time, All-day toggle, Target Calendar (dropdown of user's individual connected native calendars fetched from backend), Description, Location.
        *   On save (create/update), send data to the backend API.
        *   Refresh calendar view after successful CUD operation.
    *   **Delete Event (FRD 3.4.4):**
        *   Confirmation prompt before deleting.
        *   Call backend delete endpoint.
    *   **Recurring Events (FRD 3.4.5 - Basic Display & Instance Interaction):**
        *   The calendar library should be able to take recurrence rules (fetched from backend) and expand them for display.
        *   When editing/deleting a single instance of a recurring event, the modal should reflect this, and the API call should target the specific instance.
5.  **Privacy Controls (FRD 3.7.1 - Basic Indication)**
    *   Event Details Modal can display if an event is marked private (based on data from backend).
6.  **Notifications (FRD 3.9.1 - Display Reminders)**
    *   Display reminder information (text) in the Event Details Modal.

## Phase 3: UI Refinement & State Management

1.  **Responsive Design:**
    *   Ensure the application is usable across different screen sizes (desktop, tablet, mobile).
2.  **Error Handling & User Feedback:**
    *   Implement global error handling for API requests (e.g., toast notifications for errors).
    *   Provide loading states for data fetching and mutations.
    *   Clear feedback on form submissions (success/error messages).
3.  **Accessibility (A11y):**
    *   Basic accessibility considerations (semantic HTML, keyboard navigation, ARIA attributes where appropriate).
4.  **State Management Optimization:**
    *   Refine state management logic for performance and maintainability.
    *   Optimize re-renders.

## Phase 4: Integration & Testing

1.  **Testing:**
    *   Component tests (e.g., using React Testing Library, Jest).
    *   Consider E2E tests (e.g., using Cypress, Playwright) for critical user flows.
2.  **Code Quality:**
    *   Enforce linting (ESLint) and formatting (Prettier) via CI.
3.  **Build & Deployment:**
    *   Configure Next.js build process.
    *   Setup deployment (e.g., to Vercel, Netlify, or custom Docker setup).

This plan will be iterated upon as development progresses and in conjunction with backend API development.
