# Notifications Module Plan (Backend)

**Overall Goal:** Manage and dispatch various types of notifications within UniCal, initially focusing on system-level alerts (account, sync status) and later expanding to user-facing notifications (event reminders, booking confirmations if features are added).

**Alignment:** Supports Backend AGENT_PLAN by providing feedback mechanisms for async operations (Phase 3) and user communication (Phase 4/5).

## 1. Core Infrastructure & Setup
*Goal: Establish the foundational components for creating, storing, and retrieving notifications.*

*   [ ] **Module Setup (`notifications.module.ts`):**
    *   Create `NotificationsService`.
    *   Create `NotificationsController` (for in-app notification retrieval).
    *   Import `PrismaModule`.
    *   Import `forwardRef(() => UserModule)` (if user preferences for notifications are fetched).
    *   (Future) Import `EmailModule` or a shared `MessagingModule`.
*   [ ] **Prisma Schema (`schema.prisma` - within this module's logical scope, defined in global schema):**
    *   [ ] **Define `NotificationType` Enum:**
        ```prisma
        enum NotificationType {
          // Account Management
          ACCOUNT_CONNECTED_SUCCESS
          ACCOUNT_CONNECTION_FAILED
          ACCOUNT_REAUTH_REQUIRED
          ACCOUNT_DELETED_CONFIRMATION
          // Sync Status
          SYNC_INITIATED
          SYNC_COMPLETED_SUCCESS
          SYNC_COMPLETED_PARTIAL_SUCCESS // Some calendars failed
          SYNC_COMPLETED_WITH_ERRORS
          SYNC_WEBHOOK_ERROR
          // Event Related (Future)
          // EVENT_REMINDER
          // EVENT_INVITATION
          // EVENT_UPDATE
          // Booking Related (Future)
          // BOOKING_CONFIRMED
          // BOOKING_CANCELLED
          // General System
          GENERAL_INFO
          GENERAL_WARNING
          GENERAL_ERROR
        }
        ```
    *   [ ] **Define `NotificationChannel` Enum (Future - for user preferences):**
        ```prisma
        // enum NotificationChannel {
        //   IN_APP
        //   EMAIL
        //   PUSH // Mobile/Desktop Push
        // }
        ```
    *   [ ] **Define `Notification` Model:**
        ```prisma
        model Notification {
          id        String            @id @default(cuid())
          userId    String
          user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
          type      NotificationType
          title     String?           // Short title for the notification
          message   String            @db.Text
          isRead    Boolean           @default(false)
          readAt    DateTime?
          linkTo    String?           // Optional URL for the notification to link to in the frontend (e.g., /settings/accounts)
          metadata  Json?             // For additional context, e.g., { accountId: "...", calendarName: "..." }
          createdAt DateTime          @default(now())
          updatedAt DateTime          @updatedAt

          @@index([userId, createdAt(sort: Desc)])
          @@index([userId, isRead])
        }
        ```
    *   Ensure `User` model has `notifications Notification[]` relation.

## 2. Service Implementation (`notifications.service.ts`)
*Goal: Implement business logic for managing notifications.*

*   [ ] **Create `NotificationsService`, inject `PrismaService`.**
*   [ ] **`createNotification(data: CreateNotificationDto): Promise<Notification>`:**
    *   `CreateNotificationDto`: `userId: string`, `type: NotificationType`, `message: string`, `title?: string`, `linkTo?: string`, `metadata?: Prisma.JsonValue`.
    *   Creates and stores a notification in Prisma.
    *   (Future) Based on `type` and user preferences, may also trigger dispatch via other channels (email, push).
*   [ ] **`getUserNotifications(userId: string, query: GetNotificationsQueryDto): Promise<{ notifications: Notification[], totalCount: number, unreadCount: number }>`:**
    *   `GetNotificationsQueryDto`: `isRead?: boolean`, `type?: NotificationType`, `limit?: number`, `page?: number`.
    *   Retrieves notifications for a user with pagination and filtering.
    *   Calculates `totalCount` for pagination and `unreadCount`.
*   [ ] **`markNotificationAsRead(userId: string, notificationId: string): Promise<Notification | null>`:**
    *   Marks a single notification as read, sets `readAt`. Ensures `userId` matches.
*   [ ] **`markAllNotificationsAsRead(userId: string): Promise<{ count: number }>`:**
    *   Marks all unread notifications for a user as read.
*   [ ] **`deleteNotification(userId: string, notificationId: string): Promise<void>`:**
    *   Deletes a notification. Ensures `userId` matches. (Consider if soft delete is needed).

## 3. Controller Implementation (`notifications.controller.ts`)
*Goal: Expose API endpoints for frontend to retrieve and manage notifications.*

*   [ ] Create `NotificationsController` (`@Controller('notifications')`, `@ApiTags('Notifications')`). Inject `NotificationsService`.
*   [ ] `@UseGuards(AuthGuard)` for all routes. Extract `userId` from `req.user`.
*   [ ] **`GET /` (`getNotifications`):**
    *   Query params: `isRead?`, `type?`, `limit?`, `page?`.
    *   Calls `notificationsService.getUserNotifications(userId, query)`.
    *   Returns `NotificationListResponseDto` (includes `notifications`, `totalCount`, `unreadCount`, `currentPage`, `totalPages`).
*   [ ] **`PATCH /:notificationId/read` (`markAsRead`):**
    *   Calls `notificationsService.markNotificationAsRead(userId, notificationId)`.
*   [ ] **`POST /read-all` (`markAllAsRead`):** (Using POST as it's an action changing state for multiple items)
    *   Calls `notificationsService.markAllNotificationsAsRead(userId)`.
*   [ ] **`DELETE /:notificationId` (`deleteNotification`):**
    *   Calls `notificationsService.deleteNotification(userId, notificationId)`.
*   [ ] Add Swagger decorators for all endpoints and DTOs.

## 4. Integration with Other Modules (Notification Creation)
*Goal: Allow other services to easily create notifications.*

*   **`AccountsService` calls `NotificationsService.createNotification` for:**
    *   `ACCOUNT_CONNECTED_SUCCESS`
    *   `ACCOUNT_CONNECTION_FAILED` (with error details in `metadata` or `message`)
    *   `ACCOUNT_REAUTH_REQUIRED`
*   **`SyncService` calls `NotificationsService.createNotification` for:**
    *   `SYNC_INITIATED`
    *   `SYNC_COMPLETED_SUCCESS`
    *   `SYNC_COMPLETED_PARTIAL_SUCCESS`
    *   `SYNC_COMPLETED_WITH_ERRORS` (with error summary in `message` or `metadata`)
    *   `SYNC_WEBHOOK_ERROR`
*   **(Future) `AuthService` calls for email verification, password reset notifications (if these are also logged as in-app notifications).**

## 5. Phase 2: Email & Other Channel Dispatch (Post-MVP)
*Goal: Extend notifications to other channels like email.*

*   [ ] **Define `IEmailService` / `IMessagingService` interface.**
*   [ ] **Implement `EmailService` (e.g., using SendGrid, Nodemailer).**
*   [ ] **`NotificationsService` enhancement:**
    *   When `createNotification` is called:
        1.  Check `NotificationType`.
        2.  (Future) Fetch `User.notificationPreferences` for the `userId` and `type`.
        3.  If email channel is enabled for this type:
            *   Fetch `User.email` (requires `UserService` injection).
            *   Format email content (using templates).
            *   Call `EmailService.sendEmail(...)`.
*   [ ] **User Notification Preferences:**
    *   New Prisma model: `UserNotificationPreference { userId, notificationType, channel (IN_APP | EMAIL), isEnabled }`.
    *   API endpoints to manage these preferences.

## 6. Testing
*Goal: Ensure reliability of notification creation and retrieval.*

*   [ ] **Unit Tests (`NotificationsService`):**
    *   Mock `PrismaService`. Test all service methods: create, get (with filters/pagination), mark as read, delete.
*   [ ] **Integration Tests (`NotificationsController`):**
    *   Mock auth. Test API endpoints, DTO validation, interaction with mocked `NotificationsService`.

## 7. Dependencies
*   `PrismaModule`
*   `ConfigModule` (for EmailService API keys in Phase 2)
*   `UserModule` (for user email/preferences in Phase 2)
*   (Future) `EmailModule` / Shared `MessagingModule`.

## Notes & Considerations:
*   **Scalability:** For very high volume, consider a dedicated message queue for dispatching notifications to different channels, rather than handling synchronously in `NotificationsService.createNotification`.
*   **Content Management:** For more complex email templates, use a templating engine (e.g., Handlebars, Pug).
*   **Localization:** Plan for localized notification messages if multi-language support is a future goal.
*   **Rate Limiting:** Apply rate limiting to controller endpoints.
*   **Security:** Rigorous `userId` checks in all service methods to ensure users only access their own notifications.
