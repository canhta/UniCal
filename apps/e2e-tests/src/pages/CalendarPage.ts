// src/pages/CalendarPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CalendarPage extends BasePage {
  private calendarContainer: Locator;
  private dayViewButton: Locator;
  private weekViewButton: Locator;
  private monthViewButton: Locator;
  private todayButton: Locator;
  private previousButton: Locator;
  private nextButton: Locator;
  private newEventButton: Locator;
  private calendarFilterDropdown: Locator;
  private eventItems: Locator;

  constructor(page: Page) {
    super(page);
    this.calendarContainer = page.getByTestId('calendar-container');
    this.dayViewButton = page.getByRole('button', { name: 'Day' });
    this.weekViewButton = page.getByRole('button', { name: 'Week' });
    this.monthViewButton = page.getByRole('button', { name: 'Month' });
    this.todayButton = page.getByRole('button', { name: 'Today' });
    this.previousButton = page.getByRole('button', { name: 'Previous' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.newEventButton = page.getByRole('button', { name: 'New Event' });
    this.calendarFilterDropdown = page.getByTestId('calendar-filter');
    this.eventItems = page.locator('.calendar-event');
  }

  async goto() {
    await this.navigate('/calendar');
    await this.waitForPageLoad();
    await this.waitForLoadingToComplete();
  }

  async switchToView(view: 'day' | 'week' | 'month') {
    switch (view) {
      case 'day':
        await this.dayViewButton.click();
        break;
      case 'week':
        await this.weekViewButton.click();
        break;
      case 'month':
        await this.monthViewButton.click();
        break;
    }
    await this.waitForLoadingToComplete();
  }

  async navigateToToday() {
    await this.todayButton.click();
    await this.waitForLoadingToComplete();
  }

  async navigatePrevious() {
    await this.previousButton.click();
    await this.waitForLoadingToComplete();
  }

  async navigateNext() {
    await this.nextButton.click();
    await this.waitForLoadingToComplete();
  }

  async createNewEvent() {
    await this.newEventButton.click();
    // This should open the event creation modal/page
  }

  async getEventsCount(): Promise<number> {
    await this.waitForLoadingToComplete();
    return await this.eventItems.count();
  }

  async clickEvent(eventTitle: string) {
    const event = this.page.locator('.calendar-event', { hasText: eventTitle }).first();
    await event.click();
  }

  async toggleCalendarFilter(calendarName: string) {
    await this.calendarFilterDropdown.click();
    const filterOption = this.page.getByRole('checkbox', { name: calendarName });
    await filterOption.click();
    await this.waitForLoadingToComplete();
  }

  async isCalendarLoaded(): Promise<boolean> {
    return await this.calendarContainer.isVisible();
  }

  async getCurrentViewType(): Promise<string> {
    // Determine current view by checking which button is active
    if (await this.dayViewButton.getAttribute('aria-pressed') === 'true') return 'day';
    if (await this.weekViewButton.getAttribute('aria-pressed') === 'true') return 'week';
    if (await this.monthViewButton.getAttribute('aria-pressed') === 'true') return 'month';
    return 'unknown';
  }

  async getVisibleEventTitles(): Promise<string[]> {
    await this.waitForLoadingToComplete();
    const eventTitles = await this.eventItems.locator('.event-title').allTextContents();
    return eventTitles;
  }
}
