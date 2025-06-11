<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/frontend/lib/auth/AUTH_FEATURE_PLAN.md -->
# Auth Feature Plan (Frontend - Aligns with Frontend AGENT_PLAN Phase 2)

This plan details frontend authentication using `@auth0/nextjs-auth0` v4, aligning with `AGENT_PLAN.md` and backend capabilities.

> **Note:** This project uses Auth0 v4 directly - no migration from v3 needed.

## FRD Alignment
*   **FR3.1.3 Single Sign-On (SSO) - Google & Microsoft:** Core focus, using Auth0.
*   **FR3.1.0 Simplified Email-Only Login (UI Focus):** Leverages Auth0's capabilities (passwordless email or email/password if configured in Auth0, or users choosing Google/Microsoft).
*   **FR3.1.1, FR3.1.2, FR3.1.4, FR3.1.5 (User Registration, Email/Password Login, Password Management):** Primarily handled by Auth0's Universal Login Page (ULP) and management features. Frontend UI will direct to Auth0 for these unless a custom UniCal UI interacting with specific backend endpoints (for non-Auth0 managed flows) is explicitly required later.

## Core Tasks (Using @auth0/nextjs-auth0 v4)

1.  [x] **Environment Variables Setup (`.env.local`):**
    *   Set up with v4 format: `AUTH0_SECRET`, `APP_BASE_URL`, `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`.
2.  [x] **Auth0 Client Setup (`lib/auth0.ts`):**
    *   Created Auth0Client instance using `@auth0/nextjs-auth0/server` v4.
3.  [x] **Auth0 Middleware (`middleware.ts`):**
    *   Auto-mounted routes via `auth0.middleware()` - no manual API routes needed in v4.
    *   Added protected route logic for `/dashboard`, `/calendar`, `/integrations`, `/settings`.
4.  [x] **Login UI Implementation (v4 routes):**
    *   **SSO Buttons (FR3.1.3):**
        *   "Sign in with Google" button linking to `/auth/login?connection=google-oauth2`.
        *   "Sign in with Microsoft" button linking to `/auth/login?connection=windowslive`.
    *   **Email Login:** Button linking to `/auth/login` for Auth0 Universal Login Page.
5.  [x] **Logout UI Implementation (v4 routes):**
    *   "Logout" button/link to `/auth/logout`.
6.  [x] **Accessing User Information:**
    *   **Client Components:** Use `useUser()` hook from v4.
    *   **Server Components/Route Handlers:** Use `getSession()` via auth0 client v4.
7.  [x] **Protected Routes Implementation:**
    *   **Middleware:** Routes auto-protected via `auth0.middleware()` with custom logic for specific routes.
    *   **Component-level:** Use `useUser` hook for conditional rendering.
8.  [x] **v4 Implementation Complete:**
    *   Using auto-mounted routes via middleware (no manual API routes needed).
    *   All login/logout URLs use `/auth/*` format.
    *   No `<UserProvider />` wrapper required in v4.
    *   Fixed `asChild` prop handling in Button component.
9.  [x] **Error Handling:** Auth errors displayed via `useUser` hook error state.

## User Flows (Primarily via Auth0 ULP)

*   **Registration/Login:**
    *   User clicks "Login" or SSO buttons.
    *   Redirected to Auth0 Universal Login Page (ULP).
    *   User registers (if new) or logs in (email/password, social provider) on Auth0 ULP.
    *   Auth0 handles email verification, password reset initiation if user chooses these options on ULP.
    *   On successful Auth0 authentication, user is redirected back to `AUTH0_BASE_URL` (the frontend app).
    *   `handleCallback` (part of `handleAuth()`) exchanges code for tokens, creates session.
    *   Frontend makes a call to backend's `/auth/provider-login` (or similar) with the Auth0 access token to get UniCal session tokens.
*   **Password Reset (Initiated from UniCal UI - Optional, if not relying solely on Auth0 ULP prompts):
    *   If a user needs to reset password and isn't prompted by Auth0 ULP during a failed login: Provide a "Forgot Password?" link.
    *   This link should ideally redirect to Auth0's password reset flow or trigger it via Auth0 mechanisms if possible. If a custom flow is built interacting with a UniCal backend endpoint for this, that backend endpoint would then likely use Auth0 Management API to trigger password reset.

## Backend Interaction Points (Frontend Perspective)

*   **Primary:** After successful Auth0 login on frontend, call a backend endpoint (e.g., `POST /auth/provider-login`) with the Auth0 `accessToken`.
    *   **Request:** `{ "providerToken": "<Auth0 Access Token>" }`
    *   **Response (Success):** `{ "accessToken": "<UniCal Backend JWT>", "refreshToken": "<UniCal Backend Refresh JWT>" }` (or similar structure).
    *   These UniCal tokens are then stored securely (e.g., HttpOnly cookies set by backend, or carefully managed by frontend state/storage) and used for subsequent API calls to UniCal backend.
*   **Token Refresh (UniCal Tokens):** Implement logic to use UniCal `refreshToken` to get a new UniCal `accessToken` from backend's `/auth/refresh` endpoint when the current `accessToken` expires.

## Notes:
*   This plan prioritizes leveraging Auth0 for most auth UI and logic (registration, password complexity, email verification, MFA if configured in Auth0).
*   The key frontend responsibility is integrating the `@auth0/nextjs-auth0` SDK, initiating login flows to Auth0, handling the callback, and then exchanging the Auth0 token with the backend for a UniCal-specific session token.
*   Ensure connection names (`google-oauth2`, `windowslive`, etc.) in login links match Auth0 configuration.
