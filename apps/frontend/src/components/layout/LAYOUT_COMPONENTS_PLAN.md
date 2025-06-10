# Layout Components Plan

This plan outlines the development of core layout components for the UniCal frontend, such as Navbar and Footer.

## Core Principles
*   **Consistency:** Provide a consistent look and feel across all pages.
*   **Responsiveness:** Ensure components adapt to different screen sizes.
*   **Accessibility:** Navigation elements should be accessible.
*   **Auth-Aware:** Components should reflect the user's authentication state (e.g., show login/logout buttons, user profile).
*   **Clarity:** Navigation and layout should be intuitive.

## Components

### 1. Navbar (`apps/frontend/src/components/layout/Navbar.tsx`)

*   **FRD Ref:** Implicitly required for navigation and accessing features.
*   **Requirements:**
    *   **[ ] Branding/Logo:** Display UniCal logo/name, links to homepage (`/`).
    *   **[ ] Navigation Links (Auth-Dependent):**
        *   **Unauthenticated Users:**
            *   "Login" button/link (to `/api/auth/login`).
            *   (Optional) "Features", "Pricing" (if applicable later, can be static links).
        *   **Authenticated Users:**
            *   "Dashboard" link (to `/dashboard` or `/`).
            *   "Calendar" link (to `/calendar`).
            *   "Integrations" link (to `/integrations`).
            *   "Settings" link (to `/settings`).
    *   **[ ] User Profile / Logout (Authenticated Users):**
        *   Display user's name/avatar (using `useUser` from `@auth0/nextjs-auth0/client`).
        *   Dropdown menu using Headless UI for accessibility:
            *   "Account Settings" link (to `/settings/account` or similar).
            *   "Logout" button/link (to `/api/auth/logout`).
    *   **[ ] Responsive Design:**
        *   Desktop: Horizontal layout.
        *   Mobile: Hamburger menu icon that toggles a slide-out or dropdown menu for navigation links and user actions. Use Headless UI for transitions and accessibility.
    *   **[ ] Styling:** Use Tailwind CSS for a modern and clean look.
    *   **[ ] Accessibility:**
        *   Ensure proper ARIA attributes for navigation (`<nav>`, `aria-label`), links (`aria-current` for active link), buttons, and the mobile menu (e.g., `aria-expanded`, `aria-controls`).
        *   Keyboard navigation must be supported.
*   **Implementation Details:**
    *   Use `useUser` hook from `@auth0/nextjs-auth0/client` to get authentication state and user information.
    *   Use Next.js `<Link>` component for internal navigation.
    *   Leverage `@headlessui/react` (e.g., `Menu` for dropdown, `Transition` for mobile menu).

### 2. Footer (`apps/frontend/src/components/layout/Footer.tsx`)

*   **FRD Ref:** Standard website component.
*   **Requirements:**
    *   **[ ] Copyright Information:** "© {new Date().getFullYear()} UniCal. All rights reserved."
    *   **[ ] Optional Links (placeholders initially):**
        *   "Privacy Policy" (link to `/privacy-policy`).
        *   "Terms of Service" (link to `/terms-of-service`).
    *   **[ ] Styling:** Simple, clean design using Tailwind CSS, unobtrusive.
    *   **[ ] Responsiveness:** Adapt to different screen sizes, content should remain legible.

*   **Implementation Details:**
    *   Can be a simple stateless functional component.
    *   Use Next.js `<Link>` for internal links if they become actual pages.

### 3. Main Application Layout (`apps/frontend/app/layout.tsx`)

*   **This file already exists and is foundational.**
*   **Tasks:**
    *   **[x] UserProvider:** Confirm `@auth0/nextjs-auth0/client`'s `UserProvider` wraps the main content area. (Already planned in SETUP_PLAN)
    *   **[ ] Integrate Navbar:** Render `<Navbar />` component within the `<body>` before the main content.
    *   **[ ] Page Content Area:** Ensure `{children}` is wrapped in a `<main>` HTML element for semantic structure.
    *   **[ ] Integrate Footer:** Render `<Footer />` component within the `<body>` after the main content.
    *   **[x] Global Styles:** `globals.css` is imported here. (Standard Next.js setup)
    *   **[x] Font Setup:** Next.js font optimization (`next/font`) should be configured here. (As per SETUP_PLAN)
    *   **[ ] Theme Provider (Optional):** If a theming solution (e.g., for dark mode, or if Tailwind's theme capabilities are extended via context) is planned, it would be integrated here. For now, Tailwind's default theme and customization in `tailwind.config.ts` is primary.

### 4. Protected Route Layout (`apps/frontend/app/(protected)/layout.tsx`)

*   **Purpose:** To provide a consistent structure or behavior for all routes within the `(protected)` group.
*   **Requirements:**
    *   **[ ] Create File:** `apps/frontend/app/(protected)/layout.tsx`.
    *   **[ ] Authentication Check (Middleware Preferred):** While middleware (`middleware.ts` at the root of `app` or `src`) is the primary way to protect routes using `@auth0/nextjs-auth0/edge`'s `withMiddlewareAuthRequired`, this layout can serve as a secondary check or handle UI aspects for authenticated users.
        *   If middleware handles redirection, this layout component will only render if the user is authenticated.
    *   **[ ] Shared UI for Protected Sections (Optional):**
        *   If there's a need for a sub-navigation sidebar specific to authenticated sections (e.g., for settings sub-pages, user-specific dashboards), it could be placed here.
        *   Could define a common page title structure or breadcrumb area if consistent across all protected pages.
    *   **[ ] Structure:**
        ```tsx
        // Example: apps/frontend/app/(protected)/layout.tsx
        export default function ProtectedLayout({
          children,
        }: {
          children: React.ReactNode;
        }) {
          // Optional: Additional auth check or user data fetching if needed server-side for this layout
          // const session = await getSession();
          // if (!session?.user) { /* This case should ideally be handled by middleware */ }

          return (
            <>
              {/* Optional: Sidebar specific to protected routes */}
              {/* <ProtectedSidebar /> */}
              <div className="flex-grow p-4 md:p-6 lg:p-8"> {/* Example padding */}
                {children}
              </div>
            </>
          );
        }
        ```

*   **Implementation Notes:**
    *   The primary role of route group layouts is to share UI. Authentication enforcement is best handled by middleware.
    *   For now, this layout might just pass children through, or include minimal structural elements like padding for the content area of protected pages.

## Directory Structure
*   `apps/frontend/src/components/layout/Navbar.tsx`
*   `apps/frontend/src/components/layout/Footer.tsx`
*   `apps/frontend/app/layout.tsx` (Root layout)
*   `apps/frontend/app/(protected)/layout.tsx` (Layout for protected routes)

## Implementation Notes
*   Start with Navbar and Footer, integrating them into `app/layout.tsx`.
*   Ensure Navbar correctly reflects authentication state using `useUser`.
*   Test responsiveness of Navbar (especially mobile menu) and Footer thoroughly.
*   The `(protected)/layout.tsx` can be very simple initially, primarily serving to group routes.
