// global-teardown.ts
import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting UniCal E2E test global teardown...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Clean up test data
    await cleanupTestData(page);
    
    // Clear any persistent state
    await clearPersistentState(page);
    
    // Generate test summary if available
    await generateTestSummary();
    
    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Global teardown failed:', errorMessage);
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await browser.close();
  }
}

async function generateTestSummary() {
  console.log('📊 Generating test summary...');
  
  try {
    // Check if test results exist
    const fs = require('fs');
    const path = require('path');
    
    const testResultsPath = path.join(__dirname, 'test-results');
    const reportPath = path.join(__dirname, 'playwright-report');
    
    if (fs.existsSync(testResultsPath)) {
      const files = fs.readdirSync(testResultsPath);
      console.log(`📁 Test artifacts created: ${files.length} files`);
    }
    
    if (fs.existsSync(reportPath)) {
      console.log('📋 HTML report generated at: playwright-report/index.html');
    }
    
    // Log environment info for debugging
    console.log('🔧 Test environment:');
    console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3030'}`);
    console.log(`   Backend URL: ${process.env.BACKEND_URL || 'http://localhost:3000'}`);
    console.log(`   CI Mode: ${process.env.CI || 'false'}`);
    console.log(`   Node Version: ${process.version}`);
    
  } catch (error) {
    console.log('⚠️  Could not generate test summary');
  }
}

async function cleanupTestData(page: any) {
  console.log('⏳ Cleaning up test data...');
  
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  
  try {
    // Check if backend is available for cleanup
    const healthCheck = await page.request.get(`${backendUrl}/api/health`).catch(() => null);
    
    if (!healthCheck || !healthCheck.ok()) {
      console.log('⚠️  Backend not available, skipping test data cleanup');
      return;
    }
    
    // Clean up test users and associated data
    const cleanupResponse = await page.request.delete(`${backendUrl}/api/test/cleanup`, {
      timeout: 10000
    }).catch((error: any) => {
      console.log('⚠️  Test data cleanup via API failed or endpoint not implemented');
      return null;
    });
    
    if (cleanupResponse && cleanupResponse.ok()) {
      console.log('✅ Test data cleaned up successfully');
    } else {
      console.log('ℹ️  Test data cleanup skipped (endpoint may not be implemented)');
    }
    
    // Additional cleanup for specific test artifacts
    // For example: removing test events, calendar connections, etc.
    
    console.log('✅ Test data cleanup completed');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('⚠️  Test data cleanup failed:', errorMessage);
  }
}

async function clearPersistentState(page: any) {
  console.log('⏳ Clearing persistent state...');
  
  try {
    // Clear localStorage, sessionStorage, cookies, etc.
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3030';
    
    // Try to navigate to frontend for cleanup
    try {
      await page.goto(frontendUrl, { timeout: 10000 });
      
      // Clear browser storage
      await page.evaluate(() => {
        // Clear local storage
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
        
        // Clear session storage
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }
        
        // Clear any IndexedDB data (common in modern apps)
        if (typeof indexedDB !== 'undefined') {
          indexedDB.databases?.().then(databases => {
            databases.forEach(db => {
              if (db.name) {
                indexedDB.deleteDatabase(db.name);
              }
            });
          }).catch(() => {
            // Ignore errors in IndexedDB cleanup
          });
        }
      });
      
      console.log('✅ Browser storage cleared');
    } catch (error) {
      console.log('⚠️  Could not access frontend for storage cleanup');
    }
    
    // Clear cookies for both frontend and backend domains
    const context = page.context();
    await context.clearCookies();
    
    // Clear any permissions that might have been granted during tests
    await context.clearPermissions();
    
    console.log('✅ Persistent state cleared');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('⚠️  Clearing persistent state failed:', errorMessage);
  }
}

export default globalTeardown;
