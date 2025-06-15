# Sync Module Plan (Backend)

**Overall Goal:** Ensure reliable two-way synchronization of calendar events between UniCal and connected third-party calendar platforms. This involves initial sync, real-time updates via webhooks, periodic fallback syncs, and conflict resolution.

**Alignment:** This plan is central to Backend AGENT_PLAN Phase 3 (Core Features - Calendar Sync & Integrations).

## 1. Core Infrastructure & Setup
*Goal: Establish the foundational components for the sync process.*

*   [x] **Module Setup (`sync.module.ts`):**
    *   Create `SyncService` (main orchestration) ✅
    *   Create `SyncController` (for webhook ingestion) - Future enhancement
    *   Create `SyncProcessor` (if using BullMQ for background jobs) - Future enhancement
    *   Import `PrismaModule` - Via other modules ✅
    *   Import `forwardRef(() => AccountsModule)` ✅
    *   Import `forwardRef(() => EventsModule)` - Future enhancement
    *   Import `forwardRef(() => CalendarsModule)` ✅
    *   Import `forwardRef(() => NotificationsModule)` - Future enhancement
    *   Import `ConfigModule` - Global ✅
    *   **Job Queue (Recommended: BullMQ):** - Future enhancement

*   [x] **SyncService Orchestration (High Priority):**
    *   `triggerInitialSync(accountId: string): Promise<void>` - Called after OAuth connection ✅
    *   `triggerManualSync(accountId: string): Promise<void>` - Called from manual sync endpoints ✅
    *   `schedulePeriodicSync(accountId: string): Promise<void>` - Schedule background sync (Future)
    *   **Integration with GoogleCalendarSyncService:**
        *   Delegate actual sync work to existing `GoogleCalendarSyncService` ✅
        *   Handle provider routing (Google vs Microsoft) ✅
        *   Manage sync status and error reporting ✅ckend)

**Overall Goal:** Ensure reliable two-way synchronization of calendar events between UniCal and connected third-party calendar platforms. This involves initial sync, real-time updates via webhooks, periodic fallback syncs, and conflict resolution.

**Alignment:** This plan is central to Backend AGENT_PLAN Phase 3 (Core Features - Calendar Sync & Integrations).

## 1. Core Infrastructure & Setup
*Goal: Establish the foundational components for the sync process.*

*   [ ] **Module Setup (`sync.module.ts`):**
    *   Create `SyncService` (main orchestration).
    *   Create `SyncController` (for webhook ingestion).
    *   Create `SyncProcessor` (if using BullMQ for background jobs).
    *   Import `PrismaModule`.
    *   Import `forwardRef(() => AccountsModule)`.
    *   Import `forwardRef(() => EventsModule)`.
    *   Import `forwardRef(() => CalendarsModule)`.
    *   Import `forwardRef(() => NotificationsModule)`.
    *   Import `ConfigModule`.
    *   **Job Queue (Recommended: BullMQ):**
        *   `BullModule.forRootAsync(...)` (global config).
        *   `BullModule.registerQueue({ name: 'sync-jobs' })`.
*   [ ] **Prisma Schema Enhancements (Verify/Add in respective modules):**
    *   **`ConnectedAccount` (`AccountsModule`):**
        *   `syncStatus` (Enum: `IDLE`, `SYNC_IN_PROGRESS`, `INITIAL_SYNC_PENDING`, `ERROR`, `DISABLED`, `WEBHOOK_ACTIVE`).
        *   `lastSyncAttemptAt` (DateTime?).
        *   `lastSuccessfulSyncAt` (DateTime?).
        *   `initialSyncCompletedAt` (DateTime?).
        *   `syncErrorDetails` (String?, `@db.Text`).
        *   `webhookSubscriptions` (Json?, `[{ nativeCalendarId: string, platformWebhookId: string, uniCalChannelId: string, expiresAt: DateTime, resourceId?: string (Google) }]`).
        *   `platformSyncTokens` (Json?, `[{ nativeCalendarId: string, token: string }]`).
    *   **`CalendarEvent` (`EventsModule`):** (Already well-defined, ensure `platformLastModifiedAt` and `updatedAt` are key for conflict resolution).
*   [ ] **Configuration (`.env` & `ConfigService`):**
    *   Webhook base URL for UniCal.
    *   Secrets for validating incoming webhooks (if applicable beyond `clientState` or channel tokens).
    *   Default sync intervals (fallback, webhook renewal).
    *   Job queue settings.
*   [ ] **Define Sync Job Types & Payloads (if using a queue):**
    *   `INITIAL_SYNC`: `{ connectedAccountId: string }`
    *   `PROCESS_WEBHOOK`: `{ platform: string, payload: any, headers: any }` (or more specific per platform)
    *   `SYNC_SINGLE_EVENT_TO_PLATFORM`: `{ uniCalEventId: string, operation: 'create' | 'update' | 'delete' }`
    *   `PERIODIC_FALLBACK_SYNC`: `{ connectedAccountId: string }`
    *   `RENEW_WEBHOOKS`: `{ connectedAccountId: string }`

## 2. Initial Sync (Connected to OAuth Flow)
*Goal: Fetch all existing events from a newly connected account's selected calendars.*

*   [ ] **`SyncService.triggerInitialSync(connectedAccountId: string): Promise<void>`:**
    *   **Called by IntegrationsController after successful OAuth callback**
    *   Update `ConnectedAccount.syncStatus` to `INITIAL_SYNC_PENDING`.
    *   **Delegate to GoogleCalendarSyncService**: `await googleCalendarSyncService.syncAccountCalendars(userId, accountId)`
    *   Handle errors and update sync status appropriately
    *   Send notification via `NotificationsService` on completion/error
*   [ ] **Job Handler: `SyncProcessor.handleInitialSync(job: Job<{ connectedAccountId: string }>): Promise<void>`:**
    *   Fetch `ConnectedAccount` and its selected `nativeCalendarIds` (from `User.preferences` or similar).
    *   Update `ConnectedAccount.syncStatus` to `SYNC_IN_PROGRESS`, `lastSyncAttemptAt`.
    *   For each `nativeCalendarId`:
        1.  `pageToken = null`, `allEvents = []`.
        2.  Loop (while `pageToken` or first run):
            *   `platformEventsData = await calendarsService.fetchPlatformEvents(connectedAccountId, nativeCalendarId, { pageToken, /* other params like date range if desired for initial */ })`.
            *   For each `platformEvent` in `platformEventsData.events`:
                *   `await eventsService.createOrUpdateEventFromPlatform({ userId, connectedAccountId, nativeCalendarId, ...platformEvent })`.
            *   Store `platformEventsData.nextSyncToken` in `ConnectedAccount.platformSyncTokens` for this `nativeCalendarId`.
            *   `pageToken = platformEventsData.nextPageToken`.
        3.  `await this.subscribeToPlatformCalendar(connectedAccountId, nativeCalendarId)`.
    *   Update `ConnectedAccount.syncStatus` to `WEBHOOK_ACTIVE` (or `IDLE` if webhooks not primary), `initialSyncCompletedAt`, `lastSuccessfulSyncAt`.
    *   Handle errors: update `syncStatus` to `ERROR`, log `syncErrorDetails`.
    *   Send notification via `NotificationsService`.

## 3. Webhook Handling (Real-time Updates from Platform)
*Goal: Process incoming changes from platforms immediately.*

*   [ ] **`SyncController` Endpoints:**
    *   `POST /sync/webhook/:platform` (e.g., `/google`, `/microsoft`):
        *   Validate request (signature, token, `clientState`).
        *   Add `PROCESS_WEBHOOK` job to queue with raw payload and necessary identifiers.
        *   Return 200/202 Accepted quickly.
    *   `GET /sync/webhook/microsoft` (for MS Graph subscription validation).
*   [ ] **Job Handler: `SyncProcessor.handleProcessWebhook(job: Job<WebhookPayload>): Promise<void>`:**
    *   Parse webhook payload to identify `connectedAccountId`, `nativeCalendarId`, change type.
        *   Google: Use `uniCalChannelId` from webhook headers/URL to find `ConnectedAccount`.
        *   Microsoft: Use `clientState` or `subscriptionId` to find `ConnectedAccount`.
    *   Update `ConnectedAccount.syncStatus` to `SYNC_IN_PROGRESS`, `lastSyncAttemptAt`.
    *   Fetch `syncToken` for the `nativeCalendarId` from `ConnectedAccount.platformSyncTokens`.
    *   `platformEventsData = await calendarsService.fetchPlatformEvents(connectedAccountId, nativeCalendarId, { syncToken })`.
    *   For each `platformEvent` in `platformEventsData.events` (these are the changes):
        *   If event status is `cancelled` or indicates deletion:
            *   `await eventsService.deleteEventFromPlatform(connectedAccountId, platformEvent.id)`.
        *   Else (new or updated):
            *   `await eventsService.createOrUpdateEventFromPlatform({ userId, connectedAccountId, nativeCalendarId, ...platformEvent })`.
    *   Store new `platformEventsData.nextSyncToken` in `ConnectedAccount.platformSyncTokens`.
    *   Update `ConnectedAccount.syncStatus` to `WEBHOOK_ACTIVE`, `lastSuccessfulSyncAt`.
    *   Handle errors: update `syncStatus` to `ERROR`, log `syncErrorDetails`. Send notification.

## 4. Outgoing Sync (UniCal Changes to Platform)
*Goal: Propagate changes made within UniCal to the external platforms.*

*   [ ] **`EventsService` calls `SyncService.requestSyncToPlatform(uniCalEventId, operation)` after its CUD operations.**
*   [ ] **`SyncService.requestSyncToPlatform(uniCalEventId: string, operation: 'create' | 'update' | 'delete'): Promise<void>`:**
    *   Add `SYNC_SINGLE_EVENT_TO_PLATFORM` job to queue.
*   [ ] **Job Handler: `SyncProcessor.handleSyncToPlatform(job: Job<SyncToPlatformPayload>): Promise<void>`:**
    *   Fetch `CalendarEvent` by `uniCalEventId`. Get `connectedAccountId`, `nativeCalendarId`, `platformEventId`.
    *   Update `ConnectedAccount.syncStatus` to `SYNC_IN_PROGRESS`, `lastSyncAttemptAt`.
    *   Transform `CalendarEvent` to `CreatePlatformEventDto` or `UpdatePlatformEventDto`.
    *   If `operation` is 'create':
        *   `newPlatformEvent = await calendarsService.createPlatformEvent(connectedAccountId, nativeCalendarId, dto)`.
        *   `await eventsService.updateEventWithPlatformData(uniCalEventId, newPlatformEvent)` (updates `platformEventId`, `platformLastModifiedAt`).
    *   If 'update':
        *   `updatedPlatformEvent = await calendarsService.updatePlatformEvent(connectedAccountId, nativeCalendarId, platformEventId, dto, /* scope for recurring */)`.
        *   `await eventsService.updateEventWithPlatformData(uniCalEventId, updatedPlatformEvent)`.
    *   If 'delete':
        *   `await calendarsService.deletePlatformEvent(connectedAccountId, nativeCalendarId, platformEventId, /* scope for recurring */)`.
        *   (Event already deleted in UniCal by `EventsService`).
    *   Update `ConnectedAccount.syncStatus` to `WEBHOOK_ACTIVE`, `lastSuccessfulSyncAt`.
    *   Handle conflicts/errors: If platform rejects (e.g., 412 Precondition Failed), log, potentially trigger a fetch for that event from platform to reconcile. Update `syncStatus` to `ERROR`. Send notification.

## 5. Conflict Resolution ("Last Update Wins")
*Goal: Consistently handle concurrent modifications.*

*   **Strategy:** Compare `CalendarEvent.platformLastModifiedAt` (from platform) with `CalendarEvent.updatedAt` (UniCal's internal timestamp).
*   **Incoming (Platform -> UniCal - in `EventsService.createOrUpdateEventFromPlatform`):**
    1.  Receive `platformEventData` with `newPlatformTimestamp = platformEventData.updated`.
    2.  Find existing `uniCalEvent` by `platformEventId`.
    3.  If new, or if `newPlatformTimestamp` is significantly later than `uniCalEvent.platformLastModifiedAt`: Update/create UniCal event. Set `uniCalEvent.platformLastModifiedAt = newPlatformTimestamp`.
    4.  Else: Platform data is older or same, UniCal change might be more recent. Log and investigate if UniCal change hasn't synced out yet. For now, platform change is ignored if older.
*   **Outgoing (UniCal -> Platform - in `SyncProcessor.handleSyncToPlatform`):**
    1.  When sending update/delete, `CalendarsService` (platform-specific services) should use conditional requests (ETags or If-Match with `CalendarEvent.platformLastModifiedAt`) if supported by the platform API.
    2.  If platform rejects due to conflict (e.g., 412 Precondition Failed):
        *   The event changed on the platform since UniCal last synced it.
        *   **Action:** Trigger an immediate fetch for that specific event: `await this.fetchAndProcessSingleEventFromPlatform(connectedAccountId, nativeCalendarId, platformEventId)`. This will apply the "incoming" logic, effectively letting the platform's latest change win. The UniCal change that failed is discarded/overridden.
    3.  If platform accepts, `EventsService.updateEventWithPlatformData` updates `uniCalEvent.platformLastModifiedAt` with the new timestamp from the platform response.

## 6. Webhook Lifecycle & Fallback Sync
*Goal: Maintain webhook subscriptions and ensure data consistency with periodic checks.*

*   [ ] **`SyncService.subscribeToPlatformCalendar(connectedAccountId: string, nativeCalendarId: string): Promise<void>`:**
    *   Generate a unique `uniCalChannelId` (UUID).
    *   `webhookSub = await calendarsService.registerWebhook(connectedAccountId, nativeCalendarId, uniCalChannelId, webhookBaseUrl)`.
    *   Store `webhookSub` details (platform ID, UniCal ID, expiry) in `ConnectedAccount.webhookSubscriptions`.
*   [ ] **`SyncService.renewWebhookSubscriptions(connectedAccountId?: string)` (Scheduled Job or Triggered):**
    *   Iterate `ConnectedAccount.webhookSubscriptions`. If expiring soon, call `subscribeToPlatformCalendar` again (some platforms might have explicit renew).
*   [ ] **`SyncService.unsubscribeFromPlatformCalendar(connectedAccountId: string, nativeCalendarId: string)`:**
    *   Fetch webhook details from `ConnectedAccount`.
    *   `await calendarsService.stopWebhook(connectedAccountId, platformWebhookId, resourceId)`.
    *   Remove from `ConnectedAccount.webhookSubscriptions`.
*   [ ] **Periodic Fallback Sync (Scheduled Job - e.g., `SyncProcessor.handlePeriodicFallbackSync`):**
    *   Iterate through `ConnectedAccount`s with `WEBHOOK_ACTIVE` or `ERROR` status.
    *   For each `nativeCalendarId` with a `syncToken`:
        *   Perform steps similar to `handleProcessWebhook` (fetch changes using `syncToken`).
    *   This catches missed webhooks or reconciles errors.
    *   Log notifications.

## 7. Testing
*Goal: Ensure sync reliability.*

*   [ ] **Unit Tests:** `SyncService`, `SyncController`, `SyncProcessor` methods. Mock dependencies extensively. Test conflict scenarios, different sync flows.
*   [ ] **Integration Tests:** Test job queuing and processing. Test interaction between services (e.g., `EventsService` triggering `SyncService`). Mock platform APIs at `CalendarsService` boundary.

## Dependencies:
*   All core modules: `PrismaModule`, `AccountsModule`, `EventsModule`, `CalendarsModule`, `NotificationsModule`, `ConfigModule`.
*   `@nestjs/bull`, `bull` (if using BullMQ).

## Notes:
*   All date/time comparisons **MUST** be in UTC and handle potential clock skew with a small tolerance.
*   Idempotency is key for all job handlers.
*   Detailed logging throughout the sync process is crucial for debugging.
*   `EventsService` needs `updateEventWithPlatformData(uniCalEventId, platformEventDto)` to update an existing UniCal event with fresh data from the platform (especially `platformEventId` after creation, and `platformLastModifiedAt`).
