# Integrations Module Plan (Backend)

**Overall Goal:** Handle OAuth flow for connecting external calendar providers (Google, Microsoft) with simplified client-server flow.

**Alignment:** This plan supports the simplified OAuth integration flow where frontend gets OAuth URLs from backend and backend handles all OAuth complexities.

## 1. OAuth URL Generation Service (`oauth-url.service.ts`)
*Goal: Generate OAuth authorization URLs for different providers.*

*   [x] **Create `OAuthUrlService`:**
    *   `generateGoogleOAuthUrl(state: string): Promise<string>` - Generate Google OAuth URL ✅
    *   `generateMicrosoftOAuthUrl(state: string): Promise<string>` - Generate Microsoft OAuth URL ✅
    *   `generateStateToken(): string` - Generate CSRF protection state token ✅
    *   `storeState(state: string, userId: string): Promise<void>` - Store state for validation ✅
    *   `validateState(state: string, userId: string): Promise<boolean>` - Validate state token ✅

*   [x] **State Management:**
    *   Use Redis or in-memory cache for temporary state storage ✅ (In-memory for now)
    *   State tokens expire after 10 minutes ✅
    *   Include user ID in state validation for security ✅

*   [x] **OAuth Configuration:**
    *   Inject `ConfigService` for OAuth client credentials ✅
    *   Support different redirect URIs for each provider ✅
    *   Generate correct scopes for calendar access ✅

## 2. OAuth Callback Handler (`oauth-callback.service.ts`)
*Goal: Handle OAuth callbacks from providers and create connected accounts.*

*   [x] **Create `OAuthCallbackService`:**
    *   `handleGoogleCallback(code: string, state: string): Promise<ConnectedAccount>` ✅
    *   `handleMicrosoftCallback(code: string, state: string): Promise<ConnectedAccount>` ✅
    *   `extractUserIdFromState(state: string): Promise<string>` - Get user from state ✅
    *   `exchangeCodeForTokens(provider: string, code: string): Promise<TokenResponse>` ✅

*   [x] **Token Management:**
    *   Exchange authorization code for access/refresh tokens ✅
    *   Encrypt tokens before storing using `EncryptionService` ✅
    *   Create `ConnectedAccount` record with encrypted tokens ✅
    *   Handle token expiry and refresh logic ✅

*   [x] **Error Handling:**
    *   Validate state parameter matches stored value ✅
    *   Handle OAuth errors (denied access, invalid code, etc.) ✅
    *   Return appropriate error responses to frontend ✅

## 3. Integrations Controller (`integrations.controller.ts`)
*Goal: Provide REST endpoints for integration management.*

*   [x] **OAuth URL Endpoints:**
    *   `GET /integrations/oauth-url/:provider` - Get OAuth authorization URL ✅
    *   Validate provider parameter (google, microsoft) ✅
    *   Generate and store state token ✅
    *   Return OAuth URL for frontend redirect ✅

*   [x] **Account Management Endpoints:**
    *   `GET /integrations/accounts` - List connected accounts for user ✅
    *   `GET /integrations/accounts/:accountId` - Get specific account details (N/A - using accounts module)
    *   `DELETE /integrations/accounts/:accountId` - Disconnect account (N/A - using accounts module)
    *   `POST /integrations/sync/:accountId` - Trigger manual sync ✅

*   [x] **OAuth Callback Handling:**
    *   `GET /integrations/auth/google/callback` - Handle Google OAuth callback ✅
    *   `GET /integrations/auth/microsoft/callback` - Handle Microsoft OAuth callback ✅
    *   Validate state and exchange code for tokens ✅
    *   Create ConnectedAccount via AccountsService ✅
    *   **Trigger initial sync**: `await syncService.triggerInitialSync(accountId)` ✅
    *   Redirect to frontend with success/error status ✅

## 5. Integration with Existing Modules

*   [x] **CalendarsModule Integration:**
    *   Use existing platform services for token exchange
    *   Leverage `GoogleCalendarService.exchangeCodeForTokens()`
    *   Leverage `MicrosoftCalendarService.exchangeCodeForTokens()`

*   [x] **AccountsModule Integration:**
    *   Use `AccountsService.createConnectedAccount()` to store accounts
    *   Use `AccountsService.deleteConnectedAccount()` for disconnection
    *   Use `AccountsService.getConnectedAccounts()` for listing

*   [x] **SyncModule Integration:**
    *   After successful OAuth callback, trigger initial sync:
    *   `await syncService.triggerInitialSync(connectedAccountId)`
    *   Connect manual sync endpoints to existing `GoogleCalendarSyncService`

*   [x] **Auth Module Integration:**
    *   Extract current user from JWT token in controller
    *   Ensure all endpoints require authentication
    *   Use `@UseGuards(JwtAuthGuard)` on all endpoints
    *   Include user ID in state tokens for security

## 5. DTO Definitions

*   [x] **`OAuthUrlResponseDto.ts`:**
    *   `url: string` - The OAuth authorization URL ✅
    *   `state: string` - State token for validation (optional, for debugging) ✅

*   [x] **`OAuthCallbackQueryDto.ts`:**
    *   `code: string` - Authorization code from provider ✅
    *   `state: string` - State token for CSRF protection ✅
    *   `error?: string` - OAuth error if authorization failed ✅

*   [x] **`ConnectedAccountListDto.ts`:**
    *   Extend existing `ConnectedAccountResponseDto` from core ✅
    *   Include sync status and last sync information ✅

## 6. Error Handling & Security

*   [ ] **State Validation:**
    *   All OAuth callbacks must validate state parameter
    *   State tokens are single-use and expire quickly
    *   Invalid state results in 400 Bad Request

*   [ ] **OAuth Error Handling:**
    *   Handle provider-specific error responses
    *   Map OAuth errors to user-friendly messages
    *   Log security-relevant events (failed state validation, etc.)

*   [ ] **Rate Limiting:**
    *   Implement rate limiting on OAuth URL generation
    *   Prevent abuse of callback endpoints
    *   Use `@nestjs/throttler` for rate limiting

## 7. Frontend Redirect Logic

*   [ ] **Success Redirects:**
    *   Successful OAuth: `{FRONTEND_BASE_URL}/integrations?status=success&provider={provider}`
    *   Include account ID in success redirect for immediate feedback

*   [ ] **Error Redirects:**
    *   OAuth errors: `{FRONTEND_BASE_URL}/integrations?status=error&provider={provider}&error={errorType}`
    *   State validation errors: `{FRONTEND_BASE_URL}/integrations?status=error&error=invalid_state`

## 8. Module Setup (`integrations.module.ts`)

*   [x] **Create `IntegrationsModule`:**
    *   Import `CalendarsModule` for platform services ✅
    *   Import `AccountsModule` for account management ✅
    *   Import `ConfigModule` for OAuth configuration ✅
    *   Import `CacheModule` for state management (N/A - using in-memory for now) ✅
    *   Provide `OAuthUrlService`, `OAuthCallbackService` ✅
    *   Export `IntegrationsController` ✅

*   [x] **Dependencies:**
    *   `@nestjs/cache-manager` for state storage (N/A - using Map for now) ✅
    *   `@nestjs/throttler` for rate limiting (Future improvement)
    *   Existing `CalendarsModule`, `AccountsModule` ✅

## 9. Testing Strategy

*   [ ] **Unit Tests:**
    *   Test OAuth URL generation with different providers
    *   Test state token generation and validation
    *   Test callback handling with mock OAuth responses
    *   Test error scenarios (invalid state, OAuth errors)

*   [ ] **Integration Tests:**
    *   Test complete OAuth flow end-to-end
    *   Test account creation and token storage
    *   Test frontend redirect logic
    *   Mock external OAuth providers for testing

## 10. Configuration

*   [ ] **Environment Variables:**
    *   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
    *   `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`
    *   `OAUTH_REDIRECT_BASE_URL` - Base URL for OAuth callbacks
    *   `FRONTEND_BASE_URL` - For redirects after OAuth completion

*   [ ] **OAuth Scopes:**
    *   Google: `https://www.googleapis.com/auth/calendar`
    *   Microsoft: `https://graph.microsoft.com/calendars.readwrite`

## Implementation Priority
1. OAuth URL generation service and endpoints
2. OAuth callback handling and token exchange
3. Integration with existing account management
4. Error handling and security measures
5. Testing and documentation

## Notes & Considerations:
*   **Security:** State tokens prevent CSRF attacks and must be validated on all callbacks
*   **Simplicity:** Frontend only needs to get OAuth URL and redirect - backend handles all complexity
*   **Token Management:** All tokens are encrypted before storage and managed by existing services
*   **User Experience:** Clear success/error feedback through redirect parameters
*   **Scalability:** State management uses cache for temporary storage, not database
