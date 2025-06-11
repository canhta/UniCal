# State Management Plan (Frontend)

**Overall Goal:** Implement a clear, performant, and scalable state management strategy for the UniCal frontend, leveraging appropriate tools for different types of state.

## 1. Core Principles & AI Agent Actionables

*   **[ ] Goal:** Minimize unnecessary global state.
    *   **Action:** AI will prioritize React Context for localized sharing and prop drilling for simple cases. Global state managers will be used judiciously.
*   **[ ] Goal:** Ensure simplicity, performance, and good developer experience.
    *   **Action:** AI will select and configure libraries (TanStack Query, Zustand) that are lightweight, integrate well with Next.js App Router & TypeScript, and offer good devtools.
*   **[ ] Goal:** Maintain clear separation between server cache and client UI state.
    *   **Action:** AI will use TanStack Query exclusively for server-cached data and Zustand for global client-side UI state.

## 2. State Categories & Chosen Solutions

### A. Server Cache State (Remote Data)
*   **Description:** Data fetched from the backend API (user info, events, accounts, etc.).
*   **[ ] Solution:** **TanStack Query (React Query)**
    *   **Reasoning:** Robust for caching, refetching, optimistic updates, and devtools.
    *   **AI Actions:**
        *   **[ ] Task:** Install `@tanstack/react-query` and `@tanstack/react-query-devtools`.
        *   **[ ] Task:** Create `apps/frontend/components/providers/ReactQueryProvider.tsx`.
            ```typescript
            // apps/frontend/components/providers/ReactQueryProvider.tsx
            'use client';
            import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
            import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
            import React from 'react';

            // Create a single QueryClient instance (singleton)
            const queryClient = new QueryClient({
              defaultOptions: {
                queries: {
                  staleTime: 1000 * 60 * 5, // 5 minutes
                  refetchOnWindowFocus: false,
                  retry: 1, // Retry failed requests once
                },
              },
            });

            export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
              return (
                <QueryClientProvider client={queryClient}>
                  {children}
                  <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
              );
            }
            ```
        *   **[ ] Task:** Integrate `ReactQueryProvider` into `apps/frontend/app/layout.tsx`.
            ```tsx
            // apps/frontend/app/layout.tsx
            // ... other imports
            import ReactQueryProvider from '@/components/providers/ReactQueryProvider';

            export default function RootLayout(
              { children }: { children: React.ReactNode }
            ) {
              return (
                <html lang="en">
                  <body>
                    <UserProvider> { /* Auth0 Provider */}
                      <ReactQueryProvider>
                        {/* ... other providers like ThemeProvider ... */}
                        {children}
                      </ReactQueryProvider>
                    </UserProvider>
                  </body>
                </html>
              );
            }
            ```
        *   **[ ] Task:** Define custom hooks abstracting TanStack Query logic (e.g., `useUser`, `useEvents`) within feature directories or a shared `hooks` directory, using the `apiClient` from `API_CLIENT_PLAN.md`.

### B. Global Client State (UI State)
*   **Description:** Client-side UI state shared across distant components (e.g., mobile menu visibility, theme, global notifications queue).
*   **[ ] Solution:** **Zustand**
    *   **Reasoning:** Simple, small, performant, good for Next.js & TypeScript.
    *   **AI Actions:**
        *   **[ ] Task:** Install `zustand`.
        *   **[ ] Task:** Create `apps/frontend/lib/state/stores/` directory.
        *   **[ ] Task:** Implement `apps/frontend/lib/state/stores/uiStore.ts` for common UI states (e.g., mobile menu, active modal).
            ```typescript
            // apps/frontend/lib/state/stores/uiStore.ts
            import { create } from 'zustand';
            import { devtools } from 'zustand/middleware';

            interface UIState {
              isMobileMenuOpen: boolean;
              openMobileMenu: () => void;
              closeMobileMenu: () => void;
              toggleMobileMenu: () => void;
              // Example: active modal management
              activeModal: string | null;
              openModal: (modalId: string) => void;
              closeModal: () => void;
            }

            export const useUIStore = create<UIState>()(
              devtools(
                (set) => ({
                  isMobileMenuOpen: false,
                  openMobileMenu: () => set({ isMobileMenuOpen: true }, false, 'ui/openMobileMenu'),
                  closeMobileMenu: () => set({ isMobileMenuOpen: false }, false, 'ui/closeMobileMenu'),
                  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }), false, 'ui/toggleMobileMenu'),
                  activeModal: null,
                  openModal: (modalId) => set({ activeModal: modalId }, false, 'ui/openModal'),
                  closeModal: () => set({ activeModal: null }, false, 'ui/closeModal'),
                }),
                { name: 'UIStore', store: 'ui' } // Unique name for devtools
              )
            );
            ```
        *   **[ ] Task (Phase 2 of Notifications):** Implement `apps/frontend/lib/state/stores/notificationStore.ts` if a global notification queue is needed (as per `NOTIFICATIONS_FEATURE_PLAN.md`).

### C. Local Component State
*   **[ ] Solution:** React `useState`, `useReducer`.
    *   **Reasoning:** Built-in, suitable for component-specific state.
    *   **AI Action:** AI will use these as standard React practice.

### D. URL State
*   **[ ] Solution:** Next.js App Router (`useRouter`, `useSearchParams`, `usePathname` from `next/navigation`).
    *   **Reasoning:** Built-in for shareable/bookmarkable state (filters, pagination, selected dates).
    *   **AI Action:** AI will use these hooks for managing URL-based state.

### E. Authentication State
*   **[ ] Solution:** `@auth0/nextjs-auth0` v4 (`UserProvider`, `useUser`, `getSession`).
    *   **Reasoning:** Dedicated library for auth, session management, user context.
    *   **AI Action:** AI will ensure `UserProvider` wraps the application (as shown in `ReactQueryProvider` example) and use `useUser` or `getSession` as needed, following `AUTH_FEATURE_PLAN.md`.

## 3. Devtools Integration

*   **[ ] TanStack Query Devtools:** Already included in `ReactQueryProvider` setup.
*   **[ ] Zustand with Redux Devtools:** Achieved using `devtools` middleware from `zustand/middleware` as shown in `uiStore.ts` example.
    *   **AI Action:** AI will ensure all Zustand stores are wrapped with `devtools` for debugging capabilities.

## Conclusion
This layered strategy (TanStack Query for server data, Zustand for global UI, React local state, Next.js for URL, Auth0 for auth) provides a robust and maintainable approach to state management in UniCal.
