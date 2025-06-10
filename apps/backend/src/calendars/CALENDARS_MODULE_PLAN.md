# Calendars Plan

This plan outlines the development tasks for the Calendars module.

## Phase 1: Setup & Core Infrastructure
- [ ] TODO: Define `ICalendarPlatformService` interface (methods for connect, list calendars, fetch events, CRUD events, handle webhooks).
- [ ] TODO: Create `GoogleCalendarService` implementing `ICalendarPlatformService`.
- [ ] TODO: Create `MicrosoftCalendarService` implementing `ICalendarPlatformService`.
- [ ] TODO: Define DTOs for calendar and event data from platforms (e.g., `PlatformCalendarDto`, `PlatformEventDto`).
- [ ] TODO: Setup basic module structure for `CalendarsModule` (module, service, controller if any direct exposure).

## Phase 2: Staged Feature Implementation

### SSO Auth Aspects & Initial Connectivity (Links to AuthModule & AccountsModule)
- [ ] TODO: Implement OAuth client logic for Google (obtaining tokens - FRD 3.2.1) - **(Clarify: This module focuses on *using* tokens provided by `AccountsModule` to interact with Google Calendar APIs. Token acquisition and management are primarily `AccountsModule` and `AuthModule` responsibilities.)**
- [ ] TODO: Implement OAuth client logic for Microsoft (obtaining tokens - FRD 3.2.2) - **(Clarify: Similar to Google, this module uses tokens managed by `AccountsModule` for Microsoft Graph API calls.)**

### Core Scheduling Functionalities (Unified View & Event Management)
- [ ] TODO: `GoogleCalendarService`: Implement `listNativeCalendars()` (FRD 3.2.1, FRD 3.5.4).
- [ ] TODO: `MicrosoftCalendarService`: Implement `listNativeCalendars()` (FRD 3.2.2, FRD 3.5.4).
- [ ] TODO: `GoogleCalendarService`: Implement `fetchEvents()` (FRD 3.3.1, FRD 3.4.2). **(Consider adding a sub-task for platform-specific data mapping to UniCal's internal event model for deep synchronization needs).**
- [ ] TODO: `MicrosoftCalendarService`: Implement `fetchEvents()` (FRD 3.3.1, FRD 3.4.2). **(Consider adding a sub-task for platform-specific data mapping here as well).**
- [ ] TODO: `GoogleCalendarService`: Implement `createEvent()` (FRD 3.4.1).
- [ ] TODO: `MicrosoftCalendarService`: Implement `createEvent()` (FRD 3.4.1).
- [ ] TODO: `GoogleCalendarService`: Implement `updateEvent()` (FRD 3.4.3).
- [ ] TODO: `MicrosoftCalendarService`: Implement `updateEvent()` (FRD 3.4.3).
- [ ] TODO: `GoogleCalendarService`: Implement `deleteEvent()` (FRD 3.4.4).
- [ ] TODO: `MicrosoftCalendarService`: Implement `deleteEvent()` (FRD 3.4.4).
- [ ] TODO: Handle basic recurrence reading (FRD 3.4.5) in `fetchEvents`.
- [ ] TODO: Handle privacy flag reading (FRD 3.7.1) in `fetchEvents`.
- [ ] TODO: Handle reminder info reading (FRD 3.9.1) in `fetchEvents`.
- [ ] TODO: Implement webhook registration/handling logic for Google (part of `ICalendarPlatformService`). **(Ensure webhook secrets are configurable via `ConfigService` and stored in `.env`).**
- [ ] TODO: Implement webhook registration/handling logic for Microsoft (part of `ICalendarPlatformService`). **(Ensure webhook secrets are configurable via `ConfigService` and stored in `.env`).**

### 3. API Endpoints

*   `GET /connected-accounts`: Lists all calendar accounts (e.g., Google, Microsoft) connected by the user.
*   `GET /calendars?accountId=<accountId>`: Lists all individual native calendars available under a specific connected account.
*   `POST /calendars/sync-preferences`: Allows the user to set sync preferences for individual native calendars (e.g., enable/disable sync, perhaps set a UCS display color if not using platform default).
    *   Request: `{ calendarSettings: [{ nativeCalendarId: string, syncEnabled: boolean, ucsColorOverride?: string }] }`
*   `GET /calendars/targetable`: Lists all native calendars (across all connected accounts) that the user can select as a target for creating new events. Response should include `nativeCalendarId`, `name`, `accountName` (e.g., "Work Calendar - user@google.com").

### 4. Data Models

*   **ConnectedAccount:** Stores information about a user's connection to an external calendar platform.
    *   `accountId` (Primary Key, UUID)
    *   `userId` (Foreign Key)
    *   `platform` (String, e.g., 'google', 'microsoft')
    *   `platformUserId` (String, User ID on the external platform)
    *   `accessToken` (String, Encrypted)
    *   `refreshToken` (String, Encrypted, optional)
    *   `tokenExpiry` (DateTime, optional)
    *   `scopesGranted` (JSON array of strings)
    *   `lastSyncStatus` (String, e.g., 'connected', 'needs_reauth', 'error')
    *   `lastSyncTime` (DateTime)
*   **UserCalendarSetting:** Stores user-specific settings for each native calendar they have access to.
    *   `settingId` (Primary Key, UUID)
    *   `userId` (Foreign Key)
    *   `nativeCalendarId` (String, ID of the calendar on the native platform)
    *   `connectedAccountId` (Foreign Key to ConnectedAccount)
    *   `name` (String, Name of the native calendar)
    *   `description` (String, optional)
    *   `colorIdFromProvider` (String, optional, Color ID set on the native platform)
    *   `ucsColorOverride` (String, optional, Hex color code if user overrides in UCS)
    *   `isReadOnly` (Boolean, From provider)
    *   `syncEnabled` (Boolean, User preference to sync this calendar)
    *   `lastSuccessfullySyncedAt` (DateTime)

## Phase 3: System Challenges & Hardening
- [ ] TODO: Implement robust error handling for API calls to Google/Microsoft.
- [ ] TODO: Implement retry mechanisms for platform API calls.
- [ ] TODO: Ensure proper handling of API rate limits from Google/Microsoft.
- [ ] TODO: Refine time zone handling for event data from platforms (ensure UTC conversion and storage).
- [ ] TODO: Advanced recurrence: instance modification/exceptions (FRD 3.4.5).

## Phase 4: Integration & Refinement
- [ ] TODO: Write comprehensive unit tests for `GoogleCalendarService` and `MicrosoftCalendarService`.
- [ ] TODO: Write integration tests for platform interactions (mocking external APIs).
- [ ] TODO: Ensure Swagger documentation for any exposed DTOs/endpoints is accurate.

### 6. Color Management
*   The backend will attempt to fetch the color assigned to a calendar on its native platform (e.g., Google Calendar color, Outlook category color if applicable).
*   This color will be stored in `UserCalendarSetting.colorIdFromProvider`.
*   The API endpoint that lists calendars (e.g., `GET /calendars` or as part of event data) will provide this color information to the frontend.
*   If `ucsColorOverride` is set, it takes precedence.
*   If no color is available from the provider or UCS, the frontend can fall back to a fixed color per platform (e.g., Google=blue, Outlook=green) as per FRD FR3.6.2 for initial simplicity, but the infrastructure allows for per-calendar colors.

### 7. Sync Status and Error Handling
*   The `ConnectedAccount` data model includes `lastSyncStatus` and `lastSyncTime` fields.
*   The `GET /connected-accounts` endpoint should return these fields.
*   The `SYNC_MODULE_PLAN.md` should detail how these statuses are updated (e.g., 'connected', 'needs_reauth', 'syncing', 'error', 'disabled').
*   The frontend's `INTEGRATIONS_FEATURE_PLAN.md` (for the "Connected Accounts" page) will detail how these statuses are displayed to the user.
*   For the calendar view itself, direct display of per-calendar sync errors is likely post-initial product. Users would refer to the Integrations page for detailed sync health.
