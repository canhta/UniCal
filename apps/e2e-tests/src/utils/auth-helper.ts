// src/utils/auth-helper.ts
import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

export class AuthHelper {
  private page: Page;
  private loginPage: LoginPage;

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
  }

  async loginAsUser(userType: 'user' | 'admin' = 'user') {
    await this.loginPage.goto();
    
    if (userType === 'admin') {
      await this.loginPage.loginAsAdmin();
    } else {
      await this.loginPage.loginAsTestUser();
    }

    // Verify login was successful
    await this.page.waitForURL('**/dashboard', { timeout: 15000 });
  }

  async logout() {
    // Try to logout from any page by looking for the user menu
    const userMenu = this.page.getByTestId('user-menu');
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await this.page.getByRole('button', { name: 'Logout' }).click();
      await this.page.waitForURL('**/login');
    }
  }

  async isLoggedIn(): Promise<boolean> {
    // Check if user is logged in by looking for user menu or checking URL
    const userMenu = this.page.getByTestId('user-menu');
    const isOnProtectedRoute = !this.page.url().includes('/login');
    return (await userMenu.isVisible()) && isOnProtectedRoute;
  }

  async ensureLoggedIn(userType: 'user' | 'admin' = 'user') {
    if (!(await this.isLoggedIn())) {
      await this.loginAsUser(userType);
    }
  }

  async ensureLoggedOut() {
    if (await this.isLoggedIn()) {
      await this.logout();
    }
  }
}
