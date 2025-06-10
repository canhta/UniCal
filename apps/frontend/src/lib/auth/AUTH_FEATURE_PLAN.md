# Auth Feature Plan (Phase 2)

This plan details the implementation of authentication features for the UniCal frontend, aligning with `AGENT_PLAN.md` and `SETUP_PLAN.md`.

## FRD Alignment
*   **FR3.1.0 Simplified Email-Only Login (UI Focus):** Initial implementation will focus on UI elements. Auth0 will be used for the "simplified" flow by initially only presenting email-based SSO options or a direct email login if Auth0 is configured for it.
*   **FR3.1.3 Single Sign-On (SSO) - Google & Microsoft:** Core focus of this plan using Auth0.

## Clarifications on Account Linking
*   **Identity Linking (Auth0):** Linking different methods of signing into *UniCal* (e.g., allowing a user to sign in with their Google account and later with an email/password, and recognizing them as the same UniCal user) is a feature managed by Auth0 (identity federation/account linking within Auth0). The frontend will primarily direct users through Auth0 flows.
*   **External Service Connection (UniCal Settings/Integrations):** Connecting UniCal to *external services* like Google Calendar or Outlook Calendar to access data is handled separately, typically within the UniCal application's "Integrations" or "Settings" sections, and involves OAuth flows managed by the `AccountsModule` on the backend. This feature plan focuses on user authentication into UniCal.

## Core Tasks (Using @auth0/nextjs-auth0)

1.  **[ ] Environment Variables Setup (as per `SETUP_PLAN.md` Phase 3):**
    *   Ensure `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` are correctly set in `.env.local`.
2.  **[ ] Create Dynamic API Route for Auth0 (as per `SETUP_PLAN.md` Phase 3):**
    *   Implement `apps/frontend/app/api/auth/[auth0]/route.ts` with `handleAuth()`.
3.  **[ ] Wrap Root Layout with `UserProvider` (as per `SETUP_PLAN.md` Phase 3):**
    *   Modify `apps/frontend/app/layout.tsx` to include `<UserProvider>`.
4.  **[ ] Login UI Implementation (`apps/frontend/src/app/(auth)/login/page.tsx` or integrated into Navbar):**
    *   **Simplified Email-Only UI (FR3.1.0):**
        *   If backend supports a non-Auth0 simple email login: Create an email input field and a "Login" button. On submit, call the backend's simple login endpoint. Store the received JWT securely (e.g., in an HttpOnly cookie via a backend-for-frontend endpoint, or carefully in local storage if no other option - though less secure). Update auth state.
        *   If using Auth0 for simplified flow: This might mean initially only showing "Sign in with Google/Microsoft" if those are email-based, or configuring Auth0 to allow passwordless email login.
    *   **SSO Buttons (FR3.1.3):**
        *   Create "Sign in with Google" button linking to `/api/auth/login?connection=google-oauth2` (or appropriate connection name).
        *   Create "Sign in with Microsoft" button linking to `/api/auth/login?connection=windowslive` (or appropriate connection name).
        *   Style buttons appropriately.
5.  **[ ] Logout UI Implementation (e.g., in Navbar or User Profile Dropdown):**
    *   Create a "Logout" button/link pointing to `/api/auth/logout`.
6.  **[ ] Accessing User Information:**
    *   **Client Components:** Use `useUser` hook from `@auth0/nextjs-auth0/client` to get user profile, loading, and error states.
    *   **Server Components/Route Handlers:** Use `getSession` from `@auth0/nextjs-auth0` to get user session server-side.
7.  **[ ] Protected Routes Implementation:**
    *   **Using Middleware (Optional but Recommended for Edge Protection):**
        *   Create `middleware.ts` in the root of `apps/frontend/`.
        *   Use `withMiddlewareAuthRequired` from `@auth0/nextjs-auth0/edge` to protect specific routes or route groups (e.g., `/dashboard`, `/calendar`, `/integrations`).
        ```typescript
        // middleware.ts
        import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
        export default withMiddlewareAuthRequired();
        export const config = {
          matcher: ['/dashboard/:path*', '/calendar/:path*', '/integrations/:path*', '/settings/:path*'], // Add paths to protect
        };
        ```
    *   **Manual Check in Server Components (if not using middleware for all):**
        ```typescript
        // Example: app/(protected)/dashboard/page.tsx
        import { getSession } from '@auth0/nextjs-auth0';
        import { redirect } from 'next/navigation';
        export default async function DashboardPage() {
          const session = await getSession();
          if (!session?.user) {
            redirect('/api/auth/login'); // Or to a custom login page
          }
          // ... rest of the page
        }
        ```
    *   **Manual Check in Client Components (if not using middleware for all):**
        ```typescript
        // Example: some client component
        'use client';
        import { useUser } from '@auth0/nextjs-auth0/client';
        import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
        export default function MyProtectedClientComponent() {
          const { user, error, isLoading } = useUser();
          const router = useRouter();
          if (isLoading) return <p>Loading...</p>;
          if (error) return <p>{error.message}</p>;
          if (!user) {
            // Option 1: Redirect if appropriate for the component's context
            // router.push('/api/auth/login'); 
            // return null; 
            // Option 2: Show a message or different UI
            return <p>Please log in to view this content.</p>;
          }
          return <div>Welcome {user.name}!</div>;
        }
        ```
8.  **[ ] Auth State Management (if needed beyond `useUser`):**
    *   For more complex global auth state or derived state, integrate with the chosen global state manager (Zustand/Jotai - see `STATE_MANAGEMENT_PLAN.md`).
    *   The `UserProvider` and `useUser` hook handle most common cases.
9.  **[ ] Error Handling:**
    *   Display appropriate messages for login errors (e.g., if Auth0 returns an error on callback).
    *   The `useUser` hook provides an `error` object.

### 2. User Flows

*   **Registration Flow:**
    *   User navigates to the registration page.
    *   Fills in name, email, and password.
    *   Submits the form.
    *   Frontend calls `POST /auth/register`.
    *   **On success (e.g., 201 response or specific message indicating email sent):**
        *   **Display a message to the user instructing them to check their email to verify their account.**
        *   **Optionally, redirect to a "Check Your Email" page or a login page with a message.**
        *   **Do not automatically log the user in or provide auth tokens until email is verified (unless backend provides them post-verification).**
    *   On error (e.g., email already exists, validation error), display appropriate feedback.
*   **Email Verification Flow:**
    *   **User clicks the verification link in their email (e.g., `https://<frontend_url>/verify-email?token=<token>`).**
    *   **Frontend mounts a specific page/route for `/verify-email`.**
    *   **This page extracts the `token` from the URL query parameters.**
    *   **It calls the backend endpoint `GET /auth/verify-email?token=<token>`.**
    *   **On success:**
        *   **Display a "Email Verified Successfully" message.**
        *   **Redirect to the login page or, if the backend returns auth tokens, log the user in and redirect to the dashboard.**
    *   **On error (e.g., invalid/expired token):**
        *   **Display an appropriate error message (e.g., "Invalid or expired verification link.").**
        *   **Optionally, provide a button/link to request a new verification email (`POST /auth/resend-verification-email`).**
*   **Resend Verification Email Flow (Optional but Recommended):**
    *   **If a user tries to log in with an unverified email (backend might return a specific error code/message for this), or from a dedicated UI element:**
    *   **User clicks a "Resend Verification Email" button/link.**
    *   **Frontend calls `POST /auth/resend-verification-email` with the user's email.**
    *   **On success, display a message: "A new verification email has been sent."**
    *   **On error, display an appropriate message.**
*   **Login Flow:**
    *   User navigates to the login page.
    *   Enters email and password (or uses SSO).
    *   Submits the form.
    *   Frontend calls `POST /auth/login`.
    *   **On success:**
        *   Stores JWT and other user data (if any) in the client (e.g., cookies, local storage).
        *   Updates auth state.
        *   **If the email is not verified (backend indicates this), display a message: "Please verify your email before logging in." and optionally provide a way to resend the verification email.**
        *   Redirects to the intended page or dashboard.
    *   On error (e.g., invalid credentials, user not found), display appropriate feedback.

*   **Forgot Password Flow:**
    *   **User clicks "Forgot Password?" link (typically on the login page).**
    *   **User is navigated to a "Forgot Password" page.**
    *   **User enters their registered email address and submits.**
    *   **Frontend calls `POST /auth/forgot-password` with the email.**
    *   **On success (backend should always return a generic success message to prevent email enumeration):**
        *   **Display a message like: "If an account with that email exists, a password reset link has been sent."**
    *   **On error (e.g., client-side validation or network error), display appropriate feedback.**

*   **Reset Password Flow:**
    *   **User clicks the password reset link in their email (e.g., `https://<frontend_url>/reset-password?token=<token>`).**
    *   **Frontend mounts a specific page/route for `/reset-password`.**
    *   **The page extracts the `token` from the URL query parameters.**
    *   **(Optional but Recommended) Frontend first calls `GET /auth/verify-reset-token?token=<token>` to check if the token is valid before showing the password form.**
        *   **If token is invalid/expired, display an error message (e.g., "Invalid or expired password reset link. Please try again.") and guide the user back to the "Forgot Password" page.**
    *   **If token is valid (or if skipping the verify step), display a form asking for "New Password" and "Confirm New Password".**
    *   **User enters and confirms their new password, then submits.**
    *   **Frontend calls `POST /auth/reset-password` with `{ token, newPassword }`.**
    *   **On success:**
        *   **Display a "Password has been reset successfully" message.**
        *   **Redirect to the login page.**
    *   **On error (e.g., token became invalid, password policy not met), display appropriate feedback.**

### 4. API Interaction

*   `POST /auth/register`: To register a new user.
*   `POST /auth/login`: To log in the user.
*   `GET /auth/verify-email?token=<token>`: To verify the email using the token from the verification link.
*   `POST /auth/resend-verification-email`: (Optional) To request a new verification email.
*   `POST /auth/forgot-password`: To initiate the password reset process.
*   `GET /auth/verify-reset-token`: (Optional) To verify the validity of a password reset token.
*   `POST /auth/reset-password`: To submit the new password along with the reset token.

## Future Considerations (Post-Initial Product / Phase 5 of AGENT_PLAN)
*   **FR3.1.1 User Registration (Full Email/Password):** If Auth0 Universal Login is not customized to handle this, or if a custom UI is needed.
*   **FR3.1.2 User Login (with Password):** Update login page for email/password fields.
*   **FR3.1.4 Password Reset:** UI for "Forgot Password" and password reset form. **(This is now being addressed)**
*   **FR3.1.5 Profile Management (Password Change):** UI for changing password within account settings.

## Notes:
*   This plan assumes Auth0 is the primary authentication provider.
*   Connection names for Google (`google-oauth2`) and Microsoft (`windowslive`, `waad`, or custom OIDC) should be verified from the Auth0 dashboard settings.
*   The "Simplified Email-Only Login" will likely leverage Auth0's passwordless email connection or rely on users choosing Google/Microsoft (which are email-based) if a separate backend mechanism isn't implemented first.
