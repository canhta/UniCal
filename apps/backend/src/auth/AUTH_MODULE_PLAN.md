<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/backend/src/auth/AUTH_MODULE_PLAN.md -->
# Auth Module Plan

This plan outlines the development tasks for the Auth module, responsible for user authentication, authorization, and session management. It will coordinate closely with the `UserModule` and `AccountsModule`.

## Phase 1: Initial Authentication via Primary Identity Provider (e.g., Auth0)

*This phase aligns with FRD 3.1.0, where a primary authentication provider like Auth0 handles the initial login experience, potentially federating to Google/Microsoft or offering its own email/password or passwordless options.*

*   [ ] **Module Setup (Foundation):**
    *   Ensure `AuthService` and `AuthController` are in place.
    *   Ensure `@nestjs/jwt` and `@nestjs/passport` are installed (for UniCal's own token management and general Passport integration).
*   [ ] **Configuration:**
    *   **UniCal JWT Configuration:** Define `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TOKEN_EXPIRATION`, `JWT_REFRESH_TOKEN_EXPIRATION` in `.env` for UniCal's internal tokens.
    *   **Primary Provider (Auth0) Configuration:** Add `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` (if backend confidential client), `AUTH0_AUDIENCE`, `AUTH0_CALLBACK_URL` to `.env` and load via `ConfigService`.
*   [ ] **Primary Provider (Auth0) Integration Logic:**
    *   Implement a Passport strategy for Auth0 (e.g., using `passport-auth0` or a generic `passport-jwt` strategy configured for Auth0's JWKS URI, issuer, and audience). This strategy will validate JWTs issued by Auth0.
    *   `AuthController` endpoint (e.g., `GET /auth/provider/callback`):
        *   This endpoint is the redirect target from Auth0 after successful user authentication there.
        *   It should be protected by the Auth0 Passport strategy.
        *   On successful validation of the Auth0 token/user:
            *   Extract user profile information from Auth0 (e.g., email, name, `email_verified`, provider-specific user ID).
            *   Call `UserService.findOrCreateUser({ email: auth0Profile.email, name: auth0Profile.name, avatarUrl: auth0Profile.picture, emailVerified: auth0Profile.email_verified, authProviderId: auth0Profile.sub })` to provision or link the UniCal user.
            *   Call `AuthService.generateTokens(uniCalUser)` to issue UniCal's internal JWT access and refresh tokens.
            *   Redirect the user to a frontend URL with UniCal tokens (e.g., `https://<frontend_url>/auth/callback?accessToken=...&refreshToken=...`) or set tokens in HttpOnly cookies.
    *   Frontend will initiate the login flow by redirecting the user to Auth0. The backend's role is primarily to handle the callback and issue its own session tokens.
*   [ ] **JWT Strategy & Guard (for UniCal's Internal Tokens):**
    *   Implement `JwtStrategy` to validate UniCal's own access tokens (issued after primary authentication).
    *   Implement `JwtAuthGuard` to protect UniCal API routes.
    *   Apply `JwtAuthGuard` to relevant UniCal API endpoints.
*   [ ] **DTOs:**
    *   `TokenResponseDto` (for UniCal's accessToken and refreshToken).

## Phase 2: Single Sign-On (SSO) Implementation (Aligns with Backend AGENT_PLAN Phase 2 - SSO)

*Prerequisites: `UserModule` can find/create users. `AccountsModule` is ready for OAuth token exchange and storage. `EncryptionService` is available.*

*   [X] **Configuration:**
    *   Add Google/Microsoft OAuth client IDs, secrets, and callback URLs to `.env` and `ConfigService`. **(These secrets should be managed by `ConfigService` and potentially encrypted if stored outside `.env` in a config file, though `.env` is typical for these).**
*   [X] **Google OAuth Strategy:**
    *   Implement `GoogleStrategy` (using `passport-google-oauth20`).
    *   `validate()` method:
        *   Receive Google profile (email, name, avatar).
        *   Call `UserService.findOrCreateUser({ email: profile.email, name: profile.displayName, avatarUrl: profile.photos[0].value, emailVerified: profile.emails[0].verified })` to provision/link user. Mark `emailVerified` based on provider data.
        *   Call `AccountsService.createOrUpdateAccount()` to store Google tokens (access_token, refresh_token from Google, encrypted using `EncryptionService`) and profile info (e.g., Google ID).
        *   Return UniCal user object.
*   [X] **Microsoft OAuth Strategy:**
    *   Implement `MicrosoftStrategy` (using a suitable Passport strategy e.g., `passport-microsoft`).
    *   `validate()` method: Similar to Google\'s, for Microsoft accounts. Ensure `emailVerified` is set based on provider data. **(Ensure `EncryptionService` is used for external tokens here too).**
*   [X] **Controller Endpoints for SSO:**
    *   `GET /auth/google/connect`: Redirect to Google for authentication. **(Responsibility: Initiates external OAuth flow).** Ensure `prompt: 'consent'` and `access_type: 'offline'` are used if refresh tokens are needed consistently.
    *   `GET /auth/google/callback`: Handles Google callback.
        *   Passport strategy (`GoogleStrategy`) will invoke its `validate()` method.
        *   Upon successful validation by the strategy, the user object is attached to `req.user`.
        *   Call `AuthService.generateTokens(req.user)` for the validated/provisioned user.
        *   Redirect user to frontend with tokens (e.g., `https://<frontend_url>/auth/callback?accessToken=...&refreshToken=...`) or set HttpOnly cookies.
    *   `GET /auth/microsoft/connect`: Redirect to Microsoft for authentication. **(Responsibility: Initiates external OAuth flow).** Ensure appropriate scopes for profile and offline_access.
    *   `GET /auth/microsoft/callback`: Handles Microsoft callback. Similar to Google\'s.
*   [X] **Refresh Token Logic (UniCal JWTs):**
    *   `AuthService.refreshToken(refreshToken)`: Validate UniCal refresh token, issue new access token. **(This refers to UniCal's own JWT refresh tokens).**
    *   `AuthController.refresh()`: (`POST /auth/refresh`) Endpoint for token refresh. Uses `JwtRefreshAuthGuard`.
    *   Implement `JwtRefreshStrategy`.
*   [X] **Logout Logic:**
    *   `AuthController.logout()`: (`POST /auth/logout`)
        *   Accepts refresh token in the request body.
        *   Invalidate the provided refresh token (e.g., by storing it in a denylist or database table like `RevokedRefreshTokens` until it expires).
        *   Client-side should discard tokens (access and refresh).
        *   Consider clearing HttpOnly cookies if used for tokens.
    *   **Note:** Access tokens are short-lived and stateless; direct invalidation is complex. Rely on expiry and refresh token invalidation.

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
    *   Short-lived token (e.g., 15 minutes - configurable via `JWT_ACCESS_TOKEN_EXPIRATION`).
    *   Contains `userId`, `email`, `role`. Issued at (`iat`) and expiration (`exp`) are standard JWT claims.
    *   Payload example: `{ "sub": "user-uuid-123", "email": "user@example.com", "role": "USER", "iat": 1678886400, "exp": 1678887300 }`
*   **Refresh Token:**
    *   Longer-lived token (e.g., 7 days - configurable via `JWT_REFRESH_TOKEN_EXPIRATION`).
    *   Contains `userId` and a unique token ID (`jti`) for potential revocation.
    *   Stored securely on the client (e.g., HttpOnly cookie with `Secure` and `SameSite=Strict` flags) and its hash or a reference can be stored in the database against the user for revocation.
    *   Payload example: `{ "sub": "user-uuid-123", "jti": "refresh-uuid-abc", "iat": 1678886400, "exp": 1679491200 }`
*   **Token Blacklisting/Revocation:**
    *   For refresh tokens: On logout or password change, the `jti` of the refresh token (or the token itself if not hashed in DB) is added to a denylist (e.g., Redis set with expiry matching token's remaining validity, or a `RevokedRefreshTokens` table).
    *   The `JwtRefreshStrategy` must check this denylist before issuing new tokens.
    *   Access tokens are generally not revoked server-side due to their stateless nature; rely on short expiry.

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

*   **Token Security:** Access and refresh tokens should be securely generated using strong secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`).
*   **Storage (Client-Side):**
    *   **Refresh Tokens:** Store in HttpOnly, Secure, SameSite=Strict cookies to prevent XSS access.
    *   **Access Tokens:** Can be stored in JavaScript memory. If localStorage/sessionStorage is used, be aware of XSS risks. HttpOnly cookies are not suitable for access tokens if they need to be read by JavaScript for API calls (unless using a backend-for-frontend pattern).
*   **Transmission:** Always use HTTPS.
*   **Email Verification Tokens & Password Reset Tokens:** Single-use, short-lived, securely generated (e.g., `crypto.randomBytes().toString('hex')`), and not guessable. Store a hash of the token in the database if it's long-lived before verification.
*   **Rate Limiting:** Apply to `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/refresh`, `/auth/resend-verification-email`.
*   **Monitoring and Logging:** Log all auth events (login success/failure, registration, password reset requests, token refresh, logout).
*   **CSRF Protection:** If using cookies for session management or refresh tokens, implement CSRF protection (e.g., `csurf` package in Express/NestJS, or double-submit cookie pattern).
*   **Input Validation:** Rigorously validate all input DTOs.
*   **Password Hashing:** Use a strong, adaptive hashing algorithm like Argon2 (preferred) or bcrypt with a sufficient work factor.
*   **OAuth Security:**
    *   Use the `state` parameter in OAuth flows to prevent CSRF.
    *   Validate the `iss` (issuer) and `aud` (audience) claims in tokens received from OAuth providers if applicable (though Passport strategies often handle this).
    *   Store external provider tokens (access_token, refresh_token) securely (encrypted at rest).
