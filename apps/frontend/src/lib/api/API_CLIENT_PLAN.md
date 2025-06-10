# API Client Plan (Phase 2)

This plan outlines the setup and structure for the API client service in the UniCal frontend. This service will be responsible for all communication with the backend API.

## Core Principles
*   **Centralized:** A single point of contact for all API interactions.
*   **Typed:** Leverage TypeScript for request and response types to ensure type safety.
*   **Error Handling:** Implement consistent error handling and reporting.
*   **Authenticated Requests:** Seamlessly handle the inclusion of authentication tokens for protected endpoints.
*   **Extensible:** Easy to add new API endpoints and methods.

## Technology Choices
*   **Primary Fetching Mechanism:** Native `fetch` API.
*   **Data Fetching/Caching (Client Components):** Consider SWR or TanStack Query (React Query) for client-side data fetching, caching, mutations, and revalidation. This will be evaluated further in `STATE_MANAGEMENT_PLAN.md` or as part of component implementation. For Server Components, direct `async/await` with `fetch` is standard.
*   **Authentication Token Retrieval:** `@auth0/nextjs-auth0` for getting access tokens.

## Phase 2: Initial Setup & Core Functionality

1.  **[ ] Directory Structure:**
    *   Create `apps/frontend/src/lib/api/`
    *   `index.ts`: Exports the main API client instance or core functions.
    *   `config.ts`: Stores base URL and other configurations.
    *   `types.ts` (or feature-specific types): Define common request/response types. As features are built, types specific to those features (e.g., `CalendarEvent`, `ConnectedAccount`) will be defined, possibly co-located with feature modules or in a shared types directory.
    *   `client.ts` (or `instance.ts`): Contains the core fetch wrapper.

2.  **[ ] Configuration (`apps/frontend/src/lib/api/config.ts`):**
    ```typescript
    // apps/frontend/src/lib/api/config.ts
    export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1'; // Fallback for local dev if backend is proxied via Next.js
    ```
    *   Ensure `NEXT_PUBLIC_API_BASE_URL` is set in `.env.local`.

3.  **[ ] Core Fetch Wrapper (`apps/frontend/src/lib/api/client.ts`):**
    *   Create a wrapper function around `fetch` that:
        *   Prepends `API_BASE_URL` to requests.
        *   Sets default headers (e.g., `Content-Type: application/json`).
        *   Handles JSON parsing for responses.
        *   Implements basic error handling (e.g., throws an error for non-2xx responses with error details from the backend).
        *   Accepts options for method, body, custom headers, etc.

    ```typescript
    // apps/frontend/src/lib/api/client.ts (Simplified Example)
    import { API_BASE_URL } from './config';

    interface ApiErrorData {
      message: string;
      statusCode?: number;
      // other potential error fields
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

    async function apiClient<T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T> {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        // Authorization header will be added by a separate utility or wrapper for authenticated requests
        ...options.headers,
      };

      const config: RequestInit = {
        ...options,
        headers: defaultHeaders,
      };

      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          let errorData: ApiErrorData | undefined;
          try {
            errorData = await response.json();
          } catch (e) {
            // Ignore if response is not JSON
          }
          throw new ApiError(
            errorData?.message || response.statusText || 'An API error occurred',
            response.status,
            errorData
          );
        }

        // Handle cases where response might be empty (e.g., 204 No Content)
        if (response.status === 204) {
          return undefined as T; // Or handle as appropriate for your app
        }
        
        return await response.json() as T;
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }
        // Handle network errors or other unexpected errors
        throw new ApiError( (error as Error).message || 'A network error occurred');
      }
    }

    export default apiClient;
    ```

4.  **[ ] Authenticated API Requests:**
    *   **Strategy:** For requests requiring authentication, the access token needs to be retrieved and added to the `Authorization` header.
    *   **Server-Side (Route Handlers, Server Components):**
        *   Use `getAccessToken` from `@auth0/nextjs-auth0`.
        *   Create a helper function or modify `apiClient` to accept an optional token or a flag to fetch it.
        ```typescript
        // Example in a Server Component or Route Handler
        import { getSession, getAccessToken } from '@auth0/nextjs-auth0';
        import apiClient from '@/lib/api/client'; // Adjust path

        // ...
        // const session = await getSession();
        // if (!session?.user) { /* handle unauthenticated */ }
        // const { accessToken } = await getAccessToken();
        // const data = await apiClient('/protected-data', {
        //   headers: {
        //     Authorization: `Bearer ${accessToken}`,
        //   },
        // });
        // ...
        ```
    *   **Client-Side (Client Components):**
        *   **Option 1 (Recommended for security): Backend For Frontend (BFF) Route Handler.**
            *   Create a Next.js Route Handler (e.g., `app/api/proxy/[...path]/route.ts`).
            *   This handler receives the request from the client component.
            *   Server-side, it retrieves the access token using `getAccessToken`.
            *   It then forwards the request to the actual backend API with the token.
            *   This keeps the access token from being exposed directly to the browser for long periods.
        *   **Option 2 (If BFF is too complex for initial setup): Fetch token on demand.**
            *   Create a client-side utility that calls a Route Handler dedicated to exposing the access token.
            *   The client component calls this utility to get the token, then makes the API request.
            *   This is less secure than BFF as the token is handled more in client-side code.
            ```typescript
            // Example: app/api/auth/token/route.ts
            // import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
            // export const GET = withApiAuthRequired(async function token(req) {
            //   const { accessToken } = await getAccessToken();
            //   return new Response(JSON.stringify({ accessToken }), {
            //     headers: { 'Content-Type': 'application/json' },
            //   });
            // });
            ```
            And in client component:
            ```typescript
            // async function getClientAccessToken() {
            //   const response = await fetch('/api/auth/token');
            //   if (!response.ok) throw new Error('Failed to get access token');
            //   const { accessToken } = await response.json();
            //   return accessToken;
            // }
            // const token = await getClientAccessToken();
            // const data = await apiClient('/protected-data', { headers: { Authorization: `Bearer ${token}` } });
            ```
    *   **[ ] Task:** Decide on the client-side token strategy (BFF preferred) and implement the necessary helpers/wrappers.

5.  **[ ] Initial API Endpoint Implementations (Examples - to be expanded as features are built):**
    *   `auth.ts` (if simple email login is implemented separately from Auth0 initially):
        *   `simpleLogin(email: string): Promise<AuthResponse>`
    *   `user.ts`:
        *   `getMe(): Promise<User>`
    *   `integrations.ts`:
        *   `getConnectedAccounts(): Promise<ConnectedAccount[]>`
        *   `connectGoogleCalendar(): Promise<RedirectResponse>` (backend handles OAuth redirect)
        *   `disconnectAccount(accountId: string): Promise<void>`
    *   `calendar.ts`:
        *   `getEvents(params: GetEventsParams): Promise<CalendarEvent[]>`
        *   `createEvent(eventData: NewEventData): Promise<CalendarEvent>`

6.  **[ ] Type Definitions (`apps/frontend/src/lib/api/types.ts` or feature-specific):**
    *   Start defining basic types for API responses (e.g., `User`, `AuthResponse`, `ConnectedAccount`, `CalendarEvent`). These will evolve.

## Phase 3 & Beyond: Enhancements

*   **[ ] Integration with SWR/TanStack Query:**
    *   If chosen, wrap `apiClient` calls with SWR/React Query hooks for client-side data fetching, caching, optimistic updates, etc.
*   **[ ] Advanced Error Handling:**
    *   Global error handling (e.g., redirect to login on 401, display notifications for other errors). This might tie into a global state solution.
*   **[ ] Request Cancellation:**
    *   Implement request cancellation if needed for complex scenarios.
*   **[ ] Mocking for Tests:**
    *   Develop a strategy for easily mocking API requests during testing (e.g., using `msw` - Mock Service Worker).

## Notes:
*   The `apiClient` should be flexible enough to be used in Server Components, Client Components (potentially via SWR/React Query or BFF), and Route Handlers.
*   Security is paramount for authenticated requests. Prioritize keeping access tokens secure (server-side or short-lived on the client).
