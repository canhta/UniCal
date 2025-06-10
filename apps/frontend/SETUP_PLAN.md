# Frontend Setup Plan

This document outlines the initial setup steps for the UniCal frontend application.

## Core Technologies & Libraries

*   **Framework:** Next.js 15 (App Router)
*   **Styling:** Tailwind CSS
*   **UI Components:** @headlessui/react
*   **Calendar:** @event-calendar/core (includes interaction features like drag/drop, resize)
*   **Authentication:** @auth0/nextjs-auth0
*   **Data Fetching & Server State Management:** TanStack Query (React Query)
*   **Client-Side Global State (Optional, if needed beyond React Query):** Zustand
*   **Language:** TypeScript
*   **Package Manager:** npm (as per existing `package.json`)

## Phase 1: Project Initialization & Next.js 15 Setup

*   [x] **Next.js Project Structure:** (Already initialized with App Router)
    *   Confirm standard Next.js App Router project structure (`app`, `public`, `next.config.ts`, etc.).
*   [ ] **Environment Variables:**
    *   Create `.env.local` for local development environment variables.
    *   Define initial variables:
        *   `NEXT_PUBLIC_API_BASE_URL` (for backend API)
        *   Auth0 related variables (e.g., `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` - to be added in Phase 3).
*   [ ] **Next.js Configuration (`next.config.ts`):**
    *   Review and update `next.config.ts` as needed (e.g., for image optimization domains, experimental features if any).
    *   Ensure it's configured for Next.js 15 features.
*   [ ] **TypeScript Configuration (`tsconfig.json`):**
    *   Verify path aliases (e.g., `@/*`) are correctly set up for cleaner imports.
    *   Ensure strict type checking is enabled.

## Phase 2: UI Framework & Styling

*   [~] **Tailwind CSS Setup:** (Partially exists via `postcss.config.mjs` and `globals.css`)
    *   Verify Tailwind CSS installation: `npm ls tailwindcss postcss autoprefixer`
    *   Ensure `tailwind.config.ts` (or `.js`) is present and configured. If not: `npx tailwindcss init -p`
    *   Configure `tailwind.config.ts` (or create if missing):
        *   Set up `content` paths to include all relevant files (`./app/**/*.{js,ts,jsx,tsx,mdx}`, `./components/**/*.{js,ts,jsx,tsx,mdx}`).
        *   Define custom theme (colors, fonts, spacing) as per design requirements.
    *   Import Tailwind directives in `app/globals.css`:
        ```css
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        ```
*   [ ] **@headlessui/react Setup:**
    *   Install: `npm install @headlessui/react`
    *   Plan for usage in creating accessible UI components (Modals, Dropdowns, Toggles, etc.).
*   [ ] **Global Styles & Layout:**
    *   Define base styles in `app/globals.css`.
    *   Structure the main layout in `app/layout.tsx` using Tailwind CSS and potentially Headless UI components for structure.
    *   Consider creating a `components/ui` directory for common UI elements.
*   [ ] **Font Setup:**
    *   Integrate custom fonts using Next.js font optimization (`next/font`).

## Phase 3: Authentication (@auth0/nextjs-auth0)

*   [ ] **Install Auth0 SDK:**
    *   `npm install @auth0/nextjs-auth0`
*   [ ] **Configure Auth0 Application:**
    *   Set up a new "Regular Web Application" in the Auth0 dashboard.
    *   Note down Domain, Client ID, and Client Secret.
    *   Configure Allowed Callback URLs (e.g., `http://localhost:3000/api/auth/callback`).
    *   Configure Allowed Logout URLs (e.g., `http://localhost:3000`).
*   [ ] **Set Environment Variables for Auth0:**
    *   Add to `.env.local`:
        *   `AUTH0_SECRET`: A long, random string for session encryption. Generate one using `openssl rand -hex 32`.
        *   `AUTH0_BASE_URL`: `http://localhost:3000` (for local development).
        *   `AUTH0_ISSUER_BASE_URL`: Your Auth0 domain (e.g., `https://your-tenant.auth0.com`).
        *   `AUTH0_CLIENT_ID`: Your Auth0 application's Client ID.
        *   `AUTH0_CLIENT_SECRET`: Your Auth0 application's Client Secret.
*   [ ] **Create Dynamic API Route for Auth0:**
    *   Create `app/api/auth/[auth0]/route.ts`:
        ```typescript
        // app/api/auth/[auth0]/route.ts
        import { handleAuth } from '@auth0/nextjs-auth0';
        export const GET = handleAuth();
        ```
    *   This handles login, logout, callback, and user profile.
*   [ ] **Wrap Root Layout with `UserProvider`:**
    *   Modify `app/layout.tsx`:
        ```tsx
        // app/layout.tsx
        import { UserProvider } from '@auth0/nextjs-auth0/client';
        // ... other imports
        export default function RootLayout({ children }: { children: React.ReactNode }) {
          return (
            <html lang="en">
              <body>
                <UserProvider>
                  {children}
                </UserProvider>
              </body>
            </html>
          );
        }
        ```
*   [ ] **Implement Login/Logout UI:**
    *   Create components or links for login (`/api/auth/login`) and logout (`/api/auth/logout`).
*   [ ] **Access User Information:**
    *   Client-side: Use the `useUser` hook from `@auth0/nextjs-auth0/client`.
    *   Server-side (Server Components, Route Handlers, `getServerSideProps` if using Pages Router for specific cases): Use `getSession` from `@auth0/nextjs-auth0`.
*   [ ] **Protecting Routes:**
    *   Server Components: Check session using `getSession` and redirect or show alternative UI.
    *   Client Components: Use `useUser` and handle loading/unauthenticated states.
    *   Middleware: Use `withMiddlewareAuthRequired` from `@auth0/nextjs-auth0/edge` for protecting routes via middleware (optional, consider trade-offs).

## Phase 4: Calendar Integration (@event-calendar/core)

*   [ ] **Install @event-calendar/core:**
    *   `npm install @event-calendar/core` (This includes interaction plugins).
*   [ ] **Peer Dependencies:**
    *   Check for and install any peer dependencies (e.g., a date library if not using native Date objects extensively).
*   [ ] **Basic Calendar Component:**
    *   Create a wrapper component (e.g., `components/calendar/UniCalendar.tsx`).
    *   Initialize `@event-calendar/core` with basic configuration and a view (e.g., DayGridMonth).
    *   Style the calendar using Tailwind CSS or custom CSS. The library is designed to be themeable.
*   [ ] **Data Fetching for Events:**
    *   Plan how events will be fetched from the backend API.
    *   Implement functions to fetch events based on the current view/date range using TanStack Query (React Query) for robust client-side fetching, caching, and background updates, especially for dynamic interactions (changing dates, views).
    *   React Server Components can be used for the initial data load of the page structure surrounding the calendar.
*   [ ] **Event Handling:**
    *   Implement handlers for event clicks, date clicks, event drops/resizes (functionality provided by `@event-calendar/core`).
*   [ ] **State Management for Calendar:**
    *   Manage calendar view state (current date, view type).
    *   Manage event data state.

## Phase 5: State Management

*   [ ] **Evaluate Need for Additional Global Client State Manager:**
    *   TanStack Query (React Query) will handle server state (API data, caching, mutations).
    *   For purely client-side global state (e.g., UI preferences, notifications not tied to server data, theme settings), evaluate if React Context with `useState`/`useReducer` is sufficient.
*   [ ] **If Complex Client State Needed, Setup Zustand:**
    *   Install and configure Zustand: `npm install zustand`.
    *   Define stores for specific global client-side application state.

## Phase 6: API Communication with Backend

*   [ ] **API Client/Service:**
    *   Create a dedicated service or set of utility functions for making API calls to the backend.
    *   Use `fetch` API, potentially wrapped for convenience (e.g., adding headers, error handling).
    *   Ensure `NEXT_PUBLIC_API_BASE_URL` is used.
*   [ ] **Data Fetching Strategies (App Router):**
    *   **Server Components:** Fetch data directly in Server Components for SSR by default. This is the preferred method for initial page loads.
    *   **Client Components:** Use `useEffect` with `fetch`, or libraries like SWR/TanStack Query (React Query) for client-side data fetching, caching, and mutations.
    *   **Route Handlers:** Create API routes within Next.js (`app/api/...`) to proxy requests to the backend or handle specific frontend-backend interactions if needed.
*   [ ] **Authenticated API Requests:**
    *   When making requests to protected backend endpoints, include the Auth0 access token in the `Authorization` header (e.g., `Authorization: Bearer <token>`).
    *   The `@auth0/nextjs-auth0` SDK will provide mechanisms to obtain this access token (e.g., via `getAccessToken` on the server-side or a hook/context value on the client-side).
    *   The API client/service should be configured to retrieve and attach this token to relevant requests.

## Phase 7: Core Components & Pages

*   [ ] **Reusable UI Components (`components/ui`):**
    *   Buttons, Inputs, Modals, Dropdowns, Cards, etc., using Tailwind CSS and Headless UI.
*   [ ] **Layout Components (`components/layout`):**
    *   Navbar, Sidebar, Footer.
    *   Integrate authentication status (show user profile, login/logout buttons).
*   [ ] **Initial Page Structure (`app` directory):**
    *   `(app)/page.tsx`: Landing page or main dashboard.
    *   `(app)/(protected)/dashboard/page.tsx`: Example of a protected route group.
    *   `(app)/(protected)/calendar/page.tsx`: Main calendar view.
    *   `(app)/(protected)/settings/page.tsx`: User settings page.
    *   Use route groups `(folderName)` for organizing sections of the app without affecting URL paths.
    *   Use `loading.tsx` and `error.tsx` conventions for better UX.

## Phase 8: Linting & Formatting

*   [~] **ESLint & Prettier Setup:** (Partially exists via `eslint.config.mjs`)
    *   Ensure ESLint rules are configured for Next.js, React, and TypeScript best practices (`eslint-config-next`). Verify/install `eslint-config-prettier` to prevent conflicts.
    *   Integrate Prettier for consistent code formatting.
    *   Add/verify npm scripts in `package.json` for linting and formatting (e.g., `lint`, `format`).
*   [ ] **Husky & lint-staged (Recommended):**
    *   Set up pre-commit hooks to automatically lint and format staged files.
      *   `npm install -D husky lint-staged`
      *   Configure husky and lint-staged in `package.json` or dedicated config files.

## Phase 9: Testing Setup

*   [ ] **Install Testing Libraries:**
    *   `npm install -D jest @types/jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`
*   [ ] **Jest Configuration:**
    *   Create `jest.config.js` and `jest.setup.js`.
    *   Configure Jest to work with Next.js (SWC), TypeScript, and CSS Modules/Tailwind if needed.
    *   Set up `testEnvironment: 'jsdom'`.
*   [ ] **Write Initial Tests:**
    *   Unit tests for utility functions and simple components.
    *   Integration tests for components interacting with each other or with context/state.
    *   Mock API calls and Auth0 services where necessary.
*   [ ] **E2E Testing (Optional - Consider Later):**
    *   Evaluate tools like Playwright or Cypress for end-to-end testing.

## Phase 10: Server-Side Rendering (SSR) & Optimization

*   [ ] **Leverage App Router for SSR/SSG:**
    *   By default, Server Components in the App Router are rendered on the server.
    *   Fetch data in Server Components to ensure content is present on initial load.
    *   Use Client Components (`'use client'`) only for interactive UI elements.
*   [ ] **Dynamic Rendering:**
    *   Understand how Next.js handles dynamic rendering and caching with Server Components.
*   [ ] **Performance Optimization:**
    *   **`next/image`:** Use for optimized image loading.
    *   **`next/font`:** Use for optimized font loading.
    *   **Code Splitting:** Automatic with the App Router.
    *   **Lazy Loading:** Use `next/dynamic` for client components or parts of the page that are not immediately visible.
    *   Analyze bundle sizes using `@next/bundle-analyzer`.

## Next Steps

Once this base setup is complete, proceed with implementing features as outlined in the application's functional requirements and design mockups. Focus on building out the core UI, integrating with the backend API, and refining the user experience.
