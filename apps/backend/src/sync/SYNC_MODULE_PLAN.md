<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/backend/src/sync/SYNC_MODULE_PLAN.md -->
# Sync Module Plan

This plan outlines the development tasks for the Sync module, responsible for two-way synchronization of calendar events between UniCal and connected calendar platforms (Google, Microsoft).

## Phase 1: Setup & Core Infrastructure

*   [ ] **Module Setup:**
    *   Create `SyncService`.
    *   Create `SyncController` (primarily for webhook ingestion).
    *   Define `ISyncStrategy` interface (if different strategies per platform are needed beyond what `CalendarsModule` provides).
*   [ ] **Prisma Schema Review:**
    *   Ensure `CalendarEvent` schema has `lastSyncedFromPlatformAt`, `platformEventId`, `connectedAccountId`, `version` (for optimistic locking or conflict detection).
    *   Ensure `ConnectedAccount` schema has `lastSyncAt`, `syncToken` (e.g., Google's `nextSyncToken`), `selectedNativeCalendarIds`.
*   [ ] **Dependencies:**
    *   Ensure `SyncService` can access `PrismaService`, `AccountsService`, `EventsService`, and `CalendarsModule` services (e.g., `GoogleCalendarService`).
*   [ ] **Configuration:**
    *   Webhook validation secrets (if any) in `.env`.
    *   Sync interval configurations.

## Phase 2: Initial Sync & Webhook Ingestion

*   [ ] **Initial Sync Logic (`SyncService.performInitialSync(connectedAccountId)`):**
    *   Triggered after a new account is connected and native calendars are selected (FRD 3.5.1).
    *   For each selected native calendar on the `ConnectedAccount`:
        *   Fetch all existing events from the platform using the relevant `CalendarsModule` service (e.g., `GoogleCalendarService.fetchEvents(..., { initialSync: true })`).
        *   For each platform event:
            *   Transform to UniCal's `CalendarEvent` format.
            *   Save to Prisma via `EventsService.createOrUpdateEventFromPlatform(platformEventData, connectedAccountId)` (this service method needs to handle upsert logic based on `platformEventId` and `connectedAccountId`).
        *   Store `nextSyncToken` (if provided by platform) on `ConnectedAccount`.
    *   Update `ConnectedAccount.lastSyncAt`.
*   [ ] **Webhook Ingestion (`SyncController`):**
    *   `POST /sync/webhook/google`: Endpoint for Google Calendar push notifications (FRD 3.5.2).
        *   Validate request (e.g., signature, token).
        *   Extract necessary info (e.g., `channelId`, `resourceId`, `resourceState`).
        *   Queue a job for processing (e.g., using BullMQ) to avoid blocking the webhook response. Job should contain `connectedAccountId` and sync details.
    *   `POST /sync/webhook/microsoft`: Endpoint for Microsoft Outlook Calendar push notifications (FRD 3.5.2).
        *   Similar validation and queuing logic.
*   [ ] **Webhook Processing Logic (`SyncService.processWebhookNotification(jobData)`):**
    *   Retrieve `connectedAccountId`.
    *   Fetch changes from the platform since `lastSyncToken` using `CalendarsModule` service (e.g., `GoogleCalendarService.fetchEvents(..., { syncToken: currentSyncToken })`).
    *   For each changed/new/deleted platform event:
        *   If new/updated: `EventsService.createOrUpdateEventFromPlatform()`.
        *   If deleted: `EventsService.deleteEventFromPlatform(platformEventId, connectedAccountId)`.
    *   Update `nextSyncToken` and `lastSyncAt` on `ConnectedAccount`.

## Phase 3: Two-Way Sync & Conflict Resolution

*   [ ] **Outgoing Sync Logic (UniCal -> Platform):**
    *   Triggered when an event is created/updated/deleted in UniCal via `EventsService`.
    *   `SyncService.syncEventToPlatform(uniCalEventId, operationType)`:
        *   Fetch the `CalendarEvent` and its `ConnectedAccount`.
        *   Determine the target platform service from `CalendarsModule`.
        *   If `operationType` is create: Call `PlatformService.createEvent()`.
            *   Update `CalendarEvent.platformEventId` and `lastSyncedFromPlatformAt` with response.
        *   If `operationType` is update: Call `PlatformService.updateEvent()`.
            *   Update `CalendarEvent.lastSyncedFromPlatformAt`.
        *   If `operationType` is delete: Call `PlatformService.deleteEvent()`.
*   [ ] **Conflict Resolution Strategy (FRD 3.5.3 - "Last Update Wins"):**
    *   **Incoming (Platform -> UniCal):** When `EventsService.createOrUpdateEventFromPlatform()` is called:
        *   If UniCal event exists: Compare `platformEvent.updatedAt` with `uniCalEvent.lastSyncedFromPlatformAt` (or a dedicated `platformLastModifiedAt` field on `CalendarEvent` if available).
        *   If platform event is newer or UniCal event hasn't been synced from this platform, update UniCal event.
    *   **Outgoing (UniCal -> Platform):** When `SyncService.syncEventToPlatform()` is about to call platform update/delete:
        *   Consider fetching the latest event state from the platform to compare versions/timestamps if the platform API supports ETag or last-modified checks for conditional updates. This is complex and might be a v2 feature.
        *   For a simpler "last UniCal write wins for UniCal-initiated changes", proceed with the update. The webhook will later bring platform changes if any occurred concurrently.
*   [ ] **Periodic/Fallback Sync (`SyncService.performPeriodicSync()`):**
    *   Scheduled job (e.g., daily or every few hours) for all connected accounts.
    *   For each account, call `SyncService.processWebhookNotification()` or a similar function that fetches changes since `lastSyncToken` to catch missed webhooks or ensure consistency.

## Phase 4: Robustness & Monitoring

*   [ ] **Error Handling & Retries:**
    *   Implement robust error handling for all platform API calls within `SyncService` and `CalendarsModule`.
    *   Use a job queue (e.g., BullMQ) for sync operations with automatic retries for transient errors.
    *   Dead-letter queue for persistent failures.
    *   **[ ] TODO: Design for stateless, horizontally scalable sync workers (if using a job queue like BullMQ).**
    *   **[ ] TODO: Implement detailed error tracking and retry policies within the job queue for individual sync tasks.**
*   [ ] **Idempotency:**
    *   Ensure webhook processing and sync operations are idempotent (processing the same notification multiple times doesn\'t cause issues).
*   [ ] **Rate Limiting:**
    *   Respect platform rate limits. Implement backoff strategies.
*   [ ] **Sync Status & Monitoring (FRD 3.9.3):**
    *   `AccountsService.getSyncStatus(connectedAccountId)`: Provide data like `lastSuccessfulSyncAt`, `syncInProgress`, `lastError`.
    *   Logging: Detailed logging for sync operations, errors, and conflicts.
*   [ ] **Testing:**
    *   Unit tests for `SyncService` logic (mocking platform services and `EventsService`).
    *   Integration tests for webhook handling and initial sync flows (mocking external platform APIs).
*   [ ] **Swagger Documentation:** Document webhook endpoints.

## Future Considerations:
*   More sophisticated conflict resolution strategies (e.g., three-way merge, user prompts).
*   Delta sync for platforms that don't provide sync tokens (less efficient).
*   Allowing users to trigger manual sync for an account.
