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

## 2. Core Features

*   **User Registration:**
    *   Endpoint: `POST /auth/register`
    *   Request: `{ name, email, password }`
    *   Process:
        *   Validate input.
        *   Check if email already exists.
        *   Hash password (e.g., using bcrypt).
        *   Create new user record with `emailVerified` set to `false`.
        *   **Generate a unique email verification token (e.g., JWT or random string with expiry).**
        *   **Store/cache the verification token, associating it with the user ID.**
        *   **Trigger an email service to send a verification email containing a link with this token (e.g., `https://<frontend_url>/verify-email?token=<token>`).**
    *   Response: `201 Created` with user object (excluding sensitive info) or a success message indicating that a verification email has been sent.
*   **User Login:**
    *   Endpoint: `POST /auth/login`
    *   Request: `{ email, password }`
    *   Process:
        *   Validate input.
        *   Check if user exists and is verified.
        *   If using password grant, verify password.
        *   Generate and return access and refresh tokens.
    *   Response: `200 OK` with tokens.
*   **Token Refresh:**
    *   Endpoint: `POST /auth/refresh`
    *   Request: `{ refreshToken }`
    *   Process:
        *   Validate and decode the refresh token.
        *   Check if it's in the denylist (if applicable).
        *   Generate and return new access and refresh tokens.
    *   Response: `200 OK` with new tokens.
*   **Get Authenticated User:**
    *   Endpoint: `GET /auth/me`
    *   Process:
        *   Extract user information from the access token.
        *   Optionally, load additional user details from the database.
    *   Response: `200 OK` with user information.
*   **Logout:**
    *   Endpoint: `POST /auth/logout`
    *   Process:
        *   Invalidate the refresh token (e.g., by adding to a denylist).
        *   Optionally, invalidate the access token.
    *   Response: `204 No Content` or similar.
*   **Email Verification:**
    *   **Verify Email Address:**
        *   Endpoint: `GET /auth/verify-email`
        *   Query Parameter: `token`
        *   Process:
            *   Retrieve and validate the verification token.
            *   If valid and not expired:
                *   Find the associated user.
                *   Update the user's `emailVerified` status to `true`.
                *   Invalidate or clear the verification token.
                *   Optionally, generate and return auth tokens (access & refresh) if immediate login post-verification is desired.
            *   If invalid or expired:
                *   Return an appropriate error.
        *   Response: Success message (e.g., "Email verified successfully") or error message.
    *   **Resend Verification Email:**
        *   Endpoint: `POST /auth/resend-verification-email`
        *   Request: `{ email }` (User must be identified, perhaps already logged in but unverified, or just by email if not logged in)
        *   Process:
            *   Find the user by email.
            *   Check if the email is already verified. If so, return a message.
            *   If not verified, generate a new verification token (invalidating any previous ones for this user).
            *   Store/cache the new token.
            *   Trigger the email service to send a new verification email.
        *   Response: Success message (e.g., "Verification email resent") or error message.

*   **Password Management:**
    *   **Initiate Password Reset:**
        *   Endpoint: `POST /auth/forgot-password`
        *   Request: `{ email }`
        *   Process:
            *   Find user by email.
            *   If user exists and email is verified:
                *   Generate a unique, time-limited password reset token (e.g., JWT or secure random string).
                *   Store/cache the reset token, associating it with the user ID.
                *   Trigger an email service to send a password reset email containing a link with this token (e.g., `https://<frontend_url>/reset-password?token=<token>`).
            *   Return a success message indicating that if the email exists and is verified, a reset link has been sent (to prevent user enumeration).
        *   Response: `200 OK` with a generic success message.
    *   **Verify Password Reset Token:**
        *   Endpoint: `GET /auth/verify-reset-token`
        *   Query Parameter: `token`
        *   Process:
            *   Retrieve and validate the password reset token.
            *   If valid and not expired, return a success response indicating the token is valid for reset.
            *   If invalid or expired, return an error.
        *   Response: `200 OK` (if valid) or error (e.g., `400 Bad Request` or `401 Unauthorized`).
    *   **Reset Password:**
        *   Endpoint: `POST /auth/reset-password`
        *   Request: `{ token, newPassword }`
        *   Process:
            *   Retrieve and validate the password reset token.
            *   If valid and not expired:
                *   Find the associated user.
                *   Hash the `newPassword`.
                *   Update the user's password.
                *   Invalidate the password reset token.
                *   Optionally, invalidate all active sessions/refresh tokens for the user for security.
                *   Return a success message.
            *   If invalid or expired, return an error.
        *   Response: `200 OK` (on success) or error.

### 3. Data Models

*   **User Model:**
    *   `id` (UUID, primary key)
    *   `name` (string)
    *   `email` (string, unique)
    *   `password` (hashed string, optional for social login)
    *   `role` (enum: 'USER', 'ADMIN', etc.)
    *   `createdAt` (timestamp)
    *   `updatedAt` (timestamp)
    *   `emailVerified` (boolean, defaults to `false`) - **Added**
    *   `emailVerificationToken` (string, optional) - **Added, for storing the verification token**
    *   `emailVerificationExpires` (timestamp, optional) - **Added, for token expiry**

### 4. Token Management (JWT)

*   **Access Token:**
    *   Short-lived token (e.g., 15 minutes).
    *   Contains user ID and role, issued at, and expiration.
    *   Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeJK9y6bpQ0s1b6z8Q0s1b6z8Q0s1b6z8`
*   **Refresh Token:**
    *   Longer-lived token (e.g., 7 days).
    *   Used to obtain new access tokens.
    *   Should be stored securely (e.g., HttpOnly cookie).
    *   Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeJK9y6bpQ0s1b6z8Q0s1b6z8Q0s1b6z8`
*   **Token Blacklisting:**
    *   Consider blacklisting refresh tokens on logout or password change.
    *   Implement a denylist in the database or in-memory store (e.g., Redis).

### 5. External Dependencies

*   **Passport Strategies:**
    *   `passport-jwt` for JWT authentication.
    *   `passport-local` for local username/password authentication.
    *   `passport-google-oauth20` for Google SSO.
    *   `passport-microsoft` for Microsoft SSO.
*   **JWT Library:**
    *   `jsonwebtoken` for signing and verifying JWTs.
*   **Encryption Library:**
    *   `bcrypt` for hashing passwords.
    *   `crypto` for secure random token generation (if needed).

### 6. Security Considerations

*   **Token Security:** Access and refresh tokens should be securely generated, with sufficient entropy and length. Consider using a library like `crypto` for generation.
*   **Storage:** Tokens should be stored securely on the client-side (e.g., HttpOnly cookies or secure storage mechanisms).
*   **Transmission:** Use HTTPS to encrypt data in transit. Never expose sensitive data in URLs.
*   **Email Verification Tokens:** Ensure tokens are single-use, have a reasonable expiry time, and are securely generated.
*   **Password Reset Tokens:** Ensure tokens are single-use, have a short expiry time (e.g., 15-60 minutes), and are securely generated. Log password reset attempts.
*   **Rate Limiting:** Implement rate limiting on authentication endpoints to mitigate brute-force attacks.
*   **Monitoring and Logging:** Monitor authentication attempts and log relevant events for auditing and anomaly detection.
