// src/index.ts - Main exports for E2E testing utilities

// Page Objects
export { BasePage } from './pages/BasePage';
export { LoginPage } from './pages/LoginPage';
export { DashboardPage } from './pages/DashboardPage';
export { CalendarPage } from './pages/CalendarPage';

// Utilities
export { AuthHelper } from './utils/auth-helper';
export { TestDataHelper } from './utils/test-data';

// Types
export type { TestUser, TestEvent } from './utils/test-data';
