# Auth Feature Plan (Phase 2)

This plan details the implementation of authentication features for the UniCal frontend, aligning with `AGENT_PLAN.md` and `SETUP_PLAN.md`.

## FRD Alignment
*   **FR3.1.0 Simplified Email-Only Login (UI Focus):** Initial implementation will focus on UI elements. If the backend provides a truly simplified JWT mechanism (pre-Auth0), this plan will adapt. Otherwise, Auth0 will be used for the "simplified" flow by initially only presenting email-based SSO options or a direct email login if Auth0 is configured for it.
*   **FR3.1.3 Single Sign-On (SSO) - Google & Microsoft:** Core focus of this plan using Auth0.

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

## Future Considerations (Post-Initial Product / Phase 5 of AGENT_PLAN)
*   **FR3.1.1 User Registration (Full Email/Password):** If Auth0 Universal Login is not customized to handle this, or if a custom UI is needed.
*   **FR3.1.2 User Login (with Password):** Update login page for email/password fields.
*   **FR3.1.4 Password Reset:** UI for "Forgot Password" and password reset form.
*   **FR3.1.5 Profile Management (Password Change):** UI for changing password within account settings.

## Notes:
*   This plan assumes Auth0 is the primary authentication provider.
*   Connection names for Google (`google-oauth2`) and Microsoft (`windowslive`, `waad`, or custom OIDC) should be verified from the Auth0 dashboard settings.
*   The "Simplified Email-Only Login" will likely leverage Auth0's passwordless email connection or rely on users choosing Google/Microsoft (which are email-based) if a separate backend mechanism isn't implemented first.
