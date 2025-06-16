// src/pages/BasePage.ts
import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:3030';
  }

  // Common navigation methods
  async navigate(path: string = '') {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForSelector(selector: string, options?: { timeout?: number }) {
    await this.page.waitForSelector(selector, options);
  }

  // Common UI interactions
  async clickButton(text: string) {
    await this.page.getByRole('button', { name: text }).click();
  }

  async fillInput(placeholder: string, value: string) {
    await this.page.getByPlaceholder(placeholder).fill(value);
  }

  async fillInputByLabel(label: string, value: string) {
    await this.page.getByLabel(label).fill(value);
  }

  // Utility methods
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  // Loading and error states
  async waitForLoadingToComplete() {
    // Wait for common loading indicators to disappear
    await this.page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('[data-testid="loading"], .loading, .spinner');
      return loadingElements.length === 0;
    }, { timeout: 10000 }).catch(() => {
      // Ignore timeout, loading indicators might not be present
    });
  }

  async checkForErrors() {
    // Check for common error indicators
    const errorElements = await this.page.locator('[data-testid="error"], .error, .alert-error').count();
    return errorElements > 0;
  }
}
