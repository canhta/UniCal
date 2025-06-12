<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/frontend/lib/api/API_CLIENT_PLAN.md -->
# API Client Plan (Frontend)

**Overall Goal:** Establish a robust, typed, and centralized API client for all frontend communication with the backend, handling authentication seamlessly.

## 1. Core Principles & AI Agent Actionables

*   **[x] Goal:** Centralize API interactions.
    *   **Action:** AI will create a primary API client module.
*   **[ ] Goal:** Ensure type safety for requests and responses.
    *   **Action:** AI will define and use TypeScript types for all API DTOs, co-locating them with feature plans or in a shared types directory.
*   **[ ] Goal:** Implement consistent error handling.
    *   **Action:** AI will create a custom `ApiError` class and ensure the client throws this for non-successful responses.
*   **[ ] Goal:** Handle authenticated requests securely.
    *   **Action:** AI will use session tokens from next-auth v5 for authenticated API requests. Reference: [NextAuth.js Installation](https://authjs.dev/getting-started/installation)
*   **[ ] Goal:** Make the client extensible for new endpoints.
    *   **Action:** AI will structure the client to allow easy addition of new API methods, likely grouped by resource/feature.

## 2. Technology Choices

*   **[ ] Fetching:** Native `fetch` API.
*   **[ ] Client-Side Data Management:** TanStack Query (React Query) for caching, mutations, revalidation in Client Components (details in `STATE_MANAGEMENT_PLAN.md`). Server Components will use direct `fetch`.

## 3. Phase 1: Setup & Core Functionality

*   **[ ] Goal:** Establish directory structure and configuration.
    *   **Action:** AI will create `apps/frontend/lib/api/` with:
        *   `index.ts`: Exports core client functions/instances.
        *   `config.ts`: Defines `API_BASE_URL` (e.g., `process.env.NEXT_PUBLIC_API_BASE_URL || '/api/proxy'`).
        *   `client.ts`: Contains the core fetch wrapper.
        *   `types.ts` (or `dtos.ts`): Central location for API DTOs if not co-located.
*   **[ ] Goal:** Implement the core `apiClient` fetch wrapper (`apps/frontend/lib/api/client.ts`).
    *   **Action:** AI will create a function that:
        *   Prepends `API_BASE_URL`.
        *   Sets default headers (`Content-Type: application/json`).
        *   Handles JSON parsing and `ApiError` for non-2xx responses.
        *   Accepts `RequestInit` options.
        *   Handles 204 No Content responses appropriately.
    ```typescript
    // Example structure for apps/frontend/lib/api/client.ts
    import { API_BASE_URL } from './config';

    export interface ApiErrorData {
      message: string;
      statusCode?: number;
      details?: any; // For validation errors etc.
    }

    export class ApiError extends Error {
      status?: number;
      data?: ApiErrorData;

      constructor(message: string, status?: number, data?: ApiErrorData) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
      }
    }

    export async function apiClient<T>(
      endpoint: string,
      options: RequestInit = {},
      isBffRequest: boolean = false // Flag to indicate if request is to our BFF
    ): Promise<T> {
      const baseUrl = isBffRequest ? '' : API_BASE_URL; // BFF routes are absolute
      const url = `${baseUrl}${endpoint}`;
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        let errorData: ApiErrorData | undefined;
        try {
          errorData = await response.json();
        } catch (e) { /* Ignore if response is not JSON */ }
        throw new ApiError(
          errorData?.message || response.statusText || 'An API error occurred',
          response.status,
          errorData
        );
      }
      if (response.status === 204) return undefined as T;
      return response.json() as T;
    }
    ```
*   **[ ] Goal:** Implement authenticated request handling.
    *   **Server-Side (Route Handlers, Server Components):**
        *   **Action:** AI will pass the token in the `Authorization` header when calling `apiClient` directly (targeting the actual backend API, not the BFF proxy).
    *   **Client-Side (Client Components - BFF Approach):**
        *   **Action:** AI will create Next.js Route Handlers under `apps/frontend/app/api/proxy/[...path]/route.ts`.
        *   **Action:** These BFF handlers will:
            *   Receive requests from client components.
            *   Forward the request to the actual backend API (e.g., `process.env.INTERNAL_API_BASE_URL`) using the `apiClient` or a direct `fetch`, including the Auth0 token.
            *   Return the backend's response to the client component.
        *   **Action:** Client components will call these BFF proxy endpoints using `apiClient(endpoint, options, true)`. The `Authorization` header for these calls to the BFF itself will be handled by Auth0's session cookie.
*   **[ ] Goal:** Define initial API service methods (grouped by resource).
    *   **Action:** AI will create files like `apps/frontend/lib/api/services/user.ts`, `integrations.ts`, etc.
    *   Example `user.ts`:
        ```typescript
        // apps/frontend/lib/api/services/user.ts
        import { apiClient } from '../client';
        import { User } from '../types'; // Or feature-specific types

        export const userService = {
          getMe: async (): Promise<User> => {
            // This call goes through the BFF proxy
            return apiClient<User>('/api/proxy/users/me', {}, true);
          },
          // Example for a Server Component call (direct to backend, token handled by caller)
          // getMeServer: async (accessToken: string): Promise<User> => {
          //   return apiClient<User>('/users/me', { headers: { Authorization: `Bearer ${accessToken}` } });
          // }
        };
        ```
*   **[ ] Goal:** Define initial DTOs.
    *   **Action:** AI will create/update `apps/frontend/lib/api/types.ts` or co-locate types (e.g., `User`, `ConnectedAccount`, `CalendarEvent`).

## 4. Phase 2: Integration & Enhancements

*   **[ ] Goal:** Integrate with TanStack Query for Client Components.
    *   **Action:** AI will create custom hooks using TanStack Query that wrap `apiClient` calls to BFF endpoints (e.g., `useUserMe`, `useConnectedAccounts`).
*   **[ ] Goal:** Implement advanced global error handling.
    *   **Action:** AI will configure TanStack Query's global error handlers or use a React Error Boundary to catch `ApiError` instances and display appropriate UI (e.g., toast notifications, redirect on 401).
*   **[ ] Goal:** Set up API mocking for tests.
    *   **Action:** AI will integrate `msw` (Mock Service Worker) to mock API responses during Jest/RTL tests and potentially for Storybook. Refer to `TESTING_SETUP_PLAN.md`.

## Notes:
*   The `API_BASE_URL` in `config.ts` should point to the BFF proxy base path (e.g., `/api/proxy`) for client-side calls that go through the BFF. Server-side calls or direct backend calls will use a different base URL (e.g., from `process.env.INTERNAL_API_BASE_URL`).
*   The BFF proxy (`/api/proxy/[...path]/route.ts`) is crucial for security, preventing access tokens from being exposed directly in the browser.
