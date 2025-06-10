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
    *   **Status Update:** Set `ConnectedAccount.syncStatus` to `INITIAL_SYNC_IN_PROGRESS`.
    *   For each selected native calendar on the `ConnectedAccount`:
        *   **Batch Processing:** Fetch platform events in batches if the API supports pagination or if a very large number of events is anticipated, to manage memory and avoid timeouts.
        *   Fetch all existing events from the platform using the relevant `CalendarsModule` service (e.g., `GoogleCalendarService.fetchEvents(..., { initialSync: true, pageToken: nextPageToken })`).
        *   For each platform event in the current batch:
            *   Transform to UniCal's `CalendarEvent` format.
            *   Save to Prisma via `EventsService.createOrUpdateEventFromPlatform(platformEventData, connectedAccountId)` (this service method needs to handle upsert logic based on `platformEventId` and `connectedAccountId`, and be idempotent).
        *   **Error Handling (per calendar):** If fetching or processing a specific native calendar fails, log the error, store relevant error information (e.g., on a per-native-calendar-sync-status basis if that granularity is introduced, or as part of `ConnectedAccount.lastSyncErrorDetails`), and attempt to continue with the next selected native calendar. A decision needs to be made if a single calendar failure should halt the entire initial sync for the account or allow partial success. For now, assume continuation.
        *   Store `nextSyncToken` (if provided by platform for this native calendar) on `ConnectedAccount` (or a more granular entity if `syncToken` is per-native-calendar).
    *   **Final Status Update:**
        *   If all selected calendars synced successfully: Update `ConnectedAccount.lastSyncAt` to current time, `ConnectedAccount.initialSyncCompletedAt` to current time, and `ConnectedAccount.syncStatus` to `IDLE` (or `ACTIVE_LISTENING` if webhooks are immediately established). Clear `ConnectedAccount.lastSyncErrorDetails`.
        *   If some calendars failed: Update `ConnectedAccount.lastSyncAt` (to reflect the attempt), potentially set `ConnectedAccount.syncStatus` to `ERROR_PARTIAL` or `IDLE_WITH_ERRORS`, and ensure `ConnectedAccount.lastSyncErrorDetails` contains information about the failures.
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
    The "Last Update Wins" strategy dictates that the version of an event with the most recent modification timestamp (from the authoritative source of that update) will prevail. Timestamps must be handled in UTC.

    **Key `CalendarEvent` fields for conflict resolution:**
    *   `platformEventId: String?` - The event's ID on the external platform.
    *   `platformLastModifiedAt: DateTime?` - Stores the `updated` timestamp *from the provider* for the version of the event UniCal currently holds. This is critical for comparing incoming platform changes.
    *   `uniCalUpdatedAt: DateTime` - Standard Prisma `updatedAt` field, indicating when the UniCal record was last modified by a user or an internal process (excluding syncs that only update platform-related metadata).

    **Incoming Sync (Platform -> UniCal):**
    *   This logic is primarily handled within `EventsService.createOrUpdateEventFromPlatform(platformEventData, connectedAccountId)`.
    *   When a platform event is received (via webhook or polling):
        1.  Extract `platformEventId` and `newPlatformTimestamp` (the event's `updated` timestamp from the platform).
        2.  Attempt to find an existing UniCal `CalendarEvent` using `platformEventId` and `connectedAccountId`.
        3.  **If no UniCal event exists:** This is a new event from the platform. Create a new `CalendarEvent` in UniCal, store `platformEventData`, set `platformLastModifiedAt = newPlatformTimestamp`.
        4.  **If a UniCal event exists:**
            *   Compare `newPlatformTimestamp` with the existing `uniCalEvent.platformLastModifiedAt`.
            *   If `newPlatformTimestamp > uniCalEvent.platformLastModifiedAt`, the platform's version is newer. Update the UniCal `CalendarEvent` with `platformEventData` and set `uniCalEvent.platformLastModifiedAt = newPlatformTimestamp`.
            *   If `newPlatformTimestamp <= uniCalEvent.platformLastModifiedAt`, UniCal already has this version or a newer one from the platform. No action needed for this specific update, but log for audit if timestamps are identical (potential duplicate notification).

    **Outgoing Sync (UniCal -> Platform):**
    *   This logic is handled by `SyncService.syncEventToPlatform(uniCalEventId, operationType)`.
    *   When a `CalendarEvent` is created, updated, or deleted by a user in UniCal:
        1.  The `uniCalUpdatedAt` timestamp for the event is updated.
        2.  `SyncService` pushes the change (create, update, delete) to the corresponding external platform.
        3.  **If the platform API supports conditional updates (e.g., using ETags or If-Match with `platformLastModifiedAt`):** This is the preferred approach for updates/deletes to prevent overwriting concurrent platform changes unknowingly.
            *   Send the `platformLastModifiedAt` (or ETag if stored) with the update/delete request.
            *   If the platform rejects the change due to a conflict (e.g., 412 Precondition Failed), it means the event was modified on the platform since UniCal last synced.
                *   **Action:** Trigger an immediate fetch of this event from the platform to get the latest version and apply the "Incoming Sync" logic. The user's change in UniCal is effectively "lost" in favor of the platform's more recent change, adhering to "Last Update Wins".
        4.  **If conditional updates are not used (simpler initial approach):**
            *   UniCal sends the create/update/delete operation to the platform.
            *   If the operation is successful, the platform will provide its own new `updated` timestamp for the event (or UniCal can use the current UTC time if not provided). UniCal should update `uniCalEvent.platformLastModifiedAt` with this new timestamp.
            *   **Concurrency Issue:** If the event was modified on the platform between UniCal's last sync and this push, UniCal's change might overwrite the platform's change. However, if the platform modification was later, its webhook notification (or the next poll) will eventually arrive at UniCal. The "Incoming Sync" logic will then apply, potentially overwriting UniCal's change if the platform's version is deemed newer by timestamp. This eventually respects "Last Update Wins" but might lead to temporary divergence.
        5.  For deletes originating from UniCal, if the event is already deleted on the platform, the operation should ideally succeed idempotently or be ignored.

    **Note on `version` field:** The `version` field mentioned in "Prisma Schema Review" can be used for optimistic concurrency control within UniCal's own API operations (e.g., multiple users editing the same event in UniCal), but `platformLastModifiedAt` is key for platform sync conflicts.
*   [ ] **Periodic/Fallback Sync (`SyncService.performPeriodicSync()`):**
    *   Scheduled job (e.g., daily or every few hours) for all connected accounts.
    *   For each account, call `SyncService.processWebhookNotification()` or a similar function that fetches changes since `lastSyncToken` to catch missed webhooks or ensure consistency.

### 3.2 Polling Strategy (Fallback & Special Cases)

*   **Purpose:** Polling is a secondary mechanism to webhooks, used for:
    *   **Fallback:** To catch events missed by webhooks (e.g., due to temporary webhook delivery failures from the provider, or if a webhook subscription was briefly inactive).
    *   **Platforms without Webhooks:** If UniCal were to integrate with a calendar platform that doesn't offer reliable webhook notifications.
    *   **Initial Consistency Check:** Can be part of an initial sync or a periodic deep check to ensure alignment, though `nextSyncToken` based fetching is generally preferred for efficiency after initial full sync.
*   **Mechanism:**
    *   A scheduled job (e.g., every 1 to 4 hours, configurable per platform or globally) iterates through all `ConnectedAccount`s that are active and have `syncEnabled` calendars.
    *   For each account, it fetches events since the `lastSyncAt` timestamp or using the `nextSyncToken` (if available and reliable for polling). This is similar to `processWebhookNotification` but triggered by a schedule, not an incoming notification.
    *   **Avoiding Redundancy with Webhooks:**
        *   The primary mechanism for fetching changes should be `nextSyncToken` (or equivalent delta token provided by the platform API). Both webhook-triggered syncs and poll-triggered syncs should use this token.
        *   If a platform event is processed via a webhook, its `updatedAt` timestamp (or a UniCal-managed `lastProcessedFromPlatformAt` on the `CalendarEvent` model) is updated. If the same event is fetched again via polling before the `nextSyncToken` has advanced past it, the system should recognize it has already been processed (based on `platformEventId` and its timestamp) and not re-process it.
        *   The `EventsService.createOrUpdateEventFromPlatform()` method must be idempotent and handle this comparison gracefully.
*   **Frequency:** Polling frequency should be configurable and set to a reasonable interval to balance near real-time updates with API rate limits and system load. It should be less frequent than webhook-driven updates.
*   **Scope:** Polling might initially focus on a shorter time window (e.g., changes in the last 24-48 hours) for regular checks, with a less frequent, deeper sync (e.g., weekly) if deemed necessary for data integrity, though `nextSyncToken` usage should ideally make deep re-syncs rare.

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

### 3. Webhook Handling
*   Implement controllers/services to receive webhook notifications from Google and Microsoft.
*   Validate incoming webhooks (e.g., signature verification, source validation).
*   Queue incoming webhook events for asynchronous processing to avoid timeouts and handle bursts.
*   Process queued events: fetch changed data from the native platform using its API, update UniCal's database.

#### 3.1 Webhook Lifecycle Management & Security

*   **Subscription Process:**
    *   **Google Calendar API:**
        *   Initial setup requires domain verification for the webhook notification endpoint.
        *   Programmatically create notification channels (`watch` requests) for each connected Google account, specifying the `type: webhook`, a unique `id` (e.g., UUID), and the `address` (your HTTPS notification URL).
        *   Store the `channelId` and `resourceId` returned by Google, associated with the user's connected account, for renewal and stopping channels.
    *   **Microsoft Graph API:**
        *   Create subscriptions for calendar change notifications (`/subscriptions` endpoint).
        *   Specify `changeType` (e.g., `created,updated,deleted`), `notificationUrl`, `resource` (e.g., `users/{id}/events`), `expirationDateTime` (max typically a few days), and a `clientState` (secret string for validation).
        *   Store the `subscriptionId` for renewal and deletion.
*   **Renewal Mechanisms:**
    *   **Google Calendar API:** Notification channels have an expiration time. The system must have a scheduled job (e.g., daily) to check for channels nearing expiration and renew them by re-issuing a `watch` request.
    *   **Microsoft Graph API:** Subscriptions expire. The system must have a scheduled job to renew subscriptions before their `expirationDateTime` by sending a `PATCH` request to the `/subscriptions/{id}` endpoint with a new `expirationDateTime`.
*   **Security & Validation:**
    *   **Unique Callback URLs:** Consider using unique, unguessable callback URLs per user or per subscription if the platform allows, or include a unique identifier in the path that can be validated.
    *   **Google Calendar API:**
        *   Validate `X-Goog-Channel-ID` and `X-Goog-Resource-ID` headers in incoming notifications against stored values.
        *   Validate `X-Goog-Resource-State` (e.g., `sync`, `exists`, `not_exists`).
    *   **Microsoft Graph API:**
        *   Immediately respond to the subscription validation request with the `validationToken` found in the query parameters.
        *   For actual notifications, validate the `clientState` parameter in the notification payload against the one sent during subscription creation.
    *   **General:**
        *   Always use HTTPS for notification URLs.
        *   Log webhook receipt and validation outcomes.
        *   Consider rate limiting for incoming webhooks if abuse is a concern.
*   **Error Handling & Idempotency:**
    *   Webhook handlers should be idempotent. If a notification is received multiple times (e.g., due to retries from the provider), it should not cause duplicate processing or data corruption.
    *   If processing a webhook fails, implement a retry mechanism with backoff, potentially moving failed events to a dead-letter queue after several attempts for manual inspection.
*   **Stopping/Deleting Subscriptions:**
    *   When a user disconnects an account, the system must explicitly stop/delete the corresponding Google notification channels (using `channels/stop`) and Microsoft Graph subscriptions (using `DELETE /subscriptions/{id}`).
*   [ ] **Sync Status Granularity & Updates by Sync Module:**
    *   The `SyncModule` is responsible for updating `ConnectedAccount.syncStatus`, `ConnectedAccount.lastSyncAt`, `ConnectedAccount.initialSyncCompletedAt`, and `ConnectedAccount.lastSyncErrorDetails`.
    *   `syncStatus` can be one of: `PENDING_INITIAL_SYNC`, `INITIAL_SYNC_IN_PROGRESS`, `IDLE`, `SYNCING`, `ERROR_FULL`, `ERROR_PARTIAL`, `DISABLED`.
    *   **`PENDING_INITIAL_SYNC`**: Set when a `ConnectedAccount` is created but initial sync hasn't started (e.g., user hasn't selected native calendars yet).
    *   **`INITIAL_SYNC_IN_PROGRESS`**: Set at the beginning of `performInitialSync`.
    *   **`IDLE`**: Set after successful initial sync or successful ongoing sync operation. Implies the system is ready for the next sync cycle (polling) or is actively listening (webhooks).
    *   **`SYNCING`**: Set when an ongoing sync operation (webhook-triggered or poll-triggered) is actively processing changes.
    *   **`ERROR_FULL`**: Set if the entire sync process for an account fails catastrophically (e.g., auth token revoked, cannot connect to platform). All subsequent sync attempts might be paused until the issue is resolved.
    *   **`ERROR_PARTIAL`**: Set if some parts of the sync failed (e.g., one out of three native calendars couldn't be synced) but others succeeded during an initial or ongoing sync.
    *   **`DISABLED`**: Set if the user manually disables sync for the account or if a persistent, unrecoverable error (like auth revocation) occurs, requiring user intervention.
    *   `lastSyncErrorDetails` (JSON or Text field) should store structured information about the last error(s), e.g., `{ "timestamp": "...", "scope": "calendar_id_xyz" or "account", "message": "...", "platformErrorCode": "..." }`.
    *   The `CalendarsModule` might update a more granular, per-native-calendar sync status if that level of detail is implemented (e.g., `UserNativeCalendar.syncStatus`, `UserNativeCalendar.lastSyncError`). The `SyncModule` would then aggregate these statuses to determine the overall `ConnectedAccount.syncStatus`.
