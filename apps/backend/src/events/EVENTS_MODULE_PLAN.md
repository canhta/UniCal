# Events Plan

This plan outlines the development tasks for the Events module.

## Phase 1: Setup & Core Infrastructure
- [ ] TODO: Define `CalendarEvent` schema in `schema.prisma` (e.g., `id`, `userId`, `connectedAccountId`, `nativeCalendarId` (ID of the calendar on the source platform), `platformEventId` (unique per platform account for the event itself), `title`, `description`, `startTime`, `endTime`, `isAllDay`, `location`, `sourcePlatform`, `privacy` (e.g., public, private), `recurrenceRule` (string, e.g., RRULE), `nativeReminderInfo` (JSON or structured), `lastSyncedFromPlatformAt`).
- [ ] TODO: Create `EventsService` and `EventsController`.
- [ ] TODO: Define DTOs for event management (e.g., `CreateEventDto`, `UpdateEventDto`, `EventResponseDto`, `EventQueryDto`) with validation. Include fields for FRD 3.4.1.
- [ ] TODO: Ensure `EventsService` can use `PrismaService` and services from `CalendarsModule` and `AccountsModule`.

## Phase 2: Staged Feature Implementation

### Core Scheduling Functionalities (Unified View & Event Management)
- [ ] TODO: `EventsService.createEvent()`:
    - Validate input DTO (FRD 3.4.1).
    - Determine target native calendar. The frontend will provide the `nativeCalendarId` of the target calendar, selected by the user from a list provided by `CalendarsModule`'s `/calendars/targetable` endpoint.
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

## 3. Data Models

*   **Event:** Represents an event within UCS, aggregated from native calendars.
    *   `ucsEventId` (Primary Key, UUID)
    *   `nativeEventId` (String, ID from the source platform)
    *   `nativeCalendarId` (String, ID of the source native calendar)
    *   `userId` (Foreign Key to User table)
    *   `title` (String)
    *   `description` (String, plain text)
    *   `startTime` (DateTime, ISO 8601 in UTC)
    *   `endTime` (DateTime, ISO 8601 in UTC)
    *   `isAllDay` (Boolean)
    *   `location` (String, plain text)
    *   `nativePrivacySetting` (String, e.g., 'public', 'private', 'confidential' - as per source)
    *   `nativeColorId` (String, optional, from source)
    *   `nativeOrganizer` (JSON, optional, { email, name } from source)
    *   `nativeAttendees` (JSON array, optional, [{ email, name, status }, ...] from source)
    *   `recurrenceRule` (String, optional, e.g., iCalendar RRULE string)
    *   `recurringEventId` (String, optional, ID of the master recurring event if this is an instance/exception)
    *   `isException` (Boolean, true if this instance is an exception to a recurring series)
    *   `exceptionOriginalStartTime` (DateTime, optional, ISO 8601 in UTC, if `isException` is true, this is the original start time of the instance that was modified/deleted)
    *   `createdAt` (DateTime)
    *   `updatedAt` (DateTime)
    *   `lastSyncedAt` (DateTime)
    *   `sourcePlatform` (String, e.g., 'google', 'microsoft')

## 5. Sync Logic Details

*   **Recurrence Handling:**
    *   **Reading:** When fetching events from native platforms, if an event is recurring, its recurrence rule (e.g., RRULE) will be fetched and stored in `recurrenceRule`.
    *   **Expanding for API:** When the `GET /events` endpoint is called, the backend will need to expand recurring events within the requested time range. This means calculating all occurrences of a recurring event that fall between `start_date` and `end_date`.
        *   Individual occurrences will be returned as separate event objects, but can share a common `recurringEventId` (pointing to a conceptual master or the first instance's ID).
        *   Exceptions (single instances of a recurring event that have been modified or deleted) must be correctly handled. If an instance is modified, it becomes an exception. If deleted, it should not appear in the expanded list.
    *   **Storing Exceptions:** If a single instance of a recurring event is modified via UCS, this modification will be sent to the native platform. The native platform typically handles this by creating an exception. UCS will store this modified instance as a separate event record with `isException` set to true, `recurringEventId` linking to the master series, and `exceptionOriginalStartTime` indicating the original time of the instance that was changed. The original `recurrenceRule` remains on the master event.
    *   **Deleting Single Instance:** If a single instance is deleted via UCS, this is also an exception. The native platform is instructed to delete that instance. UCS might mark this instance as deleted or simply not return it during expansion.
    *   **Updating Series:** Modifying the entire series (e.g., changing the RRULE) is complex and might be deferred post-initial product, as per FRD's focus on "single instance modification."
