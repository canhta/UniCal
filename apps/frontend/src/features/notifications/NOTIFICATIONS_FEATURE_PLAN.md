# Notifications Feature Plan (Frontend)

## 1. Overview

This plan outlines the frontend implementation for displaying notifications to the user. Initially, this will be tightly coupled with FRD 3.11.3, focusing on showing sync status and error notifications, particularly on the 'Connected Accounts' page. Future iterations could include a dedicated notification center/panel and real-time updates.

This feature will consume data from the backend `NotificationsModule`.

## 2. Core Requirements (Based on FRD & System Needs)

*   **Display Sync/Account Status:** Provide users with feedback on the status of their connected accounts and any synchronization issues (FRD 3.11.3).
*   **In-App Display:** Notifications should be displayed within the application interface, rather than relying solely on external methods like email for this type of feedback.
*   **Clarity and Actionability:** Notifications should be clear, concise, and if applicable, guide the user on any actions they might need to take (e.g., "Re-authentication required for Google Calendar").

## 3. Phase 1: Basic Notifications on Relevant Pages

*   **[ ] Notification Component (`NotificationItem.tsx`):
    *   Create a reusable component to display a single notification.
    *   Props: `message`, `type` (e.g., 'error', 'warning', 'info', 'success'), `timestamp` (optional), `onDismiss` (optional).
    *   Styling to differentiate notification types.
*   **[ ] Display on "Connected Accounts" Page (`apps/frontend/src/app/(protected)/integrations/page.tsx`):
    *   Fetch notifications related to account connections or sync statuses for the accounts listed.
    *   Display relevant notifications prominently on this page, perhaps at the top or next to each affected account.
    *   This might involve the backend `NotificationsService.getUserNotifications(userId, { context: 'integrations' })` or the `IntegrationsPage` fetching specific status from the `AccountsModule` which in turn might have logged notifications.
*   **[ ] Data Fetching:**
    *   The relevant page components (e.g., `IntegrationsPage`) will fetch notification data from the backend API.
    *   API endpoint: `GET /notifications?context=integrations` or similar, or notifications might be embedded within the `ConnectedAccount` data itself.
*   **[ ] No Dedicated Notification Center (MVP):**
    *   For the initial phase, notifications will be contextually displayed on the pages where they are most relevant, rather than in a global notification center.

## 4. Phase 2: In-App Notification Center/Panel (Post-MVP)

*   **[ ] Notification Icon/Indicator:**
    *   Add a notification bell icon to the main layout (e.g., in the header).
    *   Show a badge with the count of unread notifications.
*   **[ ] Notification Panel/Dropdown:**
    *   Clicking the icon opens a panel or dropdown displaying a list of recent notifications.
    *   Use the `NotificationItem` component for each item.
    *   Ability to mark notifications as read (individually or all).
    *   Link to relevant pages if a notification is actionable (e.g., a sync error notification could link to the Integrations page).
*   **[ ] Data Fetching for Panel:**
    *   Fetch a list of all (or recent unread) notifications: `GET /notifications`.
    *   API for marking as read: `POST /notifications/{id}/read` or `POST /notifications/mark-all-read`.
*   **[ ] Real-time Updates (Optional Enhancement):**
    *   Consider WebSocket integration to push new notifications to the client in real-time, updating the unread count and panel.
*   **[ ] Toast/Snackbar Notifications:**
    *   For immediate, less critical feedback (e.g., "Event created successfully").
    *   These would be transient and might not be stored as persistent notifications.

## 5. API Endpoints & Data (Frontend Perspective)

*   **Needs (Phase 1):**
    *   Endpoint to fetch contextual notifications: `GET /notifications?userId=<userId>&context=integrations` (or notifications embedded in other responses).
    *   Notification data: `id`, `message`, `type`, `timestamp`, `isRead`, `link` (optional, for actionability).
*   **Needs (Phase 2):**
    *   Endpoint to fetch all/recent user notifications: `GET /notifications?userId=<userId>&status=unread`.
    *   Endpoint to mark notification(s) as read: `POST /notifications/read` (body: `{ ids: ["id1", "id2"] }`).

## 6. State Management

*   **Phase 1:** Local state within components displaying notifications.
*   **Phase 2:** If a global notification center is implemented, notification state (list, unread count) might be managed by a global state solution (e.g., Zustand, Redux Toolkit) and kept in sync with the backend.

## 7. Accessibility Considerations

*   Ensure notifications are announced by screen readers (e.g., using ARIA live regions if they appear dynamically).
*   Provide clear visual distinction for different notification types.
*   Ensure interactive elements within notifications are keyboard accessible.

## 8. Testing Considerations

*   **Unit Tests:** For the `NotificationItem` component and any utility functions.
*   **Component Tests:** For pages/components displaying notifications, mocking API responses.
*   **Integration Tests (Phase 2):** For the notification panel, testing interactions like marking as read.

This plan will be refined as the application evolves and more specific notification requirements emerge.
