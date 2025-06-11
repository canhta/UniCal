<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/frontend/features/notifications/NOTIFICATIONS_FEATURE_PLAN.md -->
# Notifications Feature Plan (Frontend)

**Overall Goal:** Implement a frontend system to display relevant notifications to the user, initially focusing on sync status and errors, and evolving towards a comprehensive notification center.

## 1. Core Requirements & AI Agent Actionables

*   **[ ] Goal:** Display sync/account status and error notifications, primarily on the "Connected Accounts" page.
    *   **Action:** AI will implement components and logic to fetch and display these notifications.
*   **[ ] Goal:** Ensure notifications are clear, concise, and actionable.
    *   **Action:** AI will design notification messages and UI to be easily understandable and guide users if action is needed.

## 2. Phase 1: Contextual Notifications (MVP)

*   **[ ] Goal:** Create a reusable `NotificationItem.tsx` component.
    *   **Action:** AI will develop this component with props for `message`, `type` (error, warning, info, success), `timestamp`, and an optional `onDismiss` handler.
    *   **Action:** AI will style the component to visually differentiate notification types.
*   **[ ] Goal:** Display notifications on the "Connected Accounts" page (`/integrations`).
    *   **Action:** AI will modify `apps/frontend/app/(protected)/integrations/page.tsx` to fetch and display notifications related to account connections or sync statuses.
    *   **Action:** AI will ensure notifications are displayed prominently, potentially near affected accounts.
*   **[ ] Goal:** Implement data fetching for contextual notifications.
    *   **Action:** AI will use the API client (from `API_CLIENT_PLAN.md`) to call `GET /api/notifications?context=integrations`.
    *   **Action:** AI will handle the response, expecting data like: `id`, `message`, `type`, `timestamp`, `isRead`, `link` (optional).
*   **[ ] Constraint:** No dedicated global notification center in this phase.

## 3. Phase 2: In-App Notification Center (Post-MVP)

*   **[ ] Goal:** Implement a global notification indicator and panel.
    *   **Action:** AI will add a notification bell icon (e.g., in `MainLayout.tsx`) with an unread count badge.
    *   **Action:** AI will create a panel/dropdown that lists recent notifications using `NotificationItem.tsx`.
*   **[ ] Goal:** Implement "mark as read" functionality.
    *   **Action:** AI will enable marking notifications as read (individually or all) via `PATCH /api/notifications` (body: `{ ids: ["id1"], isRead: true }`).
*   **[ ] Goal:** Implement data fetching for the notification panel.
    *   **Action:** AI will fetch all/recent unread notifications using `GET /api/notifications?status=unread`.
*   **[ ] Goal (Optional Enhancement):** Implement real-time updates.
    *   **Action:** AI will investigate WebSocket integration for pushing new notifications.
*   **[ ] Goal (Optional Enhancement):** Implement toast/snackbar notifications for transient feedback.
    *   **Action:** AI will integrate a library like `react-hot-toast` or similar for temporary messages.

## 4. State Management

*   **[ ] Phase 1:**
    *   **Action:** AI will use local component state (e.g., `useState`) for managing notifications on specific pages.
*   **[ ] Phase 2:**
    *   **Action:** AI will integrate a global state management solution (as per `STATE_MANAGEMENT_PLAN.md`, likely Zustand) to manage the list of notifications and unread count for the global panel.

## 5. Accessibility

*   **[ ] Goal:** Ensure notifications are accessible.
    *   **Action:** AI will use ARIA live regions for dynamic announcements.
    *   **Action:** AI will ensure clear visual distinctions and keyboard accessibility for all notification elements.

## 6. Testing

*   **[ ] Goal:** Implement comprehensive tests.
    *   **Action:** AI will write unit tests for `NotificationItem.tsx`.
    *   **Action:** AI will write component tests for pages/components displaying notifications, mocking API calls.
    *   **Action (Phase 2):** AI will write integration tests for the notification panel and its interactions.

This plan aligns with the backend `NOTIFICATIONS_MODULE_PLAN.md` and the overall `AGENT_PLAN.md`.
