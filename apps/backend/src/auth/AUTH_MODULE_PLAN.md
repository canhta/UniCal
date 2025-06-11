# Auth Module Plan

## 0. Overview & Clarifications
*   **Primary Authenticator:** Auth0 (handles user registration, login including SSO, password management, email verification).
*   **UniCal User Identity & Session:** This module:
    1.  Handles Auth0 callback after successful authentication.
    2.  Validates Auth0 token/identity.
    3.  Ensures corresponding UniCal user record exists (via `UserModule`, based on Auth0 profile).
    4.  Issues UniCal's internal JWTs (access/refresh) for UniCal API session management.
*   **Distinction from AccountsModule:** `AuthModule` authenticates user to UniCal. `AccountsModule` connects authenticated user's external service accounts (e.g., Google Calendar) to UniCal.

## Phase 1: Auth0 Integration & UniCal Session Management (Aligns with Backend AGENT_PLAN Phase 2.1 & 2.2)
*Goal: Establish core Auth0 authentication flow and UniCal internal session token issuance.*

*   [x] **Module Setup (`auth.module.ts`):** Create `AuthService`, `AuthController`. Import `UserModule`, `JwtModule`, `PassportModule`, `ConfigModule`.
*   [x] **Configuration (`.env` & `ConfigService`):
    *   **UniCal JWT:** `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TOKEN_EXPIRATION`, `JWT_REFRESH_TOKEN_EXPIRATION`.
    *   **Auth0:** `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER_URL`, `AUTH0_CALLBACK_URL`.
*   [x] **Auth0 Passport Strategy (`Auth0Strategy.ts`):
    *   Implement Passport strategy (e.g., `passport-jwt` for Auth0) to validate Auth0-issued JWTs.
    *   Config: `jwksUri`, `audience`, `issuer`.
    *   `validate` method receives Auth0 payload (user info: `sub`, `email`, `name`, `picture`, `email_verified`).
*   [x] **Auth Controller (`auth.controller.ts`) - Simplified Flow (Frontend handles Auth0 SDK):
    *   `POST /auth/provider-login` (or similar endpoint, e.g., `/auth/auth0/callback`):
        *   Protected by `Auth0Strategy`.
        *   Receives Auth0 Access Token from frontend.
        *   On successful Auth0 token validation by `Auth0Strategy`:
            *   `Auth0Strategy.validate` provides Auth0 user profile.
            *   Call `UserService.findOrCreateUserFromProvider({ email: auth0Profile.email, name: auth0Profile.name, avatarUrl: auth0Profile.picture, emailVerified: auth0Profile.email_verified, authProvider: 'auth0', authProviderId: auth0Profile.sub })`.
            *   Call `AuthService.generateUniCalTokens(uniCalUser)` to issue UniCal internal JWTs.
            *   Return UniCal tokens to frontend.
    *   (Optional: `GET /auth/login` to redirect to Auth0 if backend initiates flow - less common if frontend uses Auth0 SDK directly).
*   [ ] **UniCal JWT Strategy & Guard (`JwtStrategy.ts`, `JwtAuthGuard.ts`):** Implement to validate UniCal's own access tokens (`JWT_SECRET`) and protect UniCal API routes.
*   [ ] **UniCal Token Generation (`AuthService.generateUniCalTokens`):** Generate UniCal `accessToken` and `refreshToken` using `@nestjs/jwt`.
*   [ ] **Refresh Token Logic (UniCal JWTs):
    *   `AuthService.refreshUniCalTokens(refreshToken)`: Validates UniCal refresh token, issues new access token.
    *   `AuthController.refresh()`: (`POST /auth/refresh`) Endpoint for UniCal token refresh. Uses `JwtRefreshAuthGuard`.
    *   Implement `JwtRefreshStrategy` (validates UniCal refresh tokens using `JWT_REFRESH_SECRET`).
*   [ ] **Logout Logic (`AuthController.logout`, `AuthService.logout`):
    *   `POST /auth/logout`: Accepts UniCal refresh token. Invalidate UniCal refresh token. Client discards tokens. Optionally, redirect to Auth0 logout.
*   [ ] **DTOs:** `UniCalTokenResponseDto { accessToken: string, refreshToken: string }`, `ProviderLoginDto { providerToken: string }`.

## Phase 2: Full Email/Password Auth & Password Management (If Required Post-SSO - Aligns with Backend AGENT_PLAN Phase 2.4)
*Goal: Implement traditional email/password registration and management if not solely relying on Auth0 for these.* 
*Note: Auth0 can handle these. This section is for a UniCal-managed alternative if specifically required by FRD and not offloaded to Auth0.*

*   [ ] **User Model Update (`UserModule`):** Add `password` (hashed) field to `User` entity if not already present for other reasons.
*   [ ] **Registration (`AuthController.register`, `AuthService.register`):
    *   `POST /auth/register` (FRD 3.1.1).
    *   Input: email, password, name.
    *   Hash password using `bcrypt`.
    *   Create user via `UserService`.
    *   (Optional: Email verification flow - see below).
*   [ ] **Login (Email/Password) (`AuthController.localLogin`, `AuthService.validateUserByPassword`):
    *   `POST /auth/login` (FRD 3.1.2).
    *   Input: email, password.
    *   Validate credentials. If valid, issue UniCal JWTs.
    *   Implement `LocalStrategy` (passport-local).
*   [ ] **Password Reset (`AuthController`, `AuthService`):
    *   `POST /auth/forgot-password` (FRD 3.1.4 - Step 1): Generate reset token, save (hashed) with expiry, send email.
    *   `POST /auth/reset-password` (FRD 3.1.4 - Step 2): Validate token, update password.
*   [ ] **Change Password (`AuthController`, `AuthService`):
    *   `POST /auth/change-password` (FRD 3.1.5 - Authenticated route): Validate old password, set new password.
*   [ ] **Email Verification (If UniCal manages this, not Auth0):
    *   Generate verification token on registration.
    *   Send verification email.
    *   `GET /auth/verify-email?token=<token>`: Endpoint to verify email.
    *   Protect login for unverified emails if necessary.
*   [ ] **DTOs:** `RegisterDto`, `LoginDto`, `ForgotPasswordDto`, `ResetPasswordDto`, `ChangePasswordDto`.

## Phase 3: Authorization & Security Hardening (Aligns with Backend AGENT_PLAN Phase 3)
*Goal: Implement access controls and enhance security.*

*   [ ] **Role-Based Access Control (RBAC) - If Needed:** Implement `RolesGuard`, `Roles` decorator. Roles from Auth0 custom claims or UniCal `User` model.
*   [ ] **Security Best Practices:** Review UniCal token handling (HttpOnly cookies for refresh tokens). CSRF protection if using cookies. Rate limiting (`@nestjs/throttler`) on auth endpoints.
*   [ ] **Testing:** Unit tests for `AuthService`. Integration tests for all auth flows (Auth0, local, refresh, logout, password management), mocking external dependencies.
*   [ ] **Swagger Documentation:** Document all auth endpoints and DTOs.

## Notes on Features Potentially Handled by Auth0 (Confirm Scope):
*   **User Registration, SSO, Email/Password Login, Password Management, Email Verification:** Auth0 can manage these. If Auth0 is the sole provider for these, relevant sections in Phase 2 can be simplified or removed, focusing only on the Auth0 integration part of Phase 1.

This plan assumes a primary reliance on Auth0, with optional fallback/parallel UniCal-managed email/password flows if explicitly required. The agent should prioritize Auth0 integration first.
