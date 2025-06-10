# Layout Components Plan (Phase 2)

This plan outlines the development of core layout components for the UniCal frontend, such as Navbar and Footer.

## Core Principles
*   **Consistency:** Provide a consistent look and feel across all pages.
*   **Responsiveness:** Ensure components adapt to different screen sizes.
*   **Accessibility:** Navigation elements should be accessible.
*   **Auth-Aware:** Components should reflect the user's authentication state (e.g., show login/logout buttons, user profile).

## Components

### 1. Navbar (`apps/frontend/src/components/layout/Navbar.tsx`)

*   **FRD Ref:** Implicitly required for navigation and accessing features.
*   **Requirements:**
    *   **[ ] Branding/Logo:** Display UniCal logo/name, links to homepage (`/`).
    *   **[ ] Navigation Links (Auth-Dependent):**
        *   **Unauthenticated Users:**
            *   "Login" button/link (to `/api/auth/login` or custom login page).
            *   (Optional) "Features", "Pricing" (if applicable later).
        *   **Authenticated Users:**
            *   "Dashboard" link (to `/dashboard`).
            *   "Calendar" link (to `/calendar`).
            *   "Integrations" link (to `/integrations`).
            *   (Optional) "Settings" link (to `/settings`).
    *   **[ ] User Profile / Logout (Authenticated Users):**
        *   Display user's name/avatar (using `useUser` from `@auth0/nextjs-auth0/client`).
        *   Dropdown menu with:
            *   "Account Settings" link (placeholder for now, links to `/settings` or `/account`).
            *   "Logout" button/link (to `/api/auth/logout`).
    *   **[ ] Responsive Design:**
        *   Desktop: Horizontal layout.
        *   Mobile: Hamburger menu for navigation links and user actions.
    *   **[ ] Styling:** Use Tailwind CSS.
    *   **[ ] Accessibility:** Ensure proper ARIA attributes for navigation and interactive elements.

*   **Implementation Details:**
    *   Use `useUser` hook to get authentication state and user information.
    *   Use Next.js `<Link>` component for internal navigation.
    *   Leverage Headless UI for accessible dropdowns and mobile menu transitions if needed.

### 2. Footer (`apps/frontend/src/components/layout/Footer.tsx`)

*   **FRD Ref:** Standard website component.
*   **Requirements:**
    *   **[ ] Copyright Information:** "© [Current Year] UniCal. All rights reserved."
    *   **[ ] Optional Links:**
        *   "Privacy Policy" (placeholder link).
        *   "Terms of Service" (placeholder link).
        *   Social media icons (optional, for later).
    *   **[ ] Styling:** Simple, clean design using Tailwind CSS.
    *   **[ ] Responsiveness:** Adapt to different screen sizes.

*   **Implementation Details:**
    *   Can be a simple stateless component.

### 3. Main Application Layout (`apps/frontend/app/layout.tsx`)

*   **This file already exists and is foundational.**
*   **Tasks:**
    *   **[ ] Integrate Navbar:** Ensure Navbar is rendered within the `RootLayout`.
    *   **[ ] Integrate Footer:** Ensure Footer is rendered within the `RootLayout`.
    *   **[ ] UserProvider:** Confirm `@auth0/nextjs-auth0/client`'s `UserProvider` wraps the main content area to provide auth context.
    *   **[ ] Page Content Area:** Define a `main` HTML element where page-specific content will be rendered (`{children}`).
    *   **[ ] Global Styles:** `globals.css` is imported here.
    *   **[ ] Font Setup:** Next.js font optimization (`next/font`) should be configured here.

### 4. Protected Route Layout (Conceptual - using Next.js Route Groups)

*   **No specific component, but a structural convention.**
*   **Example:** `apps/frontend/app/(protected)/layout.tsx`
*   **Requirements:**
    *   **[ ] Apply to a group of routes:** This layout would wrap all routes within the `(protected)` group.
    *   **[ ] Authentication Check (Optional - can also be done via Middleware or page-level checks):**
        *   Could perform an auth check here using `getSession` if it's a Server Component layout, and redirect if unauthenticated. However, middleware is often preferred for protecting entire route segments.
    *   **[ ] Shared UI for Protected Sections:**
        *   Could include a sidebar navigation specific to authenticated user sections, if design requires.
        *   Could set a common page structure (e.g., page titles, breadcrumbs container).

*   **Implementation Details:**
    *   If a distinct visual layout is needed for all authenticated sections (beyond just the Navbar), this route group layout can be implemented.
    *   For now, the main `app/layout.tsx` with an auth-aware Navbar might be sufficient.

## Directory Structure
*   `apps/frontend/src/components/layout/Navbar.tsx`
*   `apps/frontend/src/components/layout/Footer.tsx`
*   (Main layout is `apps/frontend/app/layout.tsx`)

## Implementation Notes
*   Start with Navbar and Footer as they are crucial for basic site structure and navigation.
*   Focus on making the Navbar auth-aware early on.
*   Ensure responsiveness is tested during development.
