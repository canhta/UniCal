# Integrations Feature Plan (Phase 3)

This plan details the UI and interaction for managing calendar integrations (Google, Microsoft Outlook) in the UniCal frontend.

## FRD Alignment
*   **FR3.2.1 Connect Google Calendar**
*   **FR3.2.2 Connect Microsoft Outlook/Teams Calendar**
*   **FR3.2.5 Manage Connected Accounts**
*   **FR3.5.4 Sync Control (Calendar Selection)**
*   **FR3.9.3 Sync Status/Error Notifications (Basic on page)**

## Core Page: `/integrations` (Protected Route)

This page will be a Server Component by default (`apps/frontend/src/app/(protected)/integrations/page.tsx`) to allow server-side data fetching for existing connections.

## UI Elements & Functionality

1.  **[ ] Display Connected Accounts Section:**
    *   **Data Fetching (SSR):** In `page.tsx`, fetch the list of currently connected accounts for the user from the backend API (e.g., `/api/integrations/accounts`).
    *   **UI:**
        *   If no accounts connected: Display a message like "You haven't connected any calendar accounts yet." and prominently show "Connect" buttons.
        *   If accounts are connected: List each account (e.g., "Google Calendar - user@example.com", "Microsoft Outlook - work@example.com").
            *   Display platform logo (Google, Outlook).
            *   Display account identifier (email).
            *   **FR3.9.3 Sync Status:** Display a basic status indicator (e.g., "Connected", "Syncing", "Needs Re-authentication", "Error"). This status would come from the backend API response for each account.
            *   "Disconnect" button for each account.
            *   "Manage Calendars" or "Select Calendars to Sync" button/link for each account.
    *   **Component:** `apps/frontend/src/components/integrations/ConnectedAccountCard.tsx` (Client Component if it has interactive elements like a disconnect button that triggers client-side actions before API call, or if status updates dynamically without full page reload).

2.  **[ ] Connect New Account Section:**
    *   **UI:**
        *   "Connect Google Calendar" button.
        *   "Connect Microsoft Outlook Calendar" button.
    *   **Action:**
        *   Clicking these buttons should navigate the user to the backend OAuth initiation URL (e.g., `/api/auth/google/connect`, `/api/auth/microsoft/connect`). The backend will handle the OAuth dance and redirect back to a predefined callback URL (e.g., `/integrations?status=success_google` or `/integrations?status=error_google`).
    *   **Feedback:** The `/integrations` page should be able to display success or error messages based on query parameters from the OAuth callback. This can be handled in the Server Component (`page.tsx`) by reading `searchParams`.

3.  **[ ] Disconnect Account Functionality:**
    *   **UI:** "Disconnect" button on each `ConnectedAccountCard`.
    *   **Action (Client-Side initiated, calls API):**
        *   Show a confirmation modal (`components/ui/Modal.tsx`).
        *   On confirmation, make an API call to the backend to disconnect the account (e.g., `DELETE /api/integrations/accounts/{accountId}`).
        *   On success, refresh the list of connected accounts. This can be done by:
            *   Server-side: `router.refresh()` if using Next.js App Router to re-fetch data in the Server Component.
            *   Client-side: If using a client-side state manager for the list, update it directly and potentially re-fetch.

4.  **[ ] Manage Calendars / Select Calendars to Sync (FR3.5.4):**
    *   **Navigation:** Clicking "Manage Calendars" for a connected account could either:
        *   Navigate to a new page: ` /integrations/{accountId}/calendars` (Server Component to fetch calendars for that account).
        *   Open a modal (`components/ui/Modal.tsx`) on the current page (modal content fetched client-side or pre-fetched if data is small).
    *   **UI (Modal or New Page):**
        *   List all calendars available under the selected connected account (e.g., "Personal", "Work", "Family" for Google).
        *   Each calendar should have a checkbox (`components/ui/Checkbox.tsx`) to indicate if it should be synced with UniCal.
        *   Display current sync status/selection.
        *   "Save" button.
    *   **Data Fetching:** API endpoint to get calendars for a specific connected account (e.g., `GET /api/integrations/accounts/{accountId}/calendars`).
    *   **Action:** Clicking "Save" makes an API call to update the sync preferences for that account's calendars (e.g., `PUT /api/integrations/accounts/{accountId}/calendars`).
    *   **SSR Preference:** If navigating to a new page, this page can be a Server Component, fetching the list of calendars and their current sync state on the server.

## Components to Create/Use:

*   `apps/frontend/src/app/(protected)/integrations/page.tsx` (Main Server Component)
*   `apps/frontend/src/components/integrations/ConnectAccountButtons.tsx` (Client Component for the connect buttons, or directly in `page.tsx` if simple links)
*   `apps/frontend/src/components/integrations/ConnectedAccountCard.tsx` (Client Component for displaying account info and disconnect action)
*   `apps/frontend/src/components/integrations/SelectCalendarsModal.tsx` or `apps/frontend/src/app/(protected)/integrations/[accountId]/calendars/page.tsx` (for FR3.5.4)
*   `components/ui/Button.tsx`
*   `components/ui/Modal.tsx` (for confirmations, selecting calendars)
*   `components/ui/Checkbox.tsx`
*   `components/ui/Card.tsx`
*   `components/ui/Alert.tsx` (for displaying success/error messages from OAuth callback or API calls)

## API Endpoints (Frontend Perspective - to be consumed):

*   `GET /api/integrations/accounts` (Lists connected accounts with their status)
*   `GET /api/auth/google/connect` (Initiates Google OAuth - frontend navigates here)
*   `GET /api/auth/microsoft/connect` (Initiates Microsoft OAuth - frontend navigates here)
*   `DELETE /api/integrations/accounts/{accountId}` (Disconnects an account)
*   `GET /api/integrations/accounts/{accountId}/calendars` (Lists calendars for a specific account)
*   `PUT /api/integrations/accounts/{accountId}/calendars` (Updates sync preferences for calendars)

## Implementation Notes:
*   **SSR for Initial Load:** The main `/integrations` page should load existing connected accounts server-side for faster perceived performance and SEO (if applicable).
*   **Client-Side Interactivity:** Actions like disconnecting, opening modals for calendar selection, and saving calendar selections will involve client-side JavaScript and API calls.
*   **Optimistic Updates:** For actions like disconnecting or changing sync preferences, consider optimistic UI updates for a smoother experience, then reconciling with the actual API response.
*   **Error Handling:** Clearly display errors from API calls (e.g., failed to disconnect, failed to save preferences) using Alert components.
*   **Loading States:** Show loading indicators (`components/ui/Spinner.tsx`) during API calls.
