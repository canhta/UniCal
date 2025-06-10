<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/backend/src/auth/AUTH_MODULE_PLAN.md -->
# Auth Module Plan

This plan outlines the development tasks for the Auth module, responsible for user authentication, authorization, and session management. It will coordinate closely with the `UserModule` and `AccountsModule`.

## Phase 1: Simplified Email-Only Login (Aligns with Backend AGENT_PLAN Phase 2 - Simplified Login)

*   [ ] **Module Setup:**
    *   Create `AuthService`.
    *   Create `AuthController`.
    *   Install `@nestjs/jwt` and `@nestjs/passport`.
*   [ ] **Configuration:**
    *   Define `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TOKEN_EXPIRATION`, `JWT_REFRESH_TOKEN_EXPIRATION` in `.env` and load via `ConfigService`. **(Ensure `EncryptionService` is NOT used for JWT secrets; these are for signing, not encryption at rest).**
*   [ ] **Simplified Login Logic:**
    *   `AuthService.generateTokens(user)`: Generate JWT access and refresh tokens.
    *   `AuthService.validateUserSimplified(email)`:
        *   Call `UserService.findByEmail(email)`.
        *   If user doesn't exist, call `UserService.create({ email, role: 'USER' })`.
        *   Return user object.
    *   `AuthController.simpleLogin(simpleLoginDto)`: (`POST /auth/simple-login`)
        *   Call `AuthService.validateUserSimplified()`.
        *   If valid, call `AuthService.generateTokens()` and return them.
*   [ ] **JWT Strategy & Guard:**
    *   Implement `JwtStrategy` to validate access tokens.
    *   Implement `JwtAuthGuard` to protect routes.
    *   Apply `JwtAuthGuard` to a test endpoint.
*   [ ] **DTOs:**
    *   `SimpleLoginDto` (email).
    *   `TokenResponseDto` (accessToken, refreshToken).

## Phase 2: Single Sign-On (SSO) Implementation (Aligns with Backend AGENT_PLAN Phase 2 - SSO)

*Prerequisites: `UserModule` can find/create users. `AccountsModule` is ready for OAuth token exchange and storage. `EncryptionService` is available.*

*   [ ] **Configuration:**
    *   Add Google/Microsoft OAuth client IDs, secrets, and callback URLs to `.env` and `ConfigService`. **(These secrets should be managed by `ConfigService` and potentially encrypted if stored outside `.env` in a config file, though `.env` is typical for these).**
*   [ ] **Google OAuth Strategy:**
    *   Implement `GoogleStrategy` (using `passport-google-oauth20`).
    *   `validate()` method:
        *   Receive Google profile.
        *   Call `UserService.findByEmail()` or `UserService.create()` to provision/link user.
        *   Call `AccountsService.createOrUpdateAccount()` to store Google tokens (encrypted using `EncryptionService`) and profile info.
        *   Return UniCal user object.
*   [ ] **Microsoft OAuth Strategy:**
    *   Implement `MicrosoftStrategy` (using a suitable Passport strategy e.g., `passport-microsoft`).
    *   `validate()` method: Similar to Google\'s, for Microsoft accounts. **(Ensure `EncryptionService` is used for external tokens here too).**
*   [ ] **Controller Endpoints for SSO:**
    *   `GET /auth/google`: Redirect to Google for authentication. **(Responsibility: Initiates external OAuth flow).**
    *   `GET /auth/google/callback`: Handles Google callback.
        *   Calls `AuthService.generateTokens()` for the validated/provisioned user.
        *   Redirects user to frontend with tokens (or frontend handles token reception).
    *   `GET /auth/microsoft`: Redirect to Microsoft for authentication. **(Responsibility: Initiates external OAuth flow).**
    *   `GET /auth/microsoft/callback`: Handles Microsoft callback. Similar to Google\'s.
*   [ ] **Refresh Token Logic:**
    *   `AuthService.refreshToken(refreshToken)`: Validate refresh token, issue new access token. **(This refers to UniCal's own JWT refresh tokens).**
    *   `AuthController.refresh()`: (`POST /auth/refresh`) Endpoint for token refresh.
    *   Implement `JwtRefreshStrategy`.
*   [ ] **Logout Logic:**
    *   `AuthController.logout()`: (`POST /auth/logout`)
        *   Invalidate refresh token (e.g., by storing it in a denylist or database table until it expires).
        *   Client-side should discard tokens.

## Phase 3: Full Email/Password Authentication (Aligns with Backend AGENT_PLAN Phase 2 - Full Auth)

*Prerequisites: `UserModule` supports password field and `updatePassword()`.*

*   [ ] **Local Strategy:**
    *   Implement `LocalStrategy` (using `passport-local`).
    *   `validate(email, password)`:
        *   Call `UserService.findByEmail()`.
        *   Verify password (using a hashing library like `bcrypt`).
*   [ ] **Registration:**
    *   `AuthService.register(createUserDto)`:
        *   Check if user exists.
        *   Hash password.
        *   Call `UserService.create()` with email, hashed password, role.
    *   `AuthController.register(createUserDto)`: (`POST /auth/register`) (FRD 3.1.1).
*   [ ] **Login with Password:**
    *   `AuthController.login(loginDto)`: (`POST /auth/login`) (FRD 3.1.2)
        *   Uses `LocalAuthGuard`.
        *   Calls `AuthService.generateTokens()`.
*   [ ] **Password Management:**
    *   `AuthService.forgotPassword(email)`: Generate reset token, send email (requires email service integration - out of scope for now, log token). (FRD 3.1.4)
    *   `AuthService.resetPassword(resetPasswordDto)`: Validate token, update password via `UserService.updatePassword()`. (FRD 3.1.4)
    *   `AuthService.changePassword(userId, changePasswordDto)`: Validate old password, update via `UserService.updatePassword()`. (FRD 3.1.5)
    *   `AuthController` endpoints for `forgot-password`, `reset-password`, `change-password`.
*   [ ] **DTOs:**
    *   `RegisterDto` (email, password).
    *   `LoginDto` (email, password).
    *   `ForgotPasswordDto` (email).
    *   `ResetPasswordDto` (token, newPassword).
    *   `ChangePasswordDto` (oldPassword, newPassword).

## Phase 4: Authorization & Security Hardening

*   [ ] **Role-Based Access Control (RBAC):**
    *   Implement `RolesGuard`.
    *   Define `Roles` decorator.
    *   Apply to admin-specific endpoints if any.
*   [ ] **Security Best Practices:**
    *   Review token handling (storage, transmission, expiration).
    *   Protect against common vulnerabilities (CSRF if using cookies, XSS).
    *   Implement rate limiting on auth endpoints (`@nestjs/throttler`).
    *   **Ensure `EncryptionService` is used for any sensitive data stored by AuthModule if not already covered by `AccountsService` (e.g. if storing parts of external profiles directly, though unlikely).**
*   [ ] **Testing:**
    *   Comprehensive unit tests for `AuthService`.
    *   Integration tests for all authentication flows (simple, SSO, local).
*   [ ] **Swagger Documentation:** Ensure all auth endpoints and DTOs are documented.

## Future Considerations:
*   Two-Factor Authentication (2FA).
*   Social login with other providers.
*   "Magic Link" authentication.
*   Audit logging for authentication events.
