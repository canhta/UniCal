# UniCal E2E Testing Setup

This directory contains the end-to-end testing infrastructure for the UniCal application using Playwright.

## Getting Started

### Prerequisites
- Node.js 18+ and Yarn
- UniCal frontend and backend applications running locally
- Playwright browsers installed

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Install Playwright browsers:
```bash
yarn test:install
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

4. Update the `.env` file with your test configuration:
```
FRONTEND_URL=http://localhost:3030
BACKEND_URL=http://localhost:3000
TEST_USER_EMAIL=test.user@example.com
TEST_USER_PASSWORD=TestUser123!
# ... other configuration
```

### Running Tests

#### Basic Commands
```bash
# Run all tests
yarn test

# Run tests in headed mode (with browser UI)
yarn test:headed

# Run tests with debugging
yarn test:debug

# Run tests with UI mode
yarn test:ui

# Show test report
yarn test:report
```

#### Test Categories
```bash
# Run smoke tests only
yarn test:smoke

# Run regression tests
yarn test:regression

# Generate test code
yarn test:codegen
```

## Test Structure

### Page Object Model
The tests use Page Object Model for maintainability:

- `src/pages/` - Page objects for different application pages
- `src/utils/` - Helper utilities for common operations
- `src/fixtures/` - Test data and fixtures

### Key Files
- `playwright.config.ts` - Main Playwright configuration
- `global-setup.ts` - Global test setup (runs before all tests)
- `global-teardown.ts` - Global test cleanup (runs after all tests)

## Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../src/pages/LoginPage';
import { AuthHelper } from '../src/utils/auth-helper';

test.describe('Feature Name', () => {
  let loginPage: LoginPage;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    authHelper = new AuthHelper(page);
  });

  test('should do something @smoke', async ({ page }) => {
    // Test implementation
  });
});
```

### Using Page Objects
```typescript
// Navigate to login page
await loginPage.goto();

// Login with test user
await authHelper.loginAsUser('user');

// Verify login success
await expect(page).toHaveURL(/.*dashboard/);
```

### Test Tags
Use tags to categorize tests:
- `@smoke` - Critical functionality tests
- `@regression` - Tests for bug prevention
- `@integration` - Complex workflow tests
- `@performance` - Performance-related tests

## Configuration

### Environment Variables
See `.env.example` for all available configuration options:

- **Application URLs**: Frontend and backend URLs
- **Test Credentials**: User accounts for testing
- **External Services**: Auth0, Google, Microsoft credentials
- **Test Settings**: Timeouts, retry counts, debugging options

### Playwright Configuration
Key configuration in `playwright.config.ts`:

- **Browsers**: Chrome, Firefox, Safari (desktop and mobile)
- **Timeouts**: Test and assertion timeouts
- **Retries**: Retry failed tests in CI
- **Reports**: HTML, JUnit, GitHub Actions reporters
- **Screenshots/Videos**: Capture on failure
- **Traces**: Detailed execution traces

### Web Server Integration
Tests automatically start frontend and backend servers:

```typescript
webServer: [
  {
    command: 'yarn workspace @unical/frontend dev',
    url: 'http://localhost:3030',
  },
  {
    command: 'yarn workspace @unical/backend start:dev',
    url: 'http://localhost:3000/api/health',
  },
]
```

## CI/CD Integration

### GitHub Actions
Tests run automatically on:
- Pull requests
- Main branch pushes
- Scheduled runs

### CI-Specific Configuration
```bash
# Run tests for CI
yarn test:ci
```

Special CI configuration:
- Reduced parallelism for stability
- Extended timeouts
- Multiple report formats
- Artifact collection

## Debugging

### Debug Mode
```bash
# Run with debugger
yarn test:debug

# Run specific test with debugging
yarn test <test-file> --debug
```

### Screenshots and Videos
Failed tests automatically capture:
- Screenshots of the failure point
- Video recordings of the test execution
- Detailed execution traces

### Trace Viewer
```bash
# Show trace for failed test
npx playwright show-trace test-results/path-to-trace.zip
```

## Best Practices

### Test Writing
1. Use descriptive test names
2. Keep tests independent and isolated
3. Use page objects for reusable interactions
4. Add appropriate test tags
5. Handle async operations properly

### Data Management
1. Use test-specific data
2. Clean up test data between runs
3. Mock external services when appropriate
4. Use environment-specific test accounts

### Maintenance
1. Update tests when features change
2. Review and optimize slow tests
3. Keep page objects up to date
4. Monitor test stability

## Troubleshooting

### Common Issues

**Tests timing out:**
- Check if applications are running
- Verify environment URLs are correct
- Increase timeout values if needed

**Authentication failures:**
- Verify test user credentials
- Check if test users exist in database
- Ensure Auth0/SSO configuration is correct

**Element not found errors:**
- Update selectors in page objects
- Check for loading states
- Verify responsive design changes

**CI failures:**
- Check browser compatibility
- Review CI-specific configuration
- Examine test artifacts and reports

### Getting Help
1. Check test reports and traces
2. Review configuration files
3. Examine application logs
4. Run tests locally to reproduce issues

## Future Enhancements

### Planned Features
- Visual regression testing
- API testing integration
- Performance monitoring
- Cross-browser compatibility matrix
- Automated accessibility testing

### Monitoring
- Test execution metrics
- Failure rate tracking
- Performance benchmarks
- Flaky test detection
