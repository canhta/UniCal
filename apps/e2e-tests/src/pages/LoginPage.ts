// src/pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  private emailInput: Locator;
  private passwordInput: Locator;
  private loginButton: Locator;
  private googleSignInButton: Locator;
  private microsoftSignInButton: Locator;
  private errorMessage: Locator;
  private forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Sign In' });
    this.googleSignInButton = page.getByRole('button', { name: /sign in with google/i });
    this.microsoftSignInButton = page.getByRole('button', { name: /sign in with microsoft/i });
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot Password?' });
  }

  async goto() {
    await this.navigate('/login');
    await this.waitForPageLoad();
  }

  async loginWithCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    // Wait for navigation or error
    await Promise.race([
      this.page.waitForURL('**/dashboard', { timeout: 10000 }),
      this.errorMessage.waitFor({ timeout: 5000 })
    ]);
  }

  async loginWithGoogle() {
    await this.googleSignInButton.click();
    // Note: In real tests, you might want to mock this or use a test account
    // For now, we'll just verify the button click initiates the flow
  }

  async loginWithMicrosoft() {
    await this.microsoftSignInButton.click();
    // Note: In real tests, you might want to mock this or use a test account
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor();
    return await this.errorMessage.textContent() || '';
  }

  async isLoginFormVisible(): Promise<boolean> {
    return await this.emailInput.isVisible() && 
           await this.passwordInput.isVisible() && 
           await this.loginButton.isVisible();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  // Helper method for test user login
  async loginAsTestUser() {
    const email = process.env.TEST_USER_EMAIL || 'test.user@example.com';
    const password = process.env.TEST_USER_PASSWORD || 'TestUser123!';
    await this.loginWithCredentials(email, password);
  }

  async loginAsAdmin() {
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.TEST_ADMIN_PASSWORD || 'AdminUser123!';
    await this.loginWithCredentials(email, password);
  }
}
