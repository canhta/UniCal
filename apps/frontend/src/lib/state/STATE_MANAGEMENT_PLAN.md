<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/frontend/src/lib/state/STATE_MANAGEMENT_PLAN.md -->
# State Management Plan

This plan outlines the strategy for state management in the UniCal frontend application.

## Core Principles
*   **Minimize Global State:** Prefer React Context for localized state or simple prop drilling where appropriate. Use a global state manager only when truly necessary for state shared across distant parts of the component tree or for complex state logic.
*   **Simplicity & Performance:** Choose a library that is simple, performant, and has a small bundle size.
*   **Developer Experience:** The chosen solution should integrate well with Next.js (App Router) and TypeScript, offering good devtools support.
*   **SSR Compatibility:** Ensure clear patterns for server-side rendering or initialization if global state needs to be accessed or hydrated on the server.
*   **Clear Separation:** Distinguish clearly between client-side UI state and server cache state.

## State Categories

### 1. Server Cache State (Remote State)
*   **Description:** Data fetched from the backend API, including user data, calendar events, integration settings, etc. This state is asynchronous and needs mechanisms for fetching, caching, revalidation, and mutation.
*   **Chosen Solution:** **TanStack Query (React Query)**
    *   **Reasoning:** Robust features for managing server state, including caching, automatic refetching, optimistic updates, and excellent devtools. It significantly simplifies data fetching logic and reduces the need to store API data in global client stores.
    *   **Integration:**
        *   Will be set up as per `SETUP_PLAN.md` and used in conjunction with the API client defined in `API_CLIENT_PLAN.md`.
        *   A global `QueryClientProvider` will be added to `app/layout.tsx`.
        *   Custom hooks (e.g., `useEvents`, `useUserSettings`) will encapsulate TanStack Query logic for specific data types.
*   **Tasks:**
    *   [ ] **Install TanStack Query:** `npm install @tanstack/react-query @tanstack/react-query-devtools`
    *   [ ] **Setup `QueryClientProvider`:** In `app/layout.tsx` (or a dedicated client component provider).
        ```tsx
        // Example: components/providers/ReactQueryProvider.tsx
        'use client';
        import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
        import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
        import React from 'react';

        export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
          const [queryClient] = React.useState(() => new QueryClient({
            defaultOptions: {
              queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                refetchOnWindowFocus: false, // Optional: adjust as needed
              },
            },
          }));

          return (
            <QueryClientProvider client={queryClient}>
              {children}
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          );
        }

        // Then use <ReactQueryProvider> in app/layout.tsx
        ```
    *   [ ] Define custom hooks for API interactions (e.g., `useEvents`, `useUserIntegrations`).

### 2. Global Client State (UI State)
*   **Description:** State that is purely client-side, often related to UI, and needs to be shared across multiple, potentially distant, components. Examples: mobile menu open/close state, current theme (if user-selectable), global notification messages.
*   **Chosen Solution:** **Zustand**
    *   **Reasoning:** Simple API, small bundle size, good performance, and easy integration with React hooks. It avoids the complexity of Redux for scenarios where a lighter solution is sufficient.
*   **Tasks:**
    *   [ ] **Install Zustand:** `npm install zustand` (if not already done as per `SETUP_PLAN.md`).
    *   [ ] **Create Stores Directory:** `apps/frontend/src/lib/state/stores/`
    *   [ ] **Define Initial Stores:**
        *   **`uiStore.ts`:** For general UI state.
            ```typescript
            // apps/frontend/src/lib/state/stores/uiStore.ts
            import { create } from 'zustand';

            interface UIState {
              isMobileMenuOpen: boolean;
              openMobileMenu: () => void;
              closeMobileMenu: () => void;
              toggleMobileMenu: () => void;
              // Add other global UI states here, e.g., active modal, global loading indicators
            }

            export const useUIStore = create<UIState>((set) => ({
              isMobileMenuOpen: false,
              openMobileMenu: () => set({ isMobileMenuOpen: true }),
              closeMobileMenu: () => set({ isMobileMenuOpen: false }),
              toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
            }));
            ```
        *   **(Optional) `notificationStore.ts`:** For managing a queue of global notifications/toasts.
    *   [ ] **Integrate with Components:** Use hooks like `useUIStore()` in components (e.g., Navbar for mobile menu).

### 3. Local Component State
*   **Description:** State confined to a single component or a small group of closely related components.
*   **Chosen Solution:** **React `useState`, `useReducer`**
    *   **Reasoning:** Built-in React features, perfectly suited for local state management without adding external dependencies.
*   **Usage:** Standard React practice.

### 4. URL State
*   **Description:** State managed via URL query parameters or path segments, making it shareable and bookmarkable. Examples: active filters, current page in pagination, selected date in a calendar.
*   **Chosen Solution:** **Next.js App Router (`useRouter`, `useSearchParams`, `usePathname`)**
    *   **Reasoning:** Built-in Next.js capabilities for managing URL-based state.
*   **Usage:** Use Next.js routing hooks to read and update URL state.

### 5. Authentication State
*   **Description:** User authentication status and profile information.
*   **Chosen Solution:** **`@auth0/nextjs-auth0` (`UserProvider`, `useUser`, `getSession`)**
    *   **Reasoning:** Dedicated library for authentication, handles session management and provides user context.
*   **Usage:** As per Auth0 SDK documentation and `SETUP_PLAN.md`.

## Devtools
*   **TanStack Query Devtools:** Will be integrated for inspecting query cache, statuses, and data.
*   **Redux Devtools (for Zustand):** Zustand can be connected to Redux Devtools via its middleware for easier debugging of global client state.
    *   [ ] **Setup Zustand with Redux Devtools:**
        ```typescript
        // Example in a store like uiStore.ts
        import { create } from 'zustand';
        import { devtools } from 'zustand/middleware';

        interface UIState { /* ... */ }

        export const useUIStore = create<UIState>()(
          devtools(
            (set) => ({
              // ... store definition
              isMobileMenuOpen: false,
              openMobileMenu: () => set({ isMobileMenuOpen: true }, false, 'openMobileMenu'),
              closeMobileMenu: () => set({ isMobileMenuOpen: false }, false, 'closeMobileMenu'),
              toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }), false, 'toggleMobileMenu'),
            }),
            { name: 'UIStore' } // Name for the devtools
          )
        );
        ```

## Conclusion
The state management strategy is layered:
1.  **TanStack Query** for server state.
2.  **Zustand** for global client-side UI state.
3.  **React local state** for component-specific needs.
4.  **Next.js Router** for URL-driven state.
5.  **Auth0 SDK** for authentication state.

This approach aims for a balance of power, simplicity, and performance, using specialized tools for each category of state.
