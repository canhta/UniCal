# Calendars Module Plan (Backend)

**Overall Goal:** Provide a robust abstraction layer for interacting with external calendar platforms (e.g., Google Calendar, Outlook Calendar). This module translates UniCal's generic calendar operations into platform-specific API calls and normalizes platform responses.

**Alignment:** This plan primarily aligns with Backend AGENT_PLAN Phase 2 (Platform Integration Abstractions) and is a core dependency for Phase 3 (Sync & Event Management).

## 1. Core Interface (`i-calendar-platform.service.ts`)
*Goal: Define a consistent contract for all platform-specific calendar services.*

*   [x] **Define `ICalendarPlatformService` Interface:**
    *   `exchangeCodeForTokens(code: string, redirectUri: string): Promise<PlatformTokenResponseDto>`
    *   `refreshAccessToken(refreshToken: string): Promise<PlatformTokenRefreshResponseDto>`
    *   `revokeToken(token: string, tokenTypeHint?: 'access_token' | 'refresh_token'): Promise<void>`
    *   `listNativeCalendars(accessToken: string): Promise<PlatformCalendarDto[]>`
    *   `getNativeCalendarDetails(accessToken: string, calendarId: string): Promise<PlatformCalendarDto | null>`
    *   `createPlatformEvent(accessToken: string, calendarId: string, eventData: CreatePlatformEventDto): Promise<PlatformEventDto>`
    *   `updatePlatformEvent(accessToken: string, calendarId: string, platformEventId: string, eventData: UpdatePlatformEventDto, updateScope?: string, instanceOriginalStartTime?: string): Promise<PlatformEventDto>`
    *   `deletePlatformEvent(accessToken: string, calendarId: string, platformEventId: string, deleteScope?: string, instanceOriginalStartTime?: string): Promise<void>`
    *   `fetchPlatformEvents(accessToken: string, calendarId: string, queryParams: FetchPlatformEventsQueryDto): Promise<FetchPlatformEventsResponseDto>`
    *   `registerWebhook(accessToken: string, webhookUrl: string, calendarId: string, channelId: string): Promise<PlatformWebhookSubscriptionDto>` // `channelId` is UniCal-generated UUID for Google
    *   `stopWebhook(accessToken: string, webhookId: string, resourceId?: string): Promise<void>` // `resourceId` for Google

## 2. Platform-Agnostic DTOs (for Interface Contract)
*Goal: Define common data structures used by the `ICalendarPlatformService` interface and the main `CalendarsService` facade.*

*   [x] **`PlatformTokenResponseDto.ts`:** `accessToken`, `refreshToken?`, `expiresInSeconds?`, `scope?`, `idToken?`, `platformUserId?`, `email?`.
*   [x] **`PlatformTokenRefreshResponseDto.ts`:** `accessToken`, `expiresInSeconds?`, `scope?`, `idToken?`, `refreshToken?` (if rotated).
*   [x] **`PlatformCalendarDto.ts`:** `id` (native platform calendar ID), `name`, `description?`, `colorId?`, `backgroundColor?`, `timeZone?`, `isPrimary?`, `canEditEvents?`, `accessRole?`.
*   [x] **`PlatformEventDto.ts`:** `id` (native platform event ID), `title?`, `description?`, `startTime` (ISO String, UTC or with TZ), `endTime` (ISO String, UTC or with TZ), `timeZone?` (of event itself), `isAllDay?`, `location?`, `attendees?: PlatformAttendeeDto[]`, `organizer?: PlatformOrganizerDto`, `recurrenceRule?: string[]`, `recurringEventId?`, `status?`, `privacy?`, `colorId?`, `htmlLink?`, `hangoutLink?`, `created?` (ISO String), `updated?` (ISO String - platform's last modified), `reminders?: PlatformReminderDto`.
*   [x] **`PlatformAttendeeDto.ts`:** `email`, `displayName?`, `responseStatus?`, `organizer?`, `self?`.
*   [x] **`PlatformOrganizerDto.ts`:** `email`, `displayName?`, `self?`.
*   [x] **`PlatformReminderDto.ts`:** `useDefault: boolean`, `overrides?: { method: 'email' | 'popup', minutes: number }[]`.
*   [x] **`CreatePlatformEventDto.ts`:** (Subset of `PlatformEventDto` for creation, e.g., `title`, `startTime`, `endTime`, `attendees?`, `description?`, `location?`, `timeZone?` for interpreting start/end if not UTC, `recurrenceRule?`).
*   [x] **`UpdatePlatformEventDto.ts`:** (Subset of `PlatformEventDto` for updates, all fields optional, `recurrenceRule?`).
*   [x] **`FetchPlatformEventsQueryDto.ts`:** `timeMin?` (ISO DateTime), `timeMax?` (ISO DateTime), `syncToken?`, `pageToken?`, `maxResults?`, `showDeleted?`.
*   [x] **`FetchPlatformEventsResponseDto.ts`:** `events: PlatformEventDto[]`, `nextPageToken?: string`, `nextSyncToken?: string`.
*   [x] **`PlatformWebhookSubscriptionDto.ts`:** `id` (platform's webhook/subscription ID), `expirationTimestamp?: number` (Unix ms).

## 3. Platform-Specific Services (e.g., `google-calendar.service.ts`, `microsoft-calendar.service.ts`)
*Goal: Implement `ICalendarPlatformService` for each supported provider.*

*   [x] **For each platform (Google, Microsoft, etc.):**
    *   Create `[PlatformName]CalendarService.ts` implementing `ICalendarPlatformService`.
    *   Inject `HttpService` (from `@nestjs/axios`) and `ConfigService`.
    *   Use official SDKs (e.g., `googleapis`, `@microsoft/microsoft-graph-client`) or direct HTTP calls.
    *   Implement all methods from `ICalendarPlatformService`.
    *   Handle mapping between platform-specific API request/response formats and the common `Platform...Dto`s.
    *   Manage platform-specific OAuth details (endpoints, client ID/secret from `ConfigService`).
    *   Implement platform-specific error handling, mapping to standard NestJS exceptions.
    *   Handle token refresh logic if the platform SDK doesn't manage it transparently.

## 4. Main Facade Service (`calendars.service.ts`)
*Goal: Provide a single entry point for other backend modules to interact with calendar platforms, abstracting away the specific provider.*

*   [x] Create `CalendarsService`.
*   [x] Inject all platform-specific services (e.g., `GoogleCalendarService`, `MicrosoftCalendarService`).
*   [x] Inject `AccountsService` (to fetch `ConnectedAccount` details like platform type and tokens).
*   [x] Inject `EncryptionService` (to decrypt tokens).
*   [x] **Helper Method `_getPlatformService(platformType: string): ICalendarPlatformService`:** Returns the correct platform-specific service instance.
*   [x] **Helper Method `_getDecryptedAccessToken(connectedAccountId: string): Promise<string>`:**
    *   Uses `AccountsService.getRawTokens(connectedAccountId)` (new method in `AccountsService` to get encrypted tokens).
    *   Uses `EncryptionService.decrypt(encryptedToken)`.
    *   Handles token refresh if necessary:
        *   Check token expiry (if `expiresAt` is stored with `ConnectedAccount`).
        *   If expired or call fails with auth error:
            *   Get `refreshToken` from `AccountsService`.
            *   Call `_getPlatformService(platform).refreshAccessToken(decryptedRefreshToken)`.
            *   Use `AccountsService.updateTokens(connectedAccountId, newTokens)` to store new (encrypted) tokens.
            *   Return new decrypted `accessToken`.
*   [x] **Implement methods mirroring `ICalendarPlatformService`, but taking `connectedAccountId: string` as the first argument:**
    *   Example: `async listNativeCalendars(connectedAccountId: string): Promise<PlatformCalendarDto[]>`:
        1.  Fetch `ConnectedAccount` using `AccountsService.getAccountByIdInternal(connectedAccountId)` to get `provider` type.
        2.  Get `accessToken` using `_getDecryptedAccessToken(connectedAccountId)`.
        3.  Call `_getPlatformService(provider).listNativeCalendars(accessToken)`.
    *   Implement similar facade methods for all `ICalendarPlatformService` methods (`getNativeCalendarDetails`, `createPlatformEvent`, `updatePlatformEvent`, `deletePlatformEvent`, `fetchPlatformEvents`, `registerWebhook`, `stopWebhook`).
    *   **Note:** `exchangeCodeForTokens`, `refreshAccessToken` (direct), `revokeToken` are likely called directly on the specific platform services by `AuthCallbackHandler` or `AccountsService`, not through this facade for those specific operations. This facade is for ongoing calendar operations.

## 5. Module Setup (`calendars.module.ts`)
*Goal: Configure the NestJS module for calendars.*

*   [x] Create `CalendarsModule`.
*   [x] Import `HttpModule` (from `@nestjs/axios`).
*   [x] Import `ConfigModule`.
*   [x] Import `forwardRef(() => AccountsModule)` (for `AccountsService`).
*   [x] Import `EncryptionModule` (or a shared crypto module).
*   [x] Provide all platform-specific services (e.g., `GoogleCalendarService`, `MicrosoftCalendarService`).
*   [x] Declare and Export `CalendarsService` (the facade service).
*   [x] **Controllers created:** `CalendarsController` provides REST endpoints for calendar management.

## 6. Error Handling, Rate Limiting, Retries
*Goal: Make platform interactions resilient.*

*   [x] **Platform-Specific Error Handling:** Each platform service must:
    *   Catch API errors, parse responses, throw standardized NestJS exceptions (e.g., `HttpException`, `UnauthorizedException` for token issues, `NotFoundException`).
    *   Specifically handle token expiry errors to signal refresh needs to the facade.
*   [x] **Facade Error Handling (`CalendarsService`):**
    *   Catch errors from platform services.
    *   Handle token refresh logic upon specific auth errors.
    *   Propagate other errors or re-throw as standardized UniCal errors.
*   [x] **Rate Limiting & Retries:** Platform services should respect `Retry-After` headers. Consider simple retry mechanisms for transient errors. (More complex retry/queueing might be handled by `SyncModule` for background tasks).

## 7. Testing
*Goal: Ensure correctness and robustness of platform integrations.*

*   [ ] **Unit Tests for each `[PlatformName]CalendarService`:**
    *   Mock `HttpService`/SDK calls, `ConfigService`.
    *   Test each `ICalendarPlatformService` method for correct API call formation, data mapping, and error handling.
*   [ ] **Unit Tests for `CalendarsService` (Facade):**
    *   Mock platform-specific services, `AccountsService`, `EncryptionService`.
    *   Test correct dispatch to platform services.
    *   Test token decryption and refresh logic.
*   [ ] **Integration Tests (Limited):** Avoid live API calls in automated tests.

## 8. Google Calendar Auto-Sync Implementation
*Goal: Implement automatic synchronization with Google Calendar including webhooks and scheduled sync.*

*   [x] **Google Calendar Sync Service (`google-calendar-sync.service.ts`):**
    *   Manual sync for specific Google Calendar accounts
    *   Sync individual calendars with incremental sync support
    *   Process events (create, update, delete) from Google Calendar
    *   Scheduled automatic sync every hour using cron jobs
    *   Webhook notification handling (framework ready)
    *   Sync token management for efficient incremental sync
*   [x] **Integration with CalendarsModule:**
    *   Added sync service to module providers
    *   Added ScheduleModule for cron job support
    *   Created API endpoints for manual sync operations
*   [x] **Controller Endpoints:**
    *   `POST /calendars/sync/:accountId` - Manual sync for account
    *   `POST /calendars/webhooks/setup/:accountId` - Setup webhooks  
    *   `POST /calendars/webhooks/google` - Handle webhook notifications
*   [ ] **Database Models Enhancement:** Webhook and sync state models added to schema but not yet fully integrated due to Prisma client recognition issues
*   [x] **Error Handling and Retry Logic:** Implemented robust error handling with retry utilities for rate limiting
*   [x] **Logging and Monitoring:** Comprehensive logging for sync operations and webhook events

## 10. OAuth Integration Endpoints (Moved to IntegrationsModule)
*Goal: OAuth integration is now handled by dedicated IntegrationsModule for better separation.*

*   **Note:** OAuth endpoints have been moved to `IntegrationsModule`:
    *   `GET /integrations/oauth-url/:provider` - OAuth URL generation
    *   `GET /integrations/auth/:provider/callback` - OAuth callback handling  
    *   `POST /integrations/sync/:accountId` - Manual sync trigger
    *   `DELETE /integrations/accounts/:accountId` - Account disconnection

*   [x] **Platform Service Integration:**
    *   CalendarsModule provides platform-specific services for token exchange
    *   `GoogleCalendarService.exchangeCodeForTokens()` used by IntegrationsModule
    *   `MicrosoftCalendarService.exchangeCodeForTokens()` used by IntegrationsModule
    *   Existing sync functionality via `GoogleCalendarSyncService`

## 11. Dependencies
*   `@nestjs/axios`, `ConfigModule`
*   `googleapis` (for Google), `@microsoft/microsoft-graph-client` (for Microsoft)
*   `AccountsModule`, `EncryptionModule`

## Notes & Considerations:
*   **`AccountsService` needs a new method `getRawTokens(connectedAccountId: string): Promise<{accessToken: string, refreshToken?: string, provider: string, expiresAt?: Date}>` that returns the still-encrypted tokens and provider type.**
*   **Webhook Security:** `registerWebhook` should use a UniCal-generated `channelId` (UUID) that can be mapped back to `connectedAccountId` and `nativeCalendarId`. This `channelId` is part of the webhook URL for Google. For Microsoft, `clientState` in subscription can serve a similar purpose.
*   This module focuses on the *how* of talking to platforms. The *what* and *when* (e.g., which calendars to sync, when to fetch events) are driven by `AccountsService`, `EventsService`, and `SyncService`.
