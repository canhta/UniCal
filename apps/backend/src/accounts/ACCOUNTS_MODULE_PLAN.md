# Accounts Plan

This plan outlines the development tasks for the Accounts module (manages connected calendar accounts).

## Phase 1: Setup & Core Infrastructure
- [X] TODO: Define `ConnectedAccount` schema in `prisma/schema.prisma` (e.g., `id`, `userId`, `platform` (enum: GOOGLE, MICROSOFT), `accountIdOnPlatform`, `emailOnPlatform`, `encryptedAccessToken`, `encryptedRefreshToken`, `tokenExpiresAt`, `scopes`, `selectedNativeCalendarIds`, `syncStatus`, `lastSyncAt`, `initialSyncCompletedAt`, `lastSyncErrorDetails`, `nextSyncToken`). **(Added sync-related fields)**
- [X] TODO: Create `AccountsService` and `AccountsController`.
- [X] TODO: Define DTOs for managing connected accounts (e.g., `ConnectAccountDto`, `ConnectedAccountResponseDto`, `SelectCalendarsDto`, `UpdateSelectedCalendarsDto`, `NativeCalendarDto`).
- [X] TODO: Integrate `EncryptionService` for token encryption/decryption. **(Ensure this is used for `encryptedAccessToken` and `encryptedRefreshToken`)**

## Phase 2: Staged Feature Implementation

### Core Scheduling Functionalities & Multi-Platform Connectivity
- [ ] TODO: `AccountsService.createOrUpdateAccountFromOAuth(userId, platform, platformTokens, platformProfile)`: Store/update platform connection details, including encrypted tokens (FRD 3.2.1, FRD 3.2.2). Called by OAuth callback handlers. **(Ensure `EncryptionService` is used here. Set initial `syncStatus` to `PENDING_INITIAL_SYNC`)**
- [ ] TODO: `AccountsService.getAccountDetails(userId, accountId)`: Retrieve specific connected account info for a user.
- [ ] TODO: `AccountsService.listConnectedAccounts(userId)`: for a user (FRD 3.2.5). Include basic sync status.
- [ ] TODO: `AccountsService.disconnectAccount(userId, accountId)`: Remove account from DB, revoke tokens with platform if API allows (FRD 3.2.5).
- [ ] TODO: `AccountsController`: Endpoint to initiate OAuth flow for *connecting an account* (e.g., `GET /accounts/connect/google`, `GET /accounts/connect/microsoft`). Redirects to platform. **(This is distinct from AuthModule's SSO login flow)**.
- [ ] TODO: `AccountsController`: OAuth callback endpoints (e.g., `GET /accounts/connect/google/callback`, `GET /accounts/connect/microsoft/callback`). Receives code, exchanges for tokens (via `CalendarPlatformModule`), then calls `AccountsService.createOrUpdateAccountFromOAuth()`. Redirects to frontend (e.g., `/integrations?status=success_connect_google`).
- [ ] TODO: `AccountsService.listNativeCalendarsForAccount(userId, accountId)`: Use `CalendarPlatformModule` (e.g., `GoogleCalendarService.listNativeCalendars()`) to fetch native calendars for a connected account (FRD 3.2.1, FRD 3.2.2, FRD 3.5.4).
- [ ] TODO: `AccountsService.saveSelectedNativeCalendars(userId, accountId, selectedCalendarIds)`: Store user's selection of native calendar IDs to sync against the `ConnectedAccount` (FRD 3.5.4). **(This action should trigger the initial sync process via `SyncModule` if `initialSyncCompletedAt` is null).**
- [ ] TODO: `AccountsController`: Endpoints for listing native calendars of a connected account and for updating the selection of calendars to sync.
- [ ] TODO: `AccountsService.updateSyncStatus(accountId, status, errorDetails)`: Method to be called by `SyncModule` to update sync-related fields on `ConnectedAccount`.

## Phase 3: System Challenges & Hardening
- [ ] TODO: Implement robust refresh token logic for *external platform tokens* (securely use `EncryptionService`, schedule token refresh via `CalendarPlatformModule` and potentially a job queue if proactive refresh is needed). **(This refers to refreshing external platform tokens, e.g., Google, Microsoft)**
- [ ] TODO: Handle token expiration and re-authentication flows gracefully.
- [ ] TODO: Ensure secure storage and handling of all sensitive account data (tokens, account IDs) **(Leverage `EncryptionService`)**.
- [ ] TODO: Implement error handling for OAuth failures and token issues (FRD 3.2.6). **(Define specific error codes/messages for frontend consumption)**
- [ ] TODO: Consider data cleanup on account disconnection.
- [ ] TODO: **Define and store necessary OAuth client secrets and callback URLs in configuration (e.g., `.env` file, accessed via `ConfigService`).**

## Phase 4: Integration & Refinement
- [ ] TODO: Write comprehensive unit tests for `AccountsService`.
- [ ] TODO: Write integration tests for account connection, token management, and calendar selection flows.
- [ ] TODO: Ensure Swagger documentation is complete and accurate for all `AccountsController` endpoints.
