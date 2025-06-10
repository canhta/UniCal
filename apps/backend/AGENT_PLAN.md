# AI Agent Implementation Plan: UniCal Backend (NestJS)

This document outlines the development plan for the UniCal backend, focusing on MVP features as defined in `FRD.md` and addressing challenges from `System_Challenges_And_Solutions.md`.

## Phase 1: Setup & Core Infrastructure

1.  **Project Initialization & Setup (Assumed mostly complete)**
    *   Verify NestJS project structure, ESLint, Prettier, TypeScript configuration.
2.  **Database Setup (using Prisma)**
    *   Install Prisma Client.
    *   Define Prisma schema (`schema.prisma`) for:
        *   `User` (id, email, passwordHash, etc. - FRD 3.1)
        *   `ConnectedAccount` (id, userId, platform (Google/Outlook), accountEmail, accessToken (encrypted), refreshToken (encrypted), scopes, nativeCalendarSelections - FRD 3.2, 3.5.4)
        *   `CalendarEvent` (id, userId, connectedAccountId, nativeEventId, nativeCalendarId, platformSource, title, description, startTimeUTC, endTimeUTC, isAllDay, location, recurrenceRule, privacyFlag, reminderInfo, lastSyncedTimestampFromNative - FRD 3.3, 3.4, System Challenges Data Model)
    *   Generate initial migration: `prisma migrate dev --name init`
    *   Create Prisma service for database interactions.
3.  **Configuration Management (`@nestjs/config`)**
    *   Setup `.env` file for: `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_REDIRECT_URI`, `TOKEN_ENCRYPTION_KEY`.
    *   Load and provide configuration values via `ConfigService`.
4.  **Core Modules & Services**
    *   **`AuthModule`**:
        *   `AuthService`: User registration, login (password hashing with bcrypt, JWT generation), password change.
        *   `JwtStrategy`, `LocalStrategy` for Passport.js.
        *   `AuthController`: Endpoints for `/auth/register`, `/auth/login`, `/auth/change-password`.
    *   **`UserModule`**:
        *   `UserService`: Manage user profiles (currently minimal, for password change).
        *   `UserController`: Endpoint for profile management.
    *   **`EncryptionService`**: Utility service for encrypting/decrypting tokens before DB storage.
    *   **`CalendarPlatformModule` (Abstract/Interface-driven if complex, or direct services)**
        *   `GoogleCalendarService`: Handles Google API interactions (OAuth, fetching calendars, fetching events, CUD events, webhook setup).
        *   `MicrosoftCalendarService`: Handles Microsoft Graph API interactions.
    *   **`ConnectedAccountModule`**:
        *   `ConnectedAccountService`: Manage connections (OAuth token exchange, storage, refresh, revocation), list user's native calendars, manage selected calendars for sync.
        *   `ConnectedAccountController`: Endpoints for `/connect/google`, `/connect/google/callback`, `/connect/microsoft`, `/connect/microsoft/callback`, `/connected-accounts` (GET, DELETE /:id), `/connected-accounts/:id/calendars` (GET, PUT for selection).
    *   **`EventModule`**:
        *   `EventService`: Core logic for CRUD operations on events (aggregating from UniCal DB, interacting with native platforms via `GoogleCalendarService`/`MicrosoftCalendarService`). Handles time zone conversions to UTC.
        *   `EventController`: Endpoints for `/events` (GET, POST, PUT /:id, DELETE /:id).
    *   **`SyncModule`**:
        *   `WebhookService`: Ingests webhook notifications from Google/Microsoft. Validates and queues processing.
        *   `PollingService` (using `@nestjs/schedule`): Periodically polls native calendars for changes.
        *   `SyncProcessingService`: Handles actual event fetching/updating based on webhooks or polling results. Implements conflict resolution ("last update wins").
        *   `WebhookController`: Endpoints for `/webhooks/google`, `/webhooks/microsoft`.
5.  **Logging (`@nestjs/common` Logger or custom like Winston)**
    *   Implement consistent logging across modules.
6.  **API Contract Definition**
    *   Use `@nestjs/swagger` to generate OpenAPI documentation.

## Phase 2: Implementing Core MVP Features

1.  **User Account Management (FRD 3.1)**
    *   Implement `AuthModule` and `UserModule` as described above.
2.  **Multi-Platform Connectivity (FRD 3.2, 3.5.4)**
    *   Implement `ConnectedAccountModule`, `GoogleCalendarService`, `MicrosoftCalendarService`.
    *   Securely store and manage OAuth tokens, including refresh mechanisms.
    *   Implement logic to fetch and allow user selection of native calendars under a connected account.
3.  **Unified Calendar View Support (FRD 3.3)**
    *   `EventService` to provide an endpoint that fetches events from UniCal's DB for a given user and date range, respecting selected calendars. Events should be in UTC.
4.  **Event Management (CRUD - FRD 3.4)**
    *   Implement `EventModule`.
    *   **Create Event (FRD 3.4.1):** Endpoint accepts event data, including target native calendar ID. `EventService` calls the respective platform service to create it natively, then stores a copy in UniCal DB.
    *   **Read Event (FRD 3.4.2):** Covered by fetching events for the view.
    *   **Update Event (FRD 3.4.3):** Endpoint accepts event updates. `EventService` updates the event on the native platform and then in UniCal DB.
    *   **Delete Event (FRD 3.4.4):** Endpoint triggers deletion on the native platform and then in UniCal DB.
    *   **Recurring Events (FRD 3.4.5 - Basic Sync & Display):**
        *   Store recurrence rule (e.g., RRULE string) from native events.
        *   For MVP, backend provides the rule; frontend expands it.
        *   Implement logic for updating/deleting single instances of recurring events by interacting with native platform APIs that support exceptions.
5.  **Two-Way Synchronization (FRD 3.5)**
    *   Implement `SyncModule`.
    *   **Webhook Setup:** `GoogleCalendarService`/`MicrosoftCalendarService` to handle webhook subscription creation during account connection and renewal.
    *   **Webhook Ingestion:** `WebhookController` and `WebhookService` to receive and validate notifications.
    *   **Outgoing Sync:** Event CUD operations in `EventService` should immediately call native platform APIs.
    *   **Polling:** `PollingService` to periodically check for changes using sync tokens/delta links.
    *   **Conflict Resolution:** `SyncProcessingService` to use "last update wins" based on native event's `updated` timestamp.
    *   **Sync Depth:** Ensure core fields (title, time, description, location, all-day, basic recurrence, privacy) are synced.
6.  **Privacy Controls (FRD 3.7.1 - Basic Indication)**
    *   `EventService` to read and store the privacy flag from native events.
7.  **Notifications (FRD 3.9.1 - Passthrough/Display)**
    *   `EventService` to read and store reminder information from native events.

## Phase 3: Addressing System Challenges

1.  **Two-Way Synchronization (System Challenges Doc - Section 1):**
    *   Implement robust webhook management (creation, renewal, deletion).
    *   Use message queues (e.g., BullMQ with Redis via `@nestjs/bullmq`) for background processing of sync tasks initiated by webhooks or polling to improve responsiveness and reliability.
    *   Data model for sync as defined in Phase 1.
    *   Implement platform-specific data mapping/transformation layers within `GoogleCalendarService` and `MicrosoftCalendarService` to handle nuances between UniCal's model and native platform representations.
2.  **Handling Recurring Events (System Challenges Doc - Section 2):**
    *   Focus on correctly storing/retrieving RRULEs and EXDATEs.
    *   Ensure API calls for single instance modifications correctly create exceptions on native platforms.
3.  **API Rate Limiting (System Challenges Doc - Section 3):**
    *   Implement retry mechanisms with exponential backoff in `GoogleCalendarService` and `MicrosoftCalendarService` for outgoing API calls.
    *   Log rate limit errors for monitoring.
4.  **Authentication & Authorization (System Challenges Doc - Section 4):**
    *   Ensure refresh tokens are encrypted in DB.
    *   Implement robust token refresh logic in platform services.
    *   Handle token revocation on account disconnect.
    *   Clear error handling for auth failures during connection.
5.  **Time Zone Handling (System Challenges Doc - Section 5):**
    *   Strictly use UTC for all date/time storage and internal processing.
    *   Ensure native platform API calls correctly handle time zones (e.g., sending UTC with time zone identifiers if required by the API).
6.  **System Scalability and Reliability (System Challenges Doc - Section 6):**
    *   Design services to be stateless.
    *   Utilize asynchronous processing (message queues) for sync operations.
    *   Optimize database queries (Prisma will help, but review generated queries).
    *   Implement comprehensive logging and basic monitoring hooks.

## Phase 4: Integration & Refinement

1.  **Testing:**
    *   Unit tests for services and controllers (Jest).
    *   Integration tests for module interactions and DB operations.
    *   E2E tests for API endpoints (`@nestjs/testing`).
2.  **Code Quality:**
    *   Enforce linting (ESLint) and formatting (Prettier) via CI.
3.  **API Documentation:**
    *   Ensure Swagger/OpenAPI documentation is complete and accurate.
4.  **Security:**
    *   Review for common vulnerabilities (OWASP Top 10).
    *   Input validation on all API endpoints (`class-validator`, `class-transformer`).
    *   Rate limiting on API endpoints (`@nestjs/throttler`).
5.  **Deployment:**
    *   Create Dockerfile for containerization.
    *   Basic deployment scripts or CI/CD pipeline setup (e.g., GitHub Actions).

This plan will be iterated upon as development progresses.
