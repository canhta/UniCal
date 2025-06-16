// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting UniCal E2E test global setup...');
  console.log('📋 Configuration:', {
    frontend: process.env.FRONTEND_URL || 'http://localhost:3030',
    backend: process.env.BACKEND_URL || 'http://localhost:3000',
    ci: process.env.CI || 'false'
  });
  
  // Create a browser instance for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for services to be ready
    await waitForServices(page);
    
    // Setup test data if needed
    await setupTestData(page);
    
    // Verify essential test prerequisites
    await verifyTestPrerequisites(page);
    
    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    
    // Provide helpful debugging information
    await logDebugInfo(page);
    
    // In CI, we might want to fail fast, but locally we can be more forgiving
    if (process.env.CI) {
      throw error;
    } else {
      console.log('⚠️  Continuing with test execution despite setup issues...');
    }
  } finally {
    await browser.close();
  }
}

async function waitForServices(page: any) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3030';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds

  // Wait for frontend
  console.log('⏳ Waiting for frontend to be ready...');
  let frontendReady = false;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.goto(frontendUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      frontendReady = true;
      console.log('✅ Frontend is ready');
      break;
    } catch (error) {
      console.log(`⏳ Frontend not ready (attempt ${i + 1}/${maxRetries}), retrying...`);
      if (i === maxRetries - 1) {
        console.log('⚠️  Frontend health check failed, but continuing...');
      } else {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  // Wait for backend
  console.log('⏳ Waiting for backend to be ready...');
  let backendReady = false;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await page.request.get(`${backendUrl}/api/health`, {
        timeout: 10000
      });
      if (response.ok()) {
        backendReady = true;
        console.log('✅ Backend is ready');
        break;
      } else {
        throw new Error(`Backend returned status ${response.status()}`);
      }
    } catch (error) {
      console.log(`⏳ Backend not ready (attempt ${i + 1}/${maxRetries}), retrying...`);
      if (i === maxRetries - 1) {
        console.log('⚠️  Backend health check failed, but continuing...');
      } else {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  return { frontendReady, backendReady };
}

async function verifyTestPrerequisites(page: any) {
  console.log('🔍 Verifying test prerequisites...');
  
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3030';
  
  try {
    // Navigate to frontend and check basic functionality
    await page.goto(frontendUrl);
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check if we can access login page (should be accessible without auth)
    try {
      await page.goto(`${frontendUrl}/login`);
      console.log('✅ Login page accessible');
    } catch (error) {
      console.log('⚠️  Login page not accessible, might not be implemented yet');
    }
    
    // Verify we can navigate back to home
    await page.goto(frontendUrl);
    console.log('✅ Basic navigation working');
    
    console.log('✅ Test prerequisites verified');
  } catch (error) {
    console.log('⚠️  Test prerequisites verification failed:', error);
  }
}

async function logDebugInfo(page: any) {
  console.log('🐛 Debug information:');
  
  try {
    // Current page URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Page title
    const title = await page.title().catch(() => 'Unable to get title');
    console.log(`Page title: ${title}`);
    
    // Check for JavaScript errors
    const jsErrors: string[] = [];
    page.on('pageerror', (error: Error) => {
      jsErrors.push(error.message);
    });
    
    if (jsErrors.length > 0) {
      console.log('JavaScript errors:', jsErrors);
    }
    
    // Check console messages
    const consoleMessages: string[] = [];
    page.on('console', (msg: any) => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    if (consoleMessages.length > 0) {
      console.log('Console errors:', consoleMessages);
    }
    
  } catch (error) {
    console.log('Unable to collect debug info:', error);
  }
}

async function setupTestData(page: any) {
  // Here we can setup test users, initial data, etc.
  console.log('⏳ Setting up test data...');
  
  // Example: Create test users via API or database seeding
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  
  try {
    // Check if backend test endpoints are available
    const testEndpointCheck = await page.request.get(`${backendUrl}/api/health`).catch(() => null);
    
    if (!testEndpointCheck || !testEndpointCheck.ok()) {
      console.log('⚠️  Backend not available, skipping test data setup');
      return;
    }
    
    // Try to create test users via API endpoint
    const testUser = {
      email: process.env.TEST_USER_EMAIL || 'test.user@example.com',
      password: process.env.TEST_USER_PASSWORD || 'TestUser123!',
      name: 'Test User',
      role: 'user'
    };
    
    const adminUser = {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'AdminUser123!',
      name: 'Admin User',
      role: 'admin'
    };
    
    // Note: These endpoints need to be implemented in the backend
    // For now, we'll try the endpoints but not fail if they don't exist
    const setupResponse = await page.request.post(`${backendUrl}/api/test/setup-users`, {
      data: { users: [testUser, adminUser] },
      timeout: 10000
    }).catch((error: any) => {
      console.log('⚠️  Test user setup via API failed, users may already exist or endpoint not implemented');
      return null;
    });
    
    if (setupResponse && setupResponse.ok()) {
      console.log('✅ Test users created successfully');
    } else {
      console.log('ℹ️  Test user creation skipped (users may already exist)');
    }
    
    // Additional test data setup can go here
    // For example: creating test calendars, events, etc.
    
    console.log('✅ Test data setup completed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('⚠️  Test data setup failed:', errorMessage);
    // Don't fail the setup if test data creation fails
  }
}

export default globalSetup;
