import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage } from '../../src';

test.describe('Basic Authentication', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('successful login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await loginPage.goto();
    
    // Verify login page is loaded
    await expect(page).toHaveTitle(/Login/);
    
    // Login with valid credentials
    await loginPage.loginWithCredentials(
      process.env.TEST_USER_EMAIL || 'test.user@example.com',
      process.env.TEST_USER_PASSWORD || 'TestUser123!'
    );
    
    // Verify successful login and redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    // Verify user is authenticated
    await expect(await dashboardPage.isUserLoggedIn()).toBe(true);
  });

  test('failed login with invalid credentials', async ({ page }) => {
    await loginPage.goto();
    
    // Attempt login with invalid credentials
    await loginPage.loginWithCredentials('invalid@example.com', 'wrongpassword');
    
    // Verify error message is displayed
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
    
    // Verify user remains on login page
    await expect(page).toHaveURL(/login/);
  });

  test('session persistence across page refresh', async ({ page }) => {
    // Login first
    await loginPage.goto();
    await loginPage.loginWithCredentials(
      process.env.TEST_USER_EMAIL || 'test.user@example.com',
      process.env.TEST_USER_PASSWORD || 'TestUser123!'
    );
    
    // Verify we're on dashboard
    await expect(page).toHaveURL(/dashboard/);
    
    // Refresh the page
    await page.reload();
    
    // Verify session persists and user is still on dashboard
    await expect(page).toHaveURL(/dashboard/);
    await expect(await dashboardPage.isUserLoggedIn()).toBe(true);
  });

  test('logout functionality', async ({ page }) => {
    // Login first
    await loginPage.goto();
    await loginPage.loginWithCredentials(
      process.env.TEST_USER_EMAIL || 'test.user@example.com',
      process.env.TEST_USER_PASSWORD || 'TestUser123!'
    );
    
    // Verify we're logged in
    await expect(page).toHaveURL(/dashboard/);
    
    // Logout
    await dashboardPage.logout();
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/login/);
    
    // Verify cannot access dashboard directly
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('session expires after timeout', async ({ page }) => {
    // Skip this test as it requires backend session timeout configuration
    test.skip();
  });

  test('account lockout after multiple failed attempts', async ({ page }) => {
    await loginPage.goto();
    
    const invalidEmail = 'test@example.com';
    const invalidPassword = 'wrongpassword';
    
    // Attempt login multiple times with invalid credentials
    for (let i = 0; i < 5; i++) {
      await loginPage.loginWithCredentials(invalidEmail, invalidPassword);
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toBeTruthy();
    }
    
    // Verify account lockout message appears
    await loginPage.loginWithCredentials(invalidEmail, invalidPassword);
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Account locked');
  });

  test('empty credentials validation', async ({ page }) => {
    await loginPage.goto();
    
    // Verify login form is visible
    await expect(await loginPage.isLoginFormVisible()).toBe(true);
    
    // Try to submit form with empty fields by clicking the login button
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Verify validation messages appear (these would be browser native validation or custom validation)
    // For now, we'll check that we remain on the login page
    await expect(page).toHaveURL(/login/);
  });

  test('invalid email format validation', async ({ page }) => {
    await loginPage.goto();
    
    // Enter invalid email format using the direct page interaction
    await page.getByPlaceholder('Email').fill('invalid-email-format');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Verify we remain on login page due to validation
    await expect(page).toHaveURL(/login/);
  });
});
