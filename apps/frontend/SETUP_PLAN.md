# Frontend Setup Plan

This document outlines the initial steps for the UniCal frontend application.

## Core Technologies & Libraries

*   **Framework:** Next.js 15 (App Router)
*   **Styling:** Tailwind CSS
*   **UI Components:** @headlessui/react
*   **Calendar:** @event-calendar/core
*   **Data Fetching & Server State Management:** TanStack Query (React Query)
*   **Language:** TypeScript
*   **Package Manager:** npm

## Phase 1: Project Initialization & Next.js 15 Setup

*   [ ] **Next.js Project Structure:**
    *   Verify standard Next.js App Router project structure (`app`, `public`, `next.config.ts`, etc.).
*   [ ] **Environment Variables:**
    *   Create `.env.local` for local development.
    *   Define initial variables: `NEXT_PUBLIC_API_BASE_URL`.
*   [ ] **Next.js Configuration (`next.config.ts`):**
    *   Review and update as needed (e.g., image optimization domains).
*   [ ] **TypeScript Configuration (`tsconfig.json`):**
    *   Verify path aliases (e.g., `@/*`) and strict type checking.

## Phase 2: UI Framework & Styling

*   [ ] **Tailwind CSS Setup:**
    *   Verify installation: `npm ls tailwindcss postcss autoprefixer`.
    *   Ensure `tailwind.config.ts` is present and configured with `content` paths and custom theme.
    *   Import Tailwind directives in `app/globals.css`.
*   [ ] **@headlessui/react Setup:**
    *   Install: `npm install @headlessui/react`.
*   [ ] **Global Styles & Layout:**
    *   Define base styles in `app/globals.css`.
    *   Structure main layout in `app/layout.tsx` using Tailwind CSS.
    *   Create `components/ui` for common UI elements.
*   [ ] **Font Setup:**
    *   Integrate custom fonts using `next/font`.

## Phase 3: Authentication

*   [ ] **Install next-auth v5:**
    *   `npm install next-auth@beta`
*   [ ] **Configure Providers:**
    *   Username/password (CredentialsProvider)
    *   Google ([docs](https://authjs.dev/getting-started/providers/google))
    *   Microsoft ([docs](https://authjs.dev/getting-started/providers/microsoft))
*   [ ] **Set Environment Variables:**
    *   `NEXTAUTH_SECRET`: Generate with `openssl rand -hex 32`.
    *   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
    *   `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`
*   [ ] **Create Auth Config:**
    *   Create `/auth.ts` in the root or `src` directory with provider configs and export next-auth handlers.
*   [ ] **Create API Route:**
    *   Create `app/api/auth/[...nextauth]/route.ts` and export handlers from `/auth.ts`.
*   [ ] **Wrap App in SessionProvider:**
    *   Use `SessionProvider` from `next-auth/react` in `app/layout.tsx`.
*   [ ] **Update Login/Logout UI:**
    *   Use `signIn`/`signOut` from `next-auth/react`.
*   [ ] **Access User Info:**
    *   Use `useSession` in client components, `auth()` in server components.
*   [ ] **Protect Routes:**
    *   Check session in server/client components to restrict access.

## Phase 4: Calendar Integration (@event-calendar/core)

*   [ ] **Install @event-calendar/core:**
    *   `npm install @event-calendar/core`.
*   [ ] **Basic Calendar Component:**
    *   Create `components/calendar/UniCalendar.tsx`.
    *   Initialize `@event-calendar/core` with a view (e.g., DayGridMonth).
    *   Style using Tailwind CSS.
*   [ ] **Data Fetching for Events:**
    *   Fetch events from backend API using TanStack Query (React Query).
*   [ ] **Event Handling:**
    *   Implement handlers for event clicks, date clicks, event drops/resizes.

## Phase 5: State Management (TanStack Query)

*   [ ] **Setup TanStack Query (React Query):**
    *   Install: `npm install @tanstack/react-query`.
    *   Configure `QueryClientProvider` in `app/layout.tsx` or a client component wrapper.
    *   Use for server state management (API data, caching, mutations).

## Phase 6: API Communication with Backend

*   [ ] **API Client/Service:**
    *   Create utility functions for API calls using `fetch`.
    *   Use `NEXT_PUBLIC_API_BASE_URL`.
*   [ ] **Data Fetching Strategies (App Router):**
    *   Server Components: Fetch data directly for SSR.
    *   Client Components: Use TanStack Query for client-side fetching.
*   [ ] **Authenticated API Requests:**
    *   Include Auth0 access token in `Authorization` header.
    *   Use `@auth0/nextjs-auth0` v4 SDK to obtain the token.

## Phase 7: Core Components & Pages

*   [ ] **Reusable UI Components (`components/ui`):**
    *   Buttons, Inputs, Modals, etc., using Tailwind CSS and Headless UI.
*   [ ] **Layout Components (`components/layout`):**
    *   Navbar, Sidebar, Footer. Integrate auth status.
*   [ ] **Initial Page Structure (`app` directory):**
    *   `(app)/page.tsx`: Landing/Dashboard.
    *   `(app)/(protected)/dashboard/page.tsx`.
    *   `(app)/(protected)/calendar/page.tsx`.
    *   `(app)/(protected)/settings/page.tsx`.
    *   Use route groups, `loading.tsx`, `error.tsx`.

## Phase 8: Linting & Formatting

*   [ ] **ESLint & Prettier Setup:**
    *   Verify ESLint rules in `eslint.config.mjs` (`eslint-config-next`).
    *   Ensure Prettier is integrated.
    *   Verify npm scripts (`lint`, `format`).
*   [ ] **Husky & lint-staged:**
    *   Install: `npm install -D husky lint-staged`.
    *   Configure pre-commit hooks.

## Phase 9: Testing Setup

*   [ ] **Install Testing Libraries:**
    *   `npm install -D jest @types/jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`.
*   [ ] **Jest Configuration:**
    *   Create `jest.config.js` and `jest.setup.js`.
    *   Configure for Next.js (SWC), TypeScript, Tailwind CSS.
    *   Set `testEnvironment: 'jsdom'`.
*   [ ] **Write Initial Tests:**
    *   Unit tests for utilities and simple components.
    *   Integration tests for components.
    *   Mock API calls and Auth0 services.

## Phase 10: Server-Side Rendering (SSR) & Optimization

*   [ ] **Leverage App Router for SSR/SSG:**
    *   Fetch data in Server Components.
    *   Use Client Components (`'use client'`) for interactive UI.
*   [ ] **Performance Optimization:**
    *   Use `next/image` for images.
    *   Use `next/font` for fonts.
    *   Use `next/dynamic` for lazy loading client components.
    *   Analyze bundle sizes with `@next/bundle-analyzer`.

## Next Steps

Proceed with implementing features based on requirements and designs.
