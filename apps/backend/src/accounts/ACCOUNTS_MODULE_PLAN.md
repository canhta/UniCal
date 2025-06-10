# Accounts Plan

This plan outlines the development tasks for the Accounts module (manages connected calendar accounts).

## Phase 1: Setup & Core Infrastructure
- [ ] TODO: Define `ConnectedAccount` schema in `schema.prisma` (e.g., `id`, `userId`, `platform` (enum: GOOGLE, MICROSOFT), `accountIdOnPlatform`, `emailOnPlatform`, `encryptedAccessToken`, `encryptedRefreshToken`, `tokenExpiresAt`, `scopes`, `selectedNativeCalendarIds`).
- [ ] TODO: Create `AccountsService` and `AccountsController`.
- [ ] TODO: Define DTOs for managing connected accounts (e.g., `ConnectAccountDto`, `ConnectedAccountResponseDto`, `SelectCalendarsDto`, `UpdateSelectedCalendarsDto`).
- [X] TODO: Integrate `EncryptionService` for token encryption/decryption. **(Ensure this is used for `encryptedAccessToken` and `encryptedRefreshToken`)**

## Phase 2: Staged Feature Implementation

### Core Scheduling Functionalities & Multi-Platform Connectivity
- [ ] TODO: `AccountsService.createOrUpdateAccount()`: Store/update platform connection details, including encrypted tokens (FRD 3.2.1, FRD 3.2.2). **(Ensure `EncryptionService` is used here)**
- [ ] TODO: `AccountsService.getAccountDetails()`: Retrieve connected account info for a user.
- [ ] TODO: `AccountsService.listConnectedAccounts()` for a user (FRD 3.2.5).
- [ ] TODO: `AccountsService.disconnectAccount()`: Remove account from DB, revoke tokens with platform if API allows (FRD 3.2.5).
- [ ] TODO: `AccountsController`: Implement endpoint to initiate OAuth flow (redirect to platform). **(Clarify: This initiates the OAuth flow; actual token exchange happens in the callback)**.
- [ ] TODO: `AccountsController`: Implement OAuth callback endpoint (receives code, exchanges for tokens, calls `AccountsService.createOrUpdateAccount()`). **(This is the primary handler for external OAuth callbacks)**.
- [ ] TODO: `AccountsService.listNativeCalendarsForAccount()`: Use `CalendarsModule` (e.g., `GoogleCalendarService.listNativeCalendars()`) to fetch native calendars for a connected account (FRD 3.2.1, FRD 3.2.2, FRD 3.5.4).
- [ ] TODO: `AccountsService.saveSelectedNativeCalendars()`: Store user\'s selection of native calendar IDs to sync against the `ConnectedAccount` (FRD 3.5.4).
- [ ] TODO: `AccountsController`: Endpoints for listing native calendars of a connected account and for updating the selection of calendars to sync.
- [ ] TODO: Implement basic sync status display on \"Connected Accounts\" page/data (FRD 3.9.3) - provide data for this.

## Phase 3: System Challenges & Hardening
- [ ] TODO: Implement robust refresh token logic (securely use `EncryptionService`, schedule token refresh). **(This refers to refreshing external platform tokens, e.g., Google, Microsoft)**
- [ ] TODO: Handle token expiration and re-authentication flows gracefully.
- [ ] TODO: Ensure secure storage and handling of all sensitive account data (tokens, account IDs) **(Leverage `EncryptionService`)**.
- [ ] TODO: Implement error handling for OAuth failures and token issues (FRD 3.2.6). **(Define specific error codes/messages for frontend consumption)**
- [ ] TODO: Consider data cleanup on account disconnection.
- [ ] TODO: **Define and store necessary OAuth client secrets and callback URLs in configuration (e.g., `.env` file, accessed via `ConfigService`).**

## Phase 4: Integration & Refinement
- [ ] TODO: Write comprehensive unit tests for `AccountsService`.
- [ ] TODO: Write integration tests for account connection, token management, and calendar selection flows.
- [ ] TODO: Ensure Swagger documentation is complete and accurate for all `AccountsController` endpoints.
