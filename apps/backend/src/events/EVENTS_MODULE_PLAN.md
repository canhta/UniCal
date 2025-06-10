# Events Plan

This plan outlines the development tasks for the Events module.

## Phase 1: Setup & Core Infrastructure
- [ ] TODO: Define `CalendarEvent` schema in `schema.prisma` (e.g., `id`, `userId`, `connectedAccountId`, `platformEventId` (unique per platform account), `title`, `description`, `startTime`, `endTime`, `isAllDay`, `location`, `sourcePlatform`, `privacy` (e.g., public, private), `recurrenceRule` (string, e.g., RRULE), `nativeReminderInfo` (JSON or structured), `lastSyncedFromPlatformAt`).
- [ ] TODO: Create `EventsService` and `EventsController`.
- [ ] TODO: Define DTOs for event management (e.g., `CreateEventDto`, `UpdateEventDto`, `EventResponseDto`, `EventQueryDto`) with validation. Include fields for FRD 3.4.1.
- [ ] TODO: Ensure `EventsService` can use `PrismaService` and services from `CalendarsModule` and `AccountsModule`.

## Phase 2: Staged Feature Implementation

### Core Scheduling Functionalities (Unified View & Event Management)
- [ ] TODO: `EventsService.createEvent()`:
    - Validate input DTO (FRD 3.4.1).
    - Determine target native calendar via `AccountsService` (user must select one of their connected native calendars).
    - Call appropriate service in `CalendarsModule` (e.g., `GoogleCalendarService.createEvent()`).
    - Store UniCal's representation of the event in Prisma, linking to `ConnectedAccount` and `User`.
- [ ] TODO: `EventsService.getEventsForUser()`:
    - Fetch events from Prisma (which are populated by `SyncModule`).
    - Implement filtering by date range, connected accounts, etc. (FRD 3.3.1).
    - Transform into `EventResponseDto`, ensuring privacy indication (FRD 3.7.1) and reminder display info (FRD 3.9.1) are included.
    - Handle visual differentiation data if needed by frontend (FRD 3.3.2).
- [ ] TODO: `EventsService.getEventById()`: Fetch a single event from Prisma (FRD 3.4.2, FRD 3.3.4).
- [ ] TODO: `EventsService.updateEvent()`:
    - Validate input DTO.
    - Call appropriate service in `CalendarsModule` to update the event on the native platform (FRD 3.4.3).
    - Update UniCal's representation in Prisma.
- [ ] TODO: `EventsService.deleteEvent()`:
    - Call appropriate service in `CalendarsModule` to delete the event on the native platform (FRD 3.4.4).
    - Delete/mark as deleted in UniCal's representation in Prisma.
- [ ] TODO: `EventsController`: Implement CRUD endpoints for events.
- [ ] TODO: Ensure time zone handling: store in UTC, assume local input from user, display in local (FRD 3.3.5).
- [ ] TODO: Basic recurrence display: ensure `EventResponseDto` can represent recurring events read from platform (FRD 3.4.5). Actual instance generation might be frontend or a more advanced backend task.

## Phase 3: System Challenges & Hardening
- [ ] TODO: Refine event aggregation logic for performance if fetching directly from platforms; primarily rely on synced Prisma data.
- [ ] TODO: Handle potential data inconsistencies between UniCal store and platforms (conflict resolution is `SyncModule`'s job, but `EventsService` might need to reflect this).
- [ ] TODO: Advanced recurrence: single instance modification sync (FRD 3.4.5) - ensure `UpdateEventDto` can signal this and `CalendarsModule` services can handle it.

## Phase 4: Integration & Refinement
- [ ] TODO: Write comprehensive unit tests for `EventsService`.
- [ ] TODO: Write integration tests for event CRUD operations and data aggregation/retrieval.
- [ ] TODO: Ensure Swagger documentation is complete and accurate for all `EventsController` endpoints and DTOs.
