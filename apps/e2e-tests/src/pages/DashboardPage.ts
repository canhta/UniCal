// src/pages/DashboardPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  private userMenu: Locator;
  private calendarWidget: Locator;
  private upcomingEvents: Locator;
  private connectCalendarButton: Locator;
  private profileLink: Locator;
  private settingsLink: Locator;
  private logoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.userMenu = page.getByTestId('user-menu');
    this.calendarWidget = page.getByTestId('calendar-widget');
    this.upcomingEvents = page.getByTestId('upcoming-events');
    this.connectCalendarButton = page.getByRole('button', { name: 'Connect Calendar' });
    this.profileLink = page.getByRole('link', { name: 'Profile' });
    this.settingsLink = page.getByRole('link', { name: 'Settings' });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
  }

  async goto() {
    await this.navigate('/dashboard');
    await this.waitForPageLoad();
  }

  async isUserLoggedIn(): Promise<boolean> {
    return await this.userMenu.isVisible();
  }

  async openUserMenu() {
    await this.userMenu.click();
  }

  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
    await this.page.waitForURL('**/login');
  }

  async goToProfile() {
    await this.openUserMenu();
    await this.profileLink.click();
  }

  async goToSettings() {
    await this.openUserMenu();
    await this.settingsLink.click();
  }

  async connectCalendar() {
    await this.connectCalendarButton.click();
  }

  async getUpcomingEventsCount(): Promise<number> {
    const events = await this.upcomingEvents.locator('.event-item').count();
    return events;
  }

  async isCalendarWidgetVisible(): Promise<boolean> {
    return await this.calendarWidget.isVisible();
  }

  async isDashboardLoaded(): Promise<boolean> {
    // Check if essential dashboard elements are loaded
    await this.waitForLoadingToComplete();
    return await this.calendarWidget.isVisible() && 
           await this.upcomingEvents.isVisible();
  }
}
