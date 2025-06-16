// src/utils/test-data.ts
export interface TestUser {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
}

export interface TestEvent {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  location?: string;
  calendar?: string;
}

export class TestDataHelper {
  static getTestUser(role: 'user' | 'admin' = 'user'): TestUser {
    if (role === 'admin') {
      return {
        email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
        password: process.env.TEST_ADMIN_PASSWORD || 'AdminUser123!',
        name: 'Admin User',
        role: 'admin'
      };
    }
    
    return {
      email: process.env.TEST_USER_EMAIL || 'test.user@example.com',
      password: process.env.TEST_USER_PASSWORD || 'TestUser123!',
      name: 'Test User',
      role: 'user'
    };
  }

  static generateTestEvent(overrides: Partial<TestEvent> = {}): TestEvent {
    const now = new Date();
    const startDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    return {
      title: `Test Event ${Date.now()}`,
      description: 'This is a test event created by E2E tests',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      allDay: false,
      location: 'Test Location',
      calendar: 'primary',
      ...overrides
    };
  }

  static generateRecurringEvent(overrides: Partial<TestEvent> = {}): TestEvent {
    return this.generateTestEvent({
      title: `Recurring Test Event ${Date.now()}`,
      description: 'This is a recurring test event',
      ...overrides
    });
  }

  static generateAllDayEvent(overrides: Partial<TestEvent> = {}): TestEvent {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.generateTestEvent({
      title: `All Day Event ${Date.now()}`,
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
      allDay: true,
      ...overrides
    });
  }

  static getRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `test.${timestamp}.${random}@example.com`;
  }

  static getRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
