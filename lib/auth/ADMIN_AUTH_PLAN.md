# Admin Auth Plan (Frontend - MVP)

This plan outlines tasks for implementing authentication for the Admin Panel MVP, integrating with Auth0.

## Admin Login Page (`/app/admin/login/page.tsx`)
- **FR-GEN-001-MVP: Admin Login**
    - [ ] Create the login page UI for the Admin Panel at `/admin/login`.
        - [ ] Form with Email and Password fields (though Auth0 might handle this via its Universal Login).
        - [ ] "Login" button.
    - [ ] Integrate with Auth0 for authentication.
        - [ ] Use `next-auth` or a direct Auth0 SDK configured for the Admin Panel's Auth0 application.
        - [ ] Redirect to Auth0 Universal Login page or handle credentials submission if using a custom form with Auth0.
    - [ ] On successful authentication:
        - [ ] Store session/token securely (handled by `next-auth` or SDK).
        - [ ] Redirect user to the Admin Dashboard (`/admin/dashboard`).
    - [ ] Handle authentication failures:
        - [ ] Display appropriate error messages from Auth0 or the backend.

## Session Management for Admin Users
- [ ] Configure `next-auth` (if used) or manage sessions to be specific to admin users.
    - [ ] Ensure admin sessions do not conflict with client application user sessions if they share the same domain.
    - [ ] Use appropriate session cookies/storage for admin context.
- [ ] Implement logout functionality for admin users.
    - [ ] Clear admin session/token.
    - [ ] Redirect to admin login page.
    - [ ] Call Auth0 logout endpoint if necessary to terminate Auth0 session.

## Route Protection
- [ ] Ensure all pages under `/app/admin/` (except the login page itself) are protected.
- [ ] If using `next-auth`, leverage its middleware or session checks in `getServerSideProps` / React Server Components / Client Components.
- [ ] Unauthenticated users attempting to access protected admin pages should be redirected to `/admin/login`.

## Auth0 Configuration
- [ ] Ensure a separate Auth0 Application is configured for the Admin Panel with its own Client ID, Client Secret, and callback URLs (e.g., `/api/auth/callback/auth0-admin`).
- [ ] Configure allowed logout URLs in Auth0.
- [ ] Set up any specific Auth0 rules or hooks needed for admin authentication (e.g., role assignment based on email domain if applicable, MFA enforcement).

## Non-Functional Requirements
- **FR-AUSER-005-MVP: Strong Authentication & MFA (via Auth0)**
    - [ ] Rely on Auth0's configuration for password policies and MFA enforcement. The frontend integration should seamlessly support these Auth0 features.

## Dependencies
- [ ] Backend API endpoints for admin authentication (if any beyond Auth0 interaction).
- [ ] Auth0 Admin Panel application credentials and configuration details.
