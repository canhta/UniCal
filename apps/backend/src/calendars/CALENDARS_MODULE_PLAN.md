# Calendars Plan

This plan outlines the development tasks for the Calendars module.

## Phase 1: Setup & Core Infrastructure
- [ ] TODO: Define `ICalendarPlatformService` interface (methods for connect, list calendars, fetch events, CRUD events, handle webhooks).
- [ ] TODO: Create `GoogleCalendarService` implementing `ICalendarPlatformService`.
- [ ] TODO: Create `MicrosoftCalendarService` implementing `ICalendarPlatformService`.
- [ ] TODO: Define DTOs for calendar and event data from platforms (e.g., `PlatformCalendarDto`, `PlatformEventDto`).
- [ ] TODO: Setup basic module structure for `CalendarsModule` (module, service, controller if any direct exposure).

## Phase 2: Staged Feature Implementation

### SSO Auth Aspects & Initial Connectivity (Links to AuthModule & AccountsModule)
- [ ] TODO: Implement OAuth client logic for Google (obtaining tokens - FRD 3.2.1) - **(Clarify: This module focuses on *using* tokens provided by `AccountsModule` to interact with Google Calendar APIs. Token acquisition and management are primarily `AccountsModule` and `AuthModule` responsibilities.)**
- [ ] TODO: Implement OAuth client logic for Microsoft (obtaining tokens - FRD 3.2.2) - **(Clarify: Similar to Google, this module uses tokens managed by `AccountsModule` for Microsoft Graph API calls.)**

### Core Scheduling Functionalities (Unified View & Event Management)
- [ ] TODO: `GoogleCalendarService`: Implement `listNativeCalendars()` (FRD 3.2.1, FRD 3.5.4).
- [ ] TODO: `MicrosoftCalendarService`: Implement `listNativeCalendars()` (FRD 3.2.2, FRD 3.5.4).
- [ ] TODO: `GoogleCalendarService`: Implement `fetchEvents()` (FRD 3.3.1, FRD 3.4.2). **(Consider adding a sub-task for platform-specific data mapping to UniCal's internal event model for deep synchronization needs).**
- [ ] TODO: `MicrosoftCalendarService`: Implement `fetchEvents()` (FRD 3.3.1, FRD 3.4.2). **(Consider adding a sub-task for platform-specific data mapping here as well).**
- [ ] TODO: `GoogleCalendarService`: Implement `createEvent()` (FRD 3.4.1).
- [ ] TODO: `MicrosoftCalendarService`: Implement `createEvent()` (FRD 3.4.1).
- [ ] TODO: `GoogleCalendarService`: Implement `updateEvent()` (FRD 3.4.3).
- [ ] TODO: `MicrosoftCalendarService`: Implement `updateEvent()` (FRD 3.4.3).
- [ ] TODO: `GoogleCalendarService`: Implement `deleteEvent()` (FRD 3.4.4).
- [ ] TODO: `MicrosoftCalendarService`: Implement `deleteEvent()` (FRD 3.4.4).
- [ ] TODO: Handle basic recurrence reading (FRD 3.4.5) in `fetchEvents`.
- [ ] TODO: Handle privacy flag reading (FRD 3.7.1) in `fetchEvents`.
- [ ] TODO: Handle reminder info reading (FRD 3.9.1) in `fetchEvents`.
- [ ] TODO: Implement webhook registration/handling logic for Google (part of `ICalendarPlatformService`). **(Ensure webhook secrets are configurable via `ConfigService` and stored in `.env`).**
- [ ] TODO: Implement webhook registration/handling logic for Microsoft (part of `ICalendarPlatformService`). **(Ensure webhook secrets are configurable via `ConfigService` and stored in `.env`).**

## Phase 3: System Challenges & Hardening
- [ ] TODO: Implement robust error handling for API calls to Google/Microsoft.
- [ ] TODO: Implement retry mechanisms for platform API calls.
- [ ] TODO: Ensure proper handling of API rate limits from Google/Microsoft.
- [ ] TODO: Refine time zone handling for event data from platforms (ensure UTC conversion and storage).
- [ ] TODO: Advanced recurrence: instance modification/exceptions (FRD 3.4.5).

## Phase 4: Integration & Refinement
- [ ] TODO: Write comprehensive unit tests for `GoogleCalendarService` and `MicrosoftCalendarService`.
- [ ] TODO: Write integration tests for platform interactions (mocking external APIs).
- [ ] TODO: Ensure Swagger documentation for any exposed DTOs/endpoints is accurate.
