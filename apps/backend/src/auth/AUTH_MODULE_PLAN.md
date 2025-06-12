# Auth Module Plan

## 0. Overview & Clarifications
*   **UniCal User Identity & Session:** This module:
    1.  Handles user registration and login.
    2.  Issues UniCal's internal JWTs (access/refresh) for UniCal API session management.
*   **Distinction from AccountsModule:** `AuthModule` authenticates user to UniCal. `AccountsModule` connects authenticated user's external service accounts (e.g., Google Calendar) to UniCal.

## Phase 1: UniCal Session Management (Aligns with Backend AGENT_PLAN Phase 2.1 & 2.2)
*Goal: Establish core authentication flow and UniCal internal session token issuance.*

*   [x] **Module Setup (`auth.module.ts`):** Create `AuthService`, `AuthController`. Import `UserModule`, `JwtModule`, `PassportModule`, `ConfigModule`.
*   [x] **Configuration (`.env` & `ConfigService`):
    *   **UniCal JWT:** `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TOKEN_EXPIRATION`, `JWT_REFRESH_TOKEN_EXPIRATION`.
*   [x] **Auth Controller (`auth.controller.ts`) - Simplified Flow:
    *   `POST /auth/login`:
        *   Receives credentials (email/password) from frontend.
        *   Validates credentials.
        *   Calls `AuthService.generateUniCalTokens(uniCalUser)` to issue UniCal internal JWTs.
        *   Returns UniCal tokens to frontend.
    *   (Optional: `GET /auth/login` to initiate login flow).
*   [ ] **UniCal JWT Strategy & Guard (`JwtStrategy.ts`, `JwtAuthGuard.ts`):** Implement to validate UniCal's own access tokens (`JWT_SECRET`) and protect UniCal API routes.
*   [ ] **UniCal Token Generation (`AuthService.generateUniCalTokens`):** Generate UniCal `accessToken` and `refreshToken` using `@nestjs/jwt`.
*   [ ] **Refresh Token Logic (UniCal JWTs):
    *   `AuthService.refreshUniCalTokens(refreshToken)`: Validates UniCal refresh token, issues new access token.
    *   `AuthController.refresh()`: (`POST /auth/refresh`) Endpoint for UniCal token refresh. Uses `JwtRefreshAuthGuard`.
    *   Implement `JwtRefreshStrategy` (validates UniCal refresh tokens using `JWT_REFRESH_SECRET`).
*   [ ] **Logout Logic (`AuthController.logout`, `AuthService.logout`):
    *   `POST /auth/logout`: Accepts UniCal refresh token. Invalidate UniCal refresh token. Client discards tokens.
*   [ ] **DTOs:** `UniCalTokenResponseDto { accessToken: string, refreshToken: string }`.

## Phase 2: Full Email/Password Auth & Password Management (Aligns with Backend AGENT_PLAN Phase 2.4)
*Goal: Implement traditional email/password registration and management.*

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
*   [ ] **Email Verification (If UniCal manages this):
    *   Generate verification token on registration.
    *   Send verification email.
    *   `GET /auth/verify-email?token=<token>`: Endpoint to verify email.
    *   Protect login for unverified emails if necessary.
*   [ ] **DTOs:** `RegisterDto`, `LoginDto`, `ForgotPasswordDto`, `ResetPasswordDto`, `ChangePasswordDto`.

## Phase 3: Authorization & Security Hardening (Aligns with Backend AGENT_PLAN Phase 3)
*Goal: Implement access controls and enhance security.*

*   [ ] **Role-Based Access Control (RBAC) - If Needed:** Implement `RolesGuard`, `Roles` decorator. Roles from custom claims or UniCal `User` model.
*   [ ] **Security Best Practices:** Review UniCal token handling (HttpOnly cookies for refresh tokens). CSRF protection if using cookies. Rate limiting (`@nestjs/throttler`) on auth endpoints.
*   [ ] **Testing:** Unit tests for `AuthService`. Integration tests for all auth flows (local, refresh, logout, password management), mocking external dependencies.
*   [ ] **Swagger Documentation:** Document all auth endpoints and DTOs.

## Notes on Features Potentially Handled by External Providers (Confirm Scope):
*   **User Registration, Email/Password Login, Password Management, Email Verification:** These can be managed by external providers. If so, relevant sections in Phase 2 can be simplified or removed, focusing only on the integration part of Phase 1.

This plan assumes a primary reliance on external providers for certain features, with optional fallback/parallel UniCal-managed email/password flows if explicitly required. The agent should prioritize integration with external providers first.
