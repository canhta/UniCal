# Auth Module Plan

## 0. Overview & Clarifications
*   **UniCal User Identity & Session:**
    1.  Handles user registration and login (for CredentialsProvider in next-auth v5).
    2.  Issues and validates user credentials for next-auth integration.
    3.  Provides JWT token exchange for in-app authentication.
*   **Frontend Authentication:**
    *   Handled by [next-auth v5](https://authjs.dev/getting-started/installation) with username/password, Google, and Microsoft providers.
    *   Backend must provide endpoints for user registration, login, and session validation compatible with next-auth CredentialsProvider.
    *   Reference: [Google Provider](https://authjs.dev/getting-started/providers/google)

## Phase 1: Support Next-Auth Integration ✅
*Goal: Ensure backend exposes endpoints for next-auth CredentialsProvider and supports user management.*

*   [x] **User Registration Endpoint:**
    *   `POST /api/auth/register` for new users (email, password, name).
*   [x] **User Login Endpoint:**
    *   `POST /api/auth/login` for CredentialsProvider (email, password).
*   [x] **JWT Token Exchange:**
    *   `POST /auth/exchange-token` to exchange user info for UniCal JWT tokens.
*   [x] **Authentication Status:**
    *   `GET /auth/status` to check current user authentication status.
*   [x] **Token Refresh:**
    *   `POST /auth/refresh` for refreshing expired access tokens.
*   [x] **Password Management:**
    *   Endpoints for password reset (`POST /auth/forgot-password`, `POST /auth/reset-password`), change password (`PUT /user/me/password`).
*   [x] **User Model:**
    *   Ensure user model supports password (hashed), email, name, avatar, and provider info if needed.

## Phase 2: Security & Best Practices
*   [x] **Secure Password Storage:**
    *   Use bcrypt for password hashing.
*   [ ] **Rate Limiting & Brute Force Protection:**
    *   Implement rate limiting on auth endpoints.
*   [ ] **Testing:**
    *   Unit and integration tests for all auth endpoints.
*   [x] **Swagger Documentation:**
    *   Document all auth endpoints and DTOs.

## Phase 3: OAuth Calendar Integration (Moved to IntegrationsModule)
*Goal: OAuth handling for calendar providers is now handled by dedicated IntegrationsModule.*

*   **Note:** OAuth functionality has been moved to `IntegrationsModule` for better separation of concerns:
    *   User authentication (login/register) stays in AuthModule
    *   Calendar provider OAuth integration handled by IntegrationsModule
    *   This prevents confusion between user auth and calendar integration

## Implementation Notes
- Token exchange allows NextAuth sessions to obtain UniCal JWT tokens for API calls
- Status endpoint enables frontend to verify authentication state
- Tokens are stored in localStorage and automatically included in API requests
- Automatic token refresh is handled by the API client

## References
- [NextAuth.js Installation](https://authjs.dev/getting-started/installation)
- [Google Provider](https://authjs.dev/getting-started/providers/google)
- [Microsoft Provider](https://authjs.dev/getting-started/providers/microsoft)
