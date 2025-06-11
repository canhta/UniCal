# Frontend Testing Setup Plan (Aligns with Frontend AGENT_PLAN Phase 4)

This plan outlines the setup for testing the UniCal frontend, covering unit, integration, and E2E considerations.

## Core Principles
*   **Confidence:** Tests ensure application correctness.
*   **Maintainability:** Tests are easy to write, understand, and update.
*   **Speed:** Fast execution for frequent runs.
*   **Coverage:** Prioritize quality and critical path coverage.
*   **Automation:** Integrate into CI/CD.

## Technologies
*   **Test Runner:** Jest
*   **Testing Library:** React Testing Library (RTL)
*   **Assertions:** Jest `expect` + `@testing-library/jest-dom`
*   **Environment:** `jest-environment-jsdom`
*   **Mocking:** Jest mocks. Consider Mock Service Worker (MSW) for APIs.
*   **E2E (Future):** Playwright or Cypress.

## Phase 4: Setup & Initial Tests (Aligns with `SETUP_PLAN.md` Phase 9)

### 1. Installation
*   [ ] **Install Core Libraries:**
    ```bash
    npm install -D jest @types/jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @testing-library/user-event
    ```

### 2. Jest Configuration
*   [ ] **Create `jest.config.js` (or `jest.config.ts`):**
    ```javascript
    // jest.config.js
    const nextJest = require('next/jest');

    const createJestConfig = nextJest({
      dir: './', // Path to Next.js app
    });

    /** @type {import('jest').Config} */
    const customJestConfig = {
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // or .ts
      testEnvironment: 'jest-environment-jsdom',
      moduleNameMapper: {
        // Aliases handled by nextJest. Add specific problematic ones if needed.
        // Example for @event-calendar if not resolved automatically:
        // '^@event-calendar/(.*)$': '<rootDir>/node_modules/@event-calendar/$1',
      },
      // transformIgnorePatterns needed if external libs are ESM and not transformed by default
      // By default, next/jest should handle this for most cases.
      // transformIgnorePatterns: [
      //   '/node_modules/(?!@event-calendar)/.+',
      // ],
      moduleDirectories: ['node_modules', '<rootDir>/'], // <rootDir>/ allows absolute imports from src/
    };

    module.exports = createJestConfig(customJestConfig);
    ```
*   [ ] **Create `jest.setup.js` (or `jest.setup.ts`):**
    ```javascript
    // jest.setup.js
    import '@testing-library/jest-dom';

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Global mocks for Next.js router if needed (less critical with App Router testing patterns)
    // jest.mock('next/navigation', () => ({
    //   useRouter: jest.fn().mockReturnValue({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
    //   usePathname: jest.fn().mockReturnValue('/mock-path'),
    //   useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
    //   redirect: jest.fn(),
    //   permanentRedirect: jest.fn(),
    // }));
    ```
*   [ ] **Update `tsconfig.json` (ensure Jest types):**
    ```json
    {
      "compilerOptions": {
        // ...
        "types": ["jest", "node", "@testing-library/jest-dom"]
      },
      "include": [
        // ...
        "jest.config.js", // or .ts
        "jest.setup.js", // or .ts
        "**/*.test.ts",
        "**/*.test.tsx",
        "next-env.d.ts" // ensure this is also included
      ]
      // ensure "exclude": ["node_modules"] is present
    }
    ```

### 3. NPM Scripts (`package.json`)
*   [ ] **Add Test Scripts:**
    ```json
    {
      "scripts": {
        // ...
        "test": "jest",
        "test:watch": "jest --watch",
        "test:cov": "jest --coverage", // Renamed for clarity
        "test:ci": "jest --ci --coverage --silent" // Added --silent for cleaner CI output
      }
    }
    ```

### 4. Writing Initial Tests
*   **Convention:** `*.test.ts(x)`. Co-locate or use `__tests__`.
*   [ ] **Unit Tests (Utilities, Hooks):** Test pure functions and custom hooks in isolation.
    *   Example: `src/lib/utils/formatDate.test.ts` for `formatDate.ts`.
*   [ ] **Component Tests (RTL):** Test behavior from user's perspective. Use accessible queries. Simulate interactions with `@testing-library/user-event`.
    *   Example: `src/components/ui/Button.test.tsx` for `Button.tsx`.
    *   **Calendar Components (`@event-calendar/core` based):**
        *   Mock library parts if direct interaction is complex.
        *   Test prop passing and event handling in wrapper components.
        *   Verify view changes and API calls for new data.

### 5. Mocking
*   [ ] **Modules (API Client, Auth0 hooks):** Use `jest.mock('module-path')`.
    *   **Auth0 `useUser` Mock:**
        ```typescript
        // In test file or jest.setup.js for global mock
        jest.mock('@auth0/nextjs-auth0/client', () => ({
          useUser: jest.fn().mockReturnValue({
            user: { name: 'Test User', email: 'test@example.com', sub: 'auth0|123', picture: 'http://example.com/avatar.png' },
            isLoading: false,
            error: null,
            // Add other functions returned by useUser if used:
            // checkSession: jest.fn(),
          }),
          // Mock UserProvider if needed, though usually not directly interacted with in tests
          // UserProvider: ({ children }) => <>{children}</>,
          // Mock getAccessToken if your API client calls it directly in components (better to have api client handle this)
          // getAccessToken: jest.fn().mockResolvedValue('mocked-access-token'),
        }));
        ```
    *   **API Client Mock (Example for `src/lib/api/apiClient.ts`):**
        ```typescript
        // jest.mock('@/lib/api/apiClient', () => ({
        //   fetchEvents: jest.fn().mockResolvedValue([]),
        //   createEvent: jest.fn().mockResolvedValue({ id: '1', title: 'New Event' }),
        //   // ... other mocked API functions
        // }));
        ```
*   [ ] **API Mocking (Consider MSW for Integration Tests):**
    *   MSW intercepts network requests. Defer if `jest.mock` is sufficient initially.
    *   Setup: `npm install -D msw`. Define handlers. Integrate with `jest.setup.js`.

## Phase 5 & Beyond: Advanced Testing & CI (Aligns with Frontend AGENT_PLAN Phase 5)

*   [ ] **Integration Tests:** Test interactions between multiple components or components with context/providers (e.g., form submission).
*   [ ] **Testing Next.js App Router Specifics:**
    *   **Server Components:** Unit test complex logic as functions. For UI, use E2E or higher-level integration tests.
    *   **Client Components:** Test as regular React components.
    *   **Route Handlers:** Test services they call. For complex handlers, use `node-mocks-http` or similar.
    *   **Pages (Server Components):** Test data fetching logic.
*   [ ] **Code Coverage:** Use `npm run test:cov`. Aim for reasonable coverage of critical logic.
*   [ ] **CI Integration:** Configure CI (e.g., GitHub Actions) to run `npm run test:ci`.
*   [ ] **E2E Testing (Playwright/Cypress - Future):** For full user flows.

## Test Directory Structure
*   **Co-location (Recommended):** `MyComponent.test.tsx` alongside `MyComponent.tsx`.
*   **Mocks (If using MSW or extensive global mocks):** `src/mocks/` (e.g., `src/mocks/handlers.ts`, `src/mocks/server.ts`).

This plan provides a foundation. Start with unit/component tests for core UI and utilities, then expand.
