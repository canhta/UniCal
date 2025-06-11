# Layout Components Plan (Frontend)

**Overall Goal:** Develop core, responsive, and accessible layout components (Navbar, Footer, etc.) that provide a consistent user experience and reflect authentication state.

## 1. Core Principles & AI Agent Actionables

*   **[ ] Goal:** Ensure consistent look and feel across pages.
    *   **Action:** AI will develop `Navbar.tsx` and `Footer.tsx` with consistent styling (Tailwind CSS).
*   **[ ] Goal:** Implement responsive design for all layout components.
    *   **Action:** AI will ensure Navbar (with mobile hamburger menu) and Footer adapt to various screen sizes.
*   **[ ] Goal:** Prioritize accessibility.
    *   **Action:** AI will use semantic HTML, ARIA attributes, and ensure keyboard navigability for all layout elements. Headless UI will be used for interactive elements like dropdowns and mobile menus.
*   **[ ] Goal:** Make layout components auth-aware.
    *   **Action:** AI will use `useUser` from `@auth0/nextjs-auth0/client` in `Navbar.tsx` to display different links and user information based on authentication status.

## 2. Components

### A. Navbar (`apps/frontend/src/components/layout/Navbar.tsx`)

*   **[ ] Goal:** Implement Navbar with branding, navigation, and user profile section.
    *   **Action (Branding):** AI will display the UniCal logo/name, linking to `/`.
    *   **Action (Navigation Links - Auth-Dependent):**
        *   **Unauthenticated:** "Login" button (to `/api/auth/login`).
        *   **Authenticated:** "Dashboard" (`/dashboard`), "Calendar" (`/calendar`), "Integrations" (`/integrations`), "Settings" (`/settings`).
    *   **Action (User Profile - Authenticated):**
        *   AI will display user name/avatar (from `useUser`).
        *   AI will implement a dropdown menu (using `@headlessui/react` `Menu`) with "Account Settings" (`/settings/account`) and "Logout" (`/api/auth/logout`) links.
    *   **Action (Responsive Mobile Menu):**
        *   AI will implement a hamburger icon to toggle a mobile menu (using `@headlessui/react` `Transition` and potentially `Dialog` or `Popover` for the panel) containing navigation links and user actions.
    *   **Action (Styling & Accessibility):**
        *   AI will use Tailwind CSS for styling.
        *   AI will ensure all interactive elements are accessible (ARIA attributes, keyboard navigation, focus management).
        *   AI will use Next.js `<Link>` for client-side navigation.

### B. Footer (`apps/frontend/src/components/layout/Footer.tsx`)

*   **[ ] Goal:** Implement a simple and clean Footer.
    *   **Action:** AI will display copyright information (e.g., "© {new Date().getFullYear()} UniCal. All rights reserved.").
    *   **Action (Optional Links):** AI will include placeholder links for "Privacy Policy" (`/privacy-policy`) and "Terms of Service" (`/terms-of-service`).
    *   **Action (Styling & Responsiveness):** AI will use Tailwind CSS and ensure it adapts to screen sizes.

### C. Root Layout (`apps/frontend/src/app/layout.tsx`)

*   **[ ] Goal:** Integrate Navbar and Footer into the root application layout.
    *   **Action:** AI will ensure `UserProvider` (from `@auth0/nextjs-auth0/client`) and `ReactQueryProvider` (from `STATE_MANAGEMENT_PLAN.md`) wrap the main content.
    *   **Action:** AI will render `<Navbar />` before and `<Footer />` after the `{children}` within the `<body>`.
    *   **Action:** AI will wrap `{children}` in a `<main>` HTML element.
    *   **Action:** AI will confirm `globals.css` and `next/font` configurations are correctly applied.
    ```tsx
    // Example structure for apps/frontend/src/app/layout.tsx
    // ... other imports
    import { UserProvider } from '@auth0/nextjs-auth0/client';
    import ReactQueryProvider from '@/components/providers/ReactQueryProvider'; // Path based on actual location
    import Navbar from '@/components/layout/Navbar'; // Path based on actual location
    import Footer from '@/components/layout/Footer'; // Path based on actual location
    // import { Inter } from 'next/font/google'; // Example font
    // const inter = Inter({ subsets: ['latin'] });

    export default function RootLayout(
      { children }: { children: React.ReactNode }
    ) {
      return (
        <html lang="en" /* className={inter.className} */ >
          <body>
            <UserProvider>
              <ReactQueryProvider>
                <Navbar />
                <main className="flex-grow"> {/* Ensure main content can grow to push footer down */}
                  {children}
                </main>
                <Footer />
              </ReactQueryProvider>
            </UserProvider>
          </body>
        </html>
      );
    }
    ```

### D. Protected Route Layout (`apps/frontend/src/app/(protected)/layout.tsx`)

*   **[ ] Goal:** Create a layout for routes within the `(protected)` group, primarily for shared UI or structure.
    *   **Action:** AI will create `apps/frontend/src/app/(protected)/layout.tsx`.
    *   **Action:** This layout will, at a minimum, provide consistent padding/margin for the content area of protected pages.
    *   **Constraint:** Authentication enforcement is primarily handled by `middleware.ts` using `@auth0/nextjs-auth0/edge`'s `withMiddlewareAuthRequired`.
    ```tsx
    // Example: apps/frontend/src/app/(protected)/layout.tsx
    export default function ProtectedLayout({
      children,
    }: {
      children: React.ReactNode;
    }) {
      // Middleware should handle auth enforcement.
      // This layout can add shared UI for protected sections, e.g., a sub-sidebar or consistent padding.
      return (
        <div className="p-4 md:p-6 lg:p-8"> {/* Example padding for content area */}
          {children}
        </div>
      );
    }
    ```

## 3. Directory Structure

*   `apps/frontend/src/components/layout/Navbar.tsx`
*   `apps/frontend/src/components/layout/Footer.tsx`
*   `apps/frontend/src/app/layout.tsx` (Root)
*   `apps/frontend/src/app/(protected)/layout.tsx` (Protected section layout)

## Notes:
*   The `flex-grow` class on the `<main>` element in `RootLayout` is important if using a flexbox column layout for the body to ensure the footer stays at the bottom.
*   Mobile menu state can be managed using local React state (`useState`) within `Navbar.tsx` or, if complex interactions are needed across other components, potentially using the `uiStore` from `STATE_MANAGEMENT_PLAN.md`.
