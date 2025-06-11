# Events Module Plan (Backend)

**Overall Goal:** Manage calendar events within UniCal, including creating, reading, updating, and deleting (CRUD) events, and handling their synchronization with external calendar platforms. This module is central to the user's calendar experience.

**Alignment:** This plan primarily aligns with Backend AGENT_PLAN Phase 3 (Core Features - Calendar Sync & Integrations) and Phase 4 (Advanced Features - Event Management).

## 1. Prisma Schema (`prisma/schema.prisma`)
*Goal: Define the database structure for storing UniCal's representation of calendar events, linked to users and their connected accounts.*

*   [ ] **Define `CalendarEvent` Model:**
    *   `id` (String, PK, `@default(uuid())`)
    *   `userId` (String) - Foreign Key to `User` model.
    *   `user` (User, `@relation(fields: [userId], references: [id], onDelete: Cascade)`)
    *   `connectedAccountId` (String) - Foreign Key to `ConnectedAccount` model.
    *   `connectedAccount` (ConnectedAccount, `@relation(fields: [connectedAccountId], references: [id], onDelete: Cascade)`)
    *   `nativeCalendarId` (String) - ID of the calendar on the source platform (e.g., Google Calendar ID).
    *   `platformEventId` (String) - Unique ID of the event on the source platform for this specific account.
    *   `title` (String)
    *   `description` (String?, `@db.Text`)
    *   `startTime` (DateTime) - Stored in UTC.
    *   `endTime` (DateTime) - Stored in UTC.
    *   `isAllDay` (Boolean, `@default(false)`)
    *   `timeZone` (String?) - Original timezone of the event from the provider, if available. Primarily for display or round-tripping.
    *   `location` (String?)
    *   `sourcePlatform` (String) - e.g., "GOOGLE", "OUTLOOK_CALENDAR". Matches `ConnectedAccount.provider`.
    *   `privacy` (String?, e.g., "public", "private", "confidential")
    *   `colorId` (String?, platform-specific)
    *   `organizer` (Json?) - e.g., `{ email, name, self }`
    *   `attendees` (Json?) - e.g., `[{ email, name, status, self }, ...]`
    *   `recurrenceRule` (String[]?) - Array of iCalendar RRULE/EXDATE/RDATE strings.
    *   `recurringEventId` (String?) - If this is an instance of a recurring series, this is the `platformEventId` of the master recurring event.
    *   `isException` (Boolean, `@default(false)`) - True if this instance is an exception to a recurring series.
    *   `exceptionOriginalStartTime` (DateTime?) - If `isException` is true, this is the original start time of the instance that was modified/deleted (in UTC).
    *   `platformLastModifiedAt` (DateTime) - Timestamp of when the event was last modified on the source platform (UTC).
    *   `lastSyncedFromPlatformAt` (DateTime) - Timestamp of when UniCal last synced this event from the platform.
    *   `createdAt` (DateTime, `@default(now())`)
    *   `updatedAt` (DateTime, `@updatedAt`) - UniCal's internal last modification timestamp.

    *   `@@unique([connectedAccountId, platformEventId])` - Ensures unique event per account.
    *   `@@index([userId, startTime, endTime])`
    *   `@@index([connectedAccountId])`
    *   `@@index([platformEventId])`
    *   `@@index([recurringEventId])`

## 2. DTOs (Data Transfer Objects)
*Goal: Define data structures for API requests/responses and internal service communication, ensuring clear contracts.*

*   [ ] **`EventResponseDto.ts`:**
    *   `id`, `userId`, `connectedAccountId`, `nativeCalendarId`, `platformEventId`, `title`, `description`, `startTime` (ISO String), `endTime` (ISO String), `isAllDay`, `timeZone`, `location`, `sourcePlatform`, `privacy`, `colorId`, `organizer`, `attendees`, `recurrenceRule`, `recurringEventId`, `isException`, `exceptionOriginalStartTime`, `createdAt` (ISO String), `updatedAt` (ISO String).
*   [ ] **`CreateEventRequestDto.ts` (for API):**
    *   `connectedAccountId`: Target account for creation.
    *   `nativeCalendarId`: Target calendar on the provider.
    *   `title` (String, non-empty).
    *   `startTime` (DateTime ISO String).
    *   `endTime` (DateTime ISO String).
    *   `timeZone` (String, IANA, e.g., "America/New_York") - User's current timezone for interpreting `startTime`/`endTime`.
    *   `description` (String?, optional).
    *   `location` (String?, optional).
    *   `isAllDay` (Boolean, optional, default `false`).
    *   `attendees` (Array of emails/objects?, optional).
    *   `recurrenceRule` (String[]?, optional).
    *   Validation: `startTime` before `endTime`.
*   [ ] **`UpdateEventRequestDto.ts` (for API):**
    *   All fields from `CreateEventRequestDto` (except `connectedAccountId`, `nativeCalendarId`) as optional.
    *   `updateScope` (Enum: `SINGLE_INSTANCE`, `ALL_FOLLOWING`, `ENTIRE_SERIES`, default `SINGLE_INSTANCE`) - For recurring events.
    *   `instanceOriginalStartTime` (DateTime ISO String, required if `updateScope` is `SINGLE_INSTANCE` or `ALL_FOLLOWING` for an exception).
*   [ ] **`GetEventsQueryDto.ts` (for API):**
    *   `startDate` (DateTime ISO String).
    *   `endDate` (DateTime ISO String).
    *   `connectedAccountIds` (String[]?, optional).
    *   `nativeCalendarIds` (String[]?, optional).
    *   `timeZone` (String, IANA) - For expanding all-day events correctly if needed, and for interpreting date boundaries.
*   [ ] **`InternalCreateEventDto.ts` (for `SyncService` use):**
    *   All fields from `CalendarEvent` model that come from the platform.
    *   `userId`, `connectedAccountId`.
*   [ ] **`InternalUpdateEventDto.ts` (for `SyncService` use):**
    *   Subset of `CalendarEvent` fields that can be updated from platform.

## 3. Module Setup (`events.module.ts`)
*Goal: Configure the NestJS module for events.*

*   [ ] Create `EventsModule`.
*   [ ] Import `PrismaModule`.
*   [ ] Import `forwardRef(() => CalendarsModule)` (to break circular dependency if `CalendarsService` needs `EventsService`).
*   [ ] Import `forwardRef(() => SyncModule)` (if `SyncService` needs to be called from `EventsService`).
*   [ ] Declare and Export `EventsService`.
*   [ ] Declare `EventsController`.

## 4. Service Implementation (`events.service.ts`)
*Goal: Implement business logic for managing events, including interaction with external platforms via `CalendarsService` and conflict resolution via `SyncService`.*

*   [ ] Create `EventsService`, inject `PrismaService`, `CalendarsService`, `SyncService`.
*   [ ] **`createEventForUser(userId: string, dto: CreateEventRequestDto): Promise<EventResponseDto>`:**
    *   Convert `startTime`, `endTime` from `dto.timeZone` to UTC.
    *   Call `CalendarsService.createPlatformEvent(dto.connectedAccountId, dto.nativeCalendarId, platformEventData)` to create on provider.
    *   Use returned `platformEventId` and other details to create `CalendarEvent` in Prisma.
    *   Map to `EventResponseDto`.
*   [ ] **`getEventsForUser(userId: string, query: GetEventsQueryDto): Promise<EventResponseDto[]>`:**
    *   Fetch `CalendarEvent`s from Prisma based on `userId` and filters.
    *   **Recurrence Expansion:** For recurring events in range, generate instances using a library (e.g., `rrule.js`). Handle exceptions.
    *   Map to `EventResponseDto[]`.
*   [ ] **`getEventByIdForUser(userId: string, eventId: string): Promise<EventResponseDto | null>`:**
    *   Fetch `CalendarEvent` by `id` and `userId`. Map to `EventResponseDto`.
*   [ ] **`updateEventForUser(userId: string, eventId: string, dto: UpdateEventRequestDto): Promise<EventResponseDto>`:**
    *   Fetch existing `CalendarEvent`. Verify ownership.
    *   Convert `startTime`, `endTime` (if present) from `dto.timeZone` to UTC.
    *   Call `CalendarsService.updatePlatformEvent(...)` with appropriate parameters for recurring instances.
    *   Update `CalendarEvent` in Prisma with new details from platform response.
    *   Map to `EventResponseDto`.
*   [ ] **`deleteEventForUser(userId: string, eventId: string, deleteScope?: string, instanceOriginalStartTime?: string): Promise<void>`:**
    *   Fetch existing `CalendarEvent`. Verify ownership.
    *   Call `CalendarsService.deletePlatformEvent(...)`.
    *   Delete `CalendarEvent` from Prisma (or mark as deleted if it's an exception to a recurring series that still exists).
*   [ ] **`createOrUpdateEventFromPlatform(dto: InternalCreateEventDto): Promise<CalendarEvent>` (Called by `SyncService`):**
    *   Logic to find existing event by `connectedAccountId` and `platformEventId`.
    *   Conflict resolution: Compare `dto.platformLastModifiedAt` with existing `CalendarEvent.platformLastModifiedAt`.
    *   If new or platform is newer: Create or update Prisma `CalendarEvent`. Set `lastSyncedFromPlatformAt`.
    *   Return the saved `CalendarEvent`.
*   [ ] **`deleteEventFromPlatform(connectedAccountId: string, platformEventId: string): Promise<void>` (Called by `SyncService`):**
    *   Find and delete `CalendarEvent` by `connectedAccountId` and `platformEventId`.

## 5. Controller Implementation (`events.controller.ts`)
*Goal: Expose API endpoints for event management.*

*   [ ] Create `EventsController` (`@Controller('events')`, `@ApiTags('Events')`). Inject `EventsService`.
*   [ ] `POST /` (`createEvent`): `@UseGuards(AuthGuard)`, `userId` from `req.user`. Body: `CreateEventRequestDto`.
*   [ ] `GET /` (`getEvents`): `@UseGuards(AuthGuard)`, `userId` from `req.user`. Query: `GetEventsQueryDto`.
*   [ ] `GET /:id` (`getEventById`): `@UseGuards(AuthGuard)`, `userId` from `req.user`.
*   [ ] `PATCH /:id` (`updateEvent`): `@UseGuards(AuthGuard)`, `userId` from `req.user`. Body: `UpdateEventRequestDto`.
*   [ ] `DELETE /:id` (`deleteEvent`): `@UseGuards(AuthGuard)`, `userId` from `req.user`. Query params for `deleteScope`, `instanceOriginalStartTime`.
*   [ ] Add Swagger decorators for all endpoints and DTOs.

## 6. Recurrence Handling
*Goal: Robustly manage recurring events, including series, instances, and exceptions.*

*   [ ] **Library:** Use `rrule.js` (or similar) for parsing `RRULE` strings and generating occurrences.
*   [ ] **Storage:** Store `recurrenceRule` as an array of strings (RRULE, EXDATE, RDATE).
*   [ ] **Expansion:** `getEventsForUser` must expand recurring events within the query date range, applying exceptions.
*   [ ] **Updates/Deletions:** Handle `updateScope` and `deleteScope` correctly for single instances, future instances, or entire series, propagating to `CalendarsService`.
    *   Modifying/deleting a single instance of a recurring event often creates an "exception" on the platform. This should be reflected by creating a new `CalendarEvent` record with `isException=true`, `recurringEventId` pointing to the master, and `exceptionOriginalStartTime`. The master event's `recurrenceRule` might get an `EXDATE` added.
    *   `SyncService` needs to understand these platform representations.

## 7. Testing
*Goal: Ensure reliability and correctness of event management logic.*

*   [ ] **Unit Tests (`EventsService`):**
    *   Mock `PrismaService`, `CalendarsService`, `SyncService`.
    *   Test CRUD operations, UTC conversions, recurrence expansion logic, conflict resolution calls.
*   [ ] **Integration Tests (`EventsController`):**
    *   Mock auth. Test API endpoints, DTO validation, interaction with mocked `EventsService`.

## 8. Dependencies & Libraries
*   `@nestjs/swagger`, `class-validator`, `class-transformer`
*   `rrule` (e.g., `npm install rrule`)
*   `date-fns` or `date-fns-tz` (for reliable date/time/timezone manipulation)

## Notes & Considerations:
*   **Time Zones:** Store all `startTime`/`endTime` in UTC. `CreateEventRequestDto` and `UpdateEventRequestDto` should accept a `timeZone` to correctly convert user input to UTC. `EventResponseDto` returns UTC; frontend handles display in user's local time.
*   **Conflict Resolution:** Primarily handled by `SyncService` for incoming changes. `EventsService` might initiate a re-sync via `SyncService` if an outgoing operation fails due to a conflict on the platform.
*   **Performance:** Recurrence expansion can be intensive. Optimize queries.
*   **Idempotency:** Ensure platform operations via `CalendarsService` are idempotent where possible, or that `EventsService` can handle retries or already-processed scenarios.
