# Testing Setup Plan (Phase 4)

This plan outlines the setup for testing the UniCal frontend application, covering unit, integration, and potentially end-to-end (E2E) testing.

## Core Principles
*   **Confidence:** Tests should provide confidence that the application works as expected.
*   **Maintainability:** Tests should be easy to write, understand, and maintain.
*   **Speed:** Test suites should run quickly to encourage frequent execution.
*   **Coverage:** Aim for good coverage of critical paths and complex logic, but prioritize quality over quantity.
*   **Automation:** Integrate tests into CI/CD pipelines.

## Technologies
*   **Test Runner:** Jest
*   **Testing Library:** React Testing Library (RTL) for components.
*   **Assertions:** Jest `expect` + `@testing-library/jest-dom` for custom DOM matchers.
*   **Environment:** `jest-environment-jsdom` for simulating a browser environment.
*   **Mocking:** Jest's built-in mocking capabilities. Consider Mock Service Worker (MSW) for API mocking.
*   **E2E Testing (Future Consideration):** Playwright or Cypress.

## Phase 4: Setup & Initial Tests

### 1. Installation (as per `SETUP_PLAN.md` Phase 9)
*   **[ ] Install Core Libraries:**
    ```bash
    npm install -D jest @types/jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom @testing-library/user-event
    ```
    *   `@testing-library/user-event` is crucial for simulating user interactions more realistically.

### 2. Jest Configuration
*   **[ ] Create `jest.config.js` (or `jest.config.ts`):**
    ```javascript
    // jest.config.js
    const nextJest = require('next/jest');

    const createJestConfig = nextJest({
      // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
      dir: './',
    });

    // Add any custom config to be passed to Jest
    /** @type {import('jest').Config} */
    const customJestConfig = {
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // or .ts
      testEnvironment: 'jest-environment-jsdom',
      moduleNameMapper: {
        // Handle module aliases (this will be automatically configured by nextJest)
        // e.g., '@/components/(.*)': '<rootDir>/src/components/$1',
      },
      // Add more setup options before each test is run
      // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
      moduleDirectories: ['node_modules', '<rootDir>/'],
      // ...other custom configurations
    };

    // createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
    module.exports = createJestConfig(customJestConfig);
    ```
*   **[ ] Create `jest.setup.js` (or `jest.setup.ts`):**
    ```javascript
    // jest.setup.js
    import '@testing-library/jest-dom'; // Extends Jest expect with DOM matchers

    // Optional: Global mocks or setup can go here
    // For example, mocking Next.js router for non-App Router tests (less needed with App Router testing patterns)
    // jest.mock('next/router', () => require('next-router-mock'));
    // jest.mock('next/dist/client/router', () => require('next-router-mock')); // if you encounter issues with App Router

    // Mock matchMedia for components that use it (e.g., some UI libraries)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    ```
*   **[ ] Update `tsconfig.json` (if not already present for Jest types):**
    ```json
    {
      "compilerOptions": {
        // ... other options
        "types": ["jest", "node", "@testing-library/jest-dom"]
      },
      "include": [
        // ... other includes
        "jest.setup.js", // or .ts
        "**/*.test.ts",
        "**/*.test.tsx"
      ]
    }
    ```

### 3. NPM Scripts (`package.json`)
*   **[ ] Add Test Scripts:**
    ```json
    {
      "scripts": {
        // ... other scripts
        "test": "jest",
        "test:watch": "jest --watch",
        "test:ci": "jest --ci --coverage" // For CI environments
      }
    }
    ```

### 4. Writing Initial Tests
*   **[ ] Test File Convention:** `*.test.ts` or `*.test.tsx`. Place test files alongside the code they are testing (co-location) or in a dedicated `__tests__` directory.
    *   Example: `apps/frontend/src/components/ui/Button.test.tsx`
*   **[ ] Unit Tests (Utilities, Hooks):**
    *   Test pure functions and custom hooks in isolation.
    *   Example for a utility function:
        ```typescript
        // apps/frontend/src/lib/utils/formatDate.ts
        export function formatDate(date: Date): string {
          return date.toLocaleDateString('en-US');
        }

        // apps/frontend/src/lib/utils/formatDate.test.ts
        import { formatDate } from './formatDate';
        describe('formatDate', () => {
          it('should format a date correctly', () => {
            const date = new Date(2023, 0, 1); // Jan 1, 2023
            expect(formatDate(date)).toBe('1/1/2023');
          });
        });
        ```
*   **[ ] Component Tests (React Testing Library):**
    *   Focus on testing component behavior from a user's perspective.
    *   Query elements by accessible roles, text, labels, etc.
    *   Simulate user interactions with `@testing-library/user-event`.
    *   Example for `Button.tsx`:
        ```tsx
        // apps/frontend/src/components/ui/Button.test.tsx
        import { render, screen } from '@testing-library/react';
        import userEvent from '@testing-library/user-event';
        import { Button } from './Button'; // Assuming Button component exists

        describe('Button', () => {
          it('renders a button with the given text', () => {
            render(<Button>Click Me</Button>);
            expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
          });

          it('calls onClick handler when clicked', async () => {
            const handleClick = jest.fn();
            render(<Button onClick={handleClick}>Click Me</Button>);
            await userEvent.click(screen.getByRole('button', { name: /click me/i }));
            expect(handleClick).toHaveBeenCalledTimes(1);
          });

          it('is disabled when disabled prop is true', () => {
            render(<Button disabled>Click Me</Button>);
            expect(screen.getByRole('button', { name: /click me/i })).toBeDisabled();
          });
        });
        ```

### 5. Mocking
*   **[ ] Mocking Modules (e.g., API Client, Auth0 hooks):**
    *   Use `jest.mock('module-path')`.
    *   Example: Mocking Auth0 `useUser` hook:
        ```typescript
        // In your test file
        jest.mock('@auth0/nextjs-auth0/client', () => ({
          useUser: jest.fn().mockReturnValue({
            user: { name: 'Test User', email: 'test@example.com' },
            isLoading: false,
            error: null,
          }),
        }));
        ```
*   **[ ] API Mocking (Consider MSW - Mock Service Worker):**
    *   For more robust API mocking in integration tests, MSW allows you to intercept actual network requests.
    *   **Setup (If chosen):**
        *   `npm install -D msw`
        *   Define handlers for your API endpoints.
        *   Integrate with Jest setup (`jest.setup.js`):
            ```javascript
            // jest.setup.js (example with MSW)
            // import { server } from './mocks/server'; // Your MSW server setup
            // beforeAll(() => server.listen());
            // afterEach(() => server.resetHandlers());
            // afterAll(() => server.close());
            ```
    *   This is a more advanced setup, can be deferred if simple `jest.mock` is sufficient initially.

## Phase 5 & Beyond: Advanced Testing & CI

*   **[ ] Integration Tests:**
    *   Test interactions between multiple components or components with context/providers.
    *   Example: Test a form component with its input fields and submission logic.
*   **[ ] Testing Next.js App Router Specifics:**
    *   **Server Components:** Unit test any complex logic within them as regular functions. For rendering, you might need to test them in the context of a page or use experimental testing utilities if they become available.
    *   **Client Components:** Test as regular React components.
    *   **Route Handlers:** Can be tested by mocking `req` and `res` objects or using tools like `node-mocks-http` if they become complex. Often, testing the services they call is more direct.
    *   **Pages (Server Components):** Test data fetching logic separately. For UI, consider E2E tests or higher-level integration tests that render the page.
*   **[ ] Code Coverage:**
    *   Use `jest --coverage` to generate coverage reports.
    *   Aim for a reasonable coverage percentage, focusing on critical logic.
*   **[ ] CI Integration:**
    *   Configure your CI/CD pipeline (e.g., GitHub Actions) to run `npm run test:ci` on every push or pull request.
*   **[ ] E2E Testing (Playwright/Cypress - Future):**
    *   For testing complete user flows through the application in a real browser environment.
    *   This is a larger undertaking and typically comes after good unit/integration test coverage.

## Directory Structure for Tests:
*   Co-location: `MyComponent.test.tsx` next to `MyComponent.tsx`.
*   Or centralized: `apps/frontend/src/__tests__/components/MyComponent.test.tsx`.
*   Mocks: `apps/frontend/src/mocks/` (for MSW handlers or global mocks).

This plan provides a solid foundation for testing. Start with unit and component tests for core UI elements and utilities, then expand to integration tests and more complex scenarios.
