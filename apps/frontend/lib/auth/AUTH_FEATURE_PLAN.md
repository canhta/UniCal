<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/frontend/lib/auth/AUTH_FEATURE_PLAN.md -->
# Auth Feature Plan (Frontend - Aligns with Frontend AGENT_PLAN Phase 2)

This plan details frontend authentication using `@auth0/nextjs-auth0`, aligning with `AGENT_PLAN.md` and backend capabilities.

## FRD Alignment
*   **FR3.1.3 Single Sign-On (SSO) - Google & Microsoft:** Core focus, using Auth0.
*   **FR3.1.0 Simplified Email-Only Login (UI Focus):** Leverages Auth0's capabilities (passwordless email or email/password if configured in Auth0, or users choosing Google/Microsoft).
*   **FR3.1.1, FR3.1.2, FR3.1.4, FR3.1.5 (User Registration, Email/Password Login, Password Management):** Primarily handled by Auth0's Universal Login Page (ULP) and management features. Frontend UI will direct to Auth0 for these unless a custom UniCal UI interacting with specific backend endpoints (for non-Auth0 managed flows) is explicitly required later.

## Core Tasks (Using @auth0/nextjs-auth0)

1.  [ ] **Environment Variables Setup (`.env.local`):**
    *   Ensure `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` are set.
2.  [ ] **Dynamic API Route for Auth0 (`app/api/auth/[auth0]/route.ts`):**
    *   Implement with `handleAuth()` from `@auth0/nextjs-auth0`.
3.  [ ] **Wrap Root Layout with `UserProvider` (`app/layout.tsx`):**
    *   Include `<UserProvider>` from `@auth0/nextjs-auth0/client`.
4.  [ ] **Login UI Implementation (e.g., `app/(auth)/login/page.tsx` or Navbar):
    *   **SSO Buttons (FR3.1.3):**
        *   "Sign in with Google" button linking to `/api/auth/login?connection=google-oauth2` (verify connection name in Auth0).
        *   "Sign in with Microsoft" button linking to `/api/auth/login?connection=windowslive` (verify connection name in Auth0).
    *   **(Optional) Email Input for Auth0 Passwordless/Email-Password:** If Auth0 is configured for passwordless email or traditional email/password, provide an email input. The login button would call `/api/auth/login` (Auth0 SDK handles redirect to ULP where user enters email/password or gets magic link).
5.  [ ] **Logout UI Implementation (Navbar/Profile Dropdown):**
    *   "Logout" button/link to `/api/auth/logout`.
6.  [ ] **Accessing User Information:**
    *   **Client Components:** Use `useUser()` hook.
    *   **Server Components/Route Handlers:** Use `getSession()`.
7.  [ ] **Protected Routes Implementation:**
    *   **Middleware (`middleware.ts` in root `apps/frontend/`):** Use `withMiddlewareAuthRequired` for routes like `/dashboard`, `/calendar`, `/integrations`, `/settings`.
        ```typescript
        // middleware.ts
        import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
        export default withMiddlewareAuthRequired();
        export const config = {
          matcher: ['/dashboard/:path*', '/calendar/:path*', '/integrations/:path*', '/settings/:path*'],
        };
        ```
    *   **Fallback/Granular Check (Client/Server Components):** Use `useUser` or `getSession` with conditional rendering/redirect if not fully covered by middleware.
8.  [ ] **API Client Integration (`/lib/api/API_CLIENT_PLAN.md`):
    *   Ensure API client automatically attaches the Auth0 Access Token (obtained via `getAccessToken` from `@auth0/nextjs-auth0`) to requests to the UniCal backend.
    *   Backend expects this Auth0 token for its `/auth/provider-login` (or similar) endpoint to validate and issue UniCal's internal session tokens.
9.  [ ] **Error Handling:** Display messages for login errors (e.g., Auth0 callback errors, `useUser` error state).

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
