# Notifications Module Plan

## 1. Overview

This module will be responsible for handling and dispatching various types of notifications within the UniCal system. Initially, it will focus on basic status updates related to account and sync activities, as outlined in the FRD. More advanced notification features (e.g., event reminders triggered by UniCal, booking notifications) are considered for future phases.

This module will likely need to integrate with a User service (to get user preferences and contact details) and potentially an Email service for dispatching emails.

## 2. Core Requirements (Based on FRD & System Needs)

*   **FRD 3.11.3 Sync Status/Error Notifications (Initial Product - Basic):**
    *   The primary focus for the initial phase is to support the display of connection issues on the \'Connected Accounts\' page. While the FRD states "No proactive alerts," this module might lay the groundwork for future proactive alerts by centralizing notification logic.
    *   This module could provide endpoints or services that other modules (like `SyncModule` or `AccountsModule`) can call to log notification-worthy events.

*   **User Account Notifications (Potential - Implied by FRD 3.1.1, 3.3):**
    *   Email Verification: Sending verification emails upon registration.
    *   Password Reset: Sending password reset links.
    *   (Though these might be handled directly within the `AuthModule` initially, a centralized `NotificationsModule` could eventually take over the dispatch.)

## 3. Phase 1: Foundational Setup & Basic Event Logging

*   **[ ] Module Setup:**
    *   Create `NotificationsService`.
    *   Create `NotificationsController` (if any direct API interaction is needed, e.g., for fetching notification history, though unlikely for MVP).
    *   Define `Notification` entity/interface (e.g., `userId`, `type`, `message`, `readStatus`, `createdAt`).
*   **[ ] Notification Service Core Logic:**
    *   `NotificationsService.createNotification(userId, type, message)`: Method to create and store a notification.
    *   `NotificationsService.getUserNotifications(userId)`: Method to retrieve notifications for a user (for potential future display in-app).
    *   `NotificationsService.markAsRead(notificationId, userId)`: Method to mark a notification as read.
*   **[ ] Integration Points (Internal):**
    *   `AccountsModule` and `SyncModule` should be ables to call `NotificationsService.createNotification` when significant events occur (e.g., connection success/failure, sync error).
*   **[ ] Data Model (`schema.prisma` - if storing notifications):**
    ```prisma
    // In schema.prisma
    model Notification {
      id        String   @id @default(cuid())
      userId    String
      user      User     @relation(fields: [userId], references: [id])
      type      String // e.g., 'SYNC_ERROR', 'ACCOUNT_CONNECTED', 'ACCOUNT_REAUTH_REQUIRED'
      message   String
      isRead    Boolean  @default(false)
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
    }
    ```
    *   Add relation to `User` model.
*   **[ ] Email Dispatch (Future Integration - Placeholder):**
    *   Define an interface for an `EmailService`.
    *   `NotificationsService` might have a method like `sendEmailNotification(userId, subject, template, context)` which would use the `EmailService`.
    *   For MVP, actual email sending for sync errors might be out of scope, focusing on in-app display or logging.

## 4. Phase 2: Email Notifications (Post-MVP)

*   **[ ] Email Service Integration:**
    *   Implement a concrete `EmailService` (e.g., using SendGrid, Nodemailer).
    *   Configure email templates.
*   **[ ] User Preferences for Notifications:**
    *   Extend `User` model or create a `NotificationPreference` model.
    *   Allow users to opt-in/out of certain types of email notifications.
*   **[ ] Triggering Email Notifications:**
    *   `AuthModule` calls `NotificationsService` to send:
        *   Email verification links (FRD 3.1.1).
        *   Password reset links (FRD 3.3).
    *   `NotificationsService` sends email digests or immediate alerts for critical issues based on preferences.

## 5. API Endpoints (Illustrative - Primarily for internal use or future in-app display)

*   `GET /notifications`: Get notifications for the authenticated user.
    *   Supports optional query parameters:
        *   `context?: string` (e.g., 'integrations', 'account') - to filter notifications by a specific area of the application.
        *   `status?: 'read' | 'unread' | 'all'` (defaults to 'unread' or 'all' depending on use case) - to filter by read status.
        *   `limit?: number` - to limit the number of notifications returned.
        *   `offset?: number` or `cursor?: string` - for pagination.
*   `POST /notifications/{id}/read`: Mark a specific notification as read. (Consider changing to PATCH for consistency, or deprecating in favor of the bulk endpoint).
*   `PATCH /notifications`: Bulk update notifications.
    *   Request Body: `{ ids: string[], isRead: boolean }`
    *   Allows marking multiple notifications as read or unread.

## 6. Security Considerations

*   Ensure that users can only access their own notifications.
*   Rate limiting if any endpoints are public-facing.
*   Sanitize any user-generated content that might become part of a notification message (less likely for system-generated ones).

## 7. Future Considerations

*   **In-app Notification Center:** A UI to display notifications.
*   **Real-time Notifications:** Using WebSockets to push notifications to the client.
*   **Push Notifications:** For mobile or desktop.
*   **Customizable Notification Preferences:** Granular control over what notifications to receive and via which channels (email, in-app, push).
*   **UniCal-Generated Event Reminders:** (FRD 3.11.1 is currently passthrough).
*   **Booking Notifications:** (FRD 3.11.2).

This plan will be updated as the project progresses and requirements become more refined.
