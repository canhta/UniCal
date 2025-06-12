# Auth Module Plan

## 0. Overview & Clarifications
*   **UniCal User Identity & Session:**
    1.  Handles user registration and login (for CredentialsProvider in next-auth v5).
    2.  Issues and validates user credentials for next-auth integration.
*   **Frontend Authentication:**
    *   Handled by [next-auth v5](https://authjs.dev/getting-started/installation) with username/password, Google, and Microsoft providers.
    *   Backend must provide endpoints for user registration, login, and session validation compatible with next-auth CredentialsProvider.
    *   Reference: [Google Provider](https://authjs.dev/getting-started/providers/google)

## Phase 1: Support Next-Auth Integration
*Goal: Ensure backend exposes endpoints for next-auth CredentialsProvider and supports user management.*

*   [ ] **User Registration Endpoint:**
    *   `POST /api/auth/register` for new users (email, password, name).
*   [ ] **User Login Endpoint:**
    *   `POST /api/auth/login` for CredentialsProvider (email, password).
*   [ ] **Session Validation Endpoint:**
    *   (Optional) Endpoint to validate user session/token if needed by next-auth.
*   [ ] **Password Management:**
    *   Endpoints for password reset (`POST /auth/forgot-password`, `POST /auth/reset-password`), change password (`PUT /user/me/password`).
*   [ ] **User Model:**
    *   Ensure user model supports password (hashed), email, name, avatar, and provider info if needed.

## Phase 2: Security & Best Practices
*   [ ] **Secure Password Storage:**
    *   Use bcrypt or argon2 for password hashing.
*   [ ] **Rate Limiting & Brute Force Protection:**
    *   Implement rate limiting on auth endpoints.
*   [ ] **Testing:**
    *   Unit and integration tests for all auth endpoints.
*   [ ] **Swagger Documentation:**
    *   Document all auth endpoints and DTOs.

## References
- [NextAuth.js Installation](https://authjs.dev/getting-started/installation)
- [Google Provider](https://authjs.dev/getting-started/providers/google)
- [Microsoft Provider](https://authjs.dev/getting-started/providers/microsoft)
