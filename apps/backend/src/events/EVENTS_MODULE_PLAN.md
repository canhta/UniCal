# Events Module Plan (Backend)

**Overall Goal:** Manage calendar events within UniCal, including creating, reading, updating, and deleting (CRUD) events, and handling their synchronization with external calendar platforms. This module is central to the user's calendar experience.

**Alignment:** This plan primarily aligns with Backend AGENT_PLAN Phase 3 (Core Features - Calendar Sync & Integrations) and Phase 4 (Advanced Features - Event Management).

## 1. Prisma Schema (`prisma/schema.prisma`)
*Goal: Define the database structure for storing UniCal's representation of calendar events, linked to users and their connected accounts.*

*   [x] **Define `Event` Model:** (Completed - using simplified schema with core fields)
    *   `id` (String, PK, `@default(uuid())`)
    *   `userId` (String) - Foreign Key to `User` model.
    *   `calendarId` (String) - Foreign Key to `Calendar` model.
    *   `externalId` (String?) - Unique ID of the event on the source platform.
    *   `title` (String)
    *   `description` (String?)
    *   `startTime` (DateTime) - Stored in UTC.
    *   `endTime` (DateTime) - Stored in UTC.
    *   `isAllDay` (Boolean?)
    *   `location` (String?)
    *   `url` (String?)
    *   `status` (String?)
    *   `visibility` (String?)
    *   `recurrenceRule` (String?)
    *   `recurrenceId` (String?)
    *   `lastSyncedAt` (DateTime?)
    *   `syncStatus` (String?)
    *   `createdAt` (DateTime, `@default(now())`)
    *   `updatedAt` (DateTime, `@updatedAt`)

## 2. DTOs (Data Transfer Objects)
*Goal: Define data structures for API requests/responses and internal service communication, ensuring clear contracts.*

*   [x] **`EventResponseDto.ts`:** (Completed - matches current schema)
*   [x] **`CreateEventRequestDto.ts` (for API):** (Completed)
*   [x] **`UpdateEventRequestDto.ts` (for API):** (Completed)
*   [x] **`GetEventsQueryDto.ts` (for API):** (Completed)
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

*   [x] Create `EventsModule`. (Completed)
*   [x] Import `PrismaModule`. (Completed)
*   [x] Import `CalendarsModule` (Completed)
*   [x] Declare and Export `EventsService`. (Completed)
*   [x] Declare `EventsController`. (Completed)

## Phase 2.3 Completion Status

### Calendar Management (Completed ✅)
*   [x] **Calendar Management Implementation:** (Completed)
    *   ✅ `getUserCalendars()` - List user's synced calendars from database
    *   ✅ `syncCalendar()` - Start syncing an external calendar, create Calendar record in Prisma
    *   ✅ `updateCalendarSettings()` - Update calendar display settings (visibility, color, name)
    *   ✅ `unsyncCalendar()` - Stop syncing a calendar, delete Calendar record and cleanup events
    *   ✅ Calendar controller endpoints with proper authentication and error handling

### Microsoft Calendar Integration (Completed ✅)
*   [x] **Microsoft Calendar Service:** (Completed)
    *   ✅ `MicrosoftCalendarService` implementing `ICalendarPlatformService`
    *   ✅ Microsoft OAuth 2.0 flow implementation
    *   ✅ Microsoft Graph API integration for calendars and events
    *   ✅ Event CRUD operations with Microsoft Calendar
    *   ✅ Webhook subscription management for real-time sync
    *   ✅ Token refresh mechanism
    *   ✅ Platform services map updated to include Microsoft

### Platform Integration Enhancement (Completed ✅)
*   [x] **Enhanced Platform Support:** (Completed)
    *   ✅ Updated `UpdatePlatformEventDto` and `CreatePlatformEventDto` to include `url`, `status`, `visibility` fields
    *   ✅ Google Calendar service updated to handle new fields
    *   ✅ Microsoft Calendar service implemented with full field support
    *   ✅ Both services now support comprehensive event properties

## Next Phase: Sync Module Implementation

### Initial Sync Infrastructure (Pending 🔄)
*   [ ] **`SyncModule` Implementation:**
    *   [ ] Create `SyncService` for managing calendar and event synchronization
    *   [ ] Implement initial sync logic for newly connected calendars
    *   [ ] Build incremental sync for existing calendars
    *   [ ] Add conflict resolution mechanisms (last update wins strategy)
    *   [ ] Implement sync status tracking and error handling

### Webhook Infrastructure (Pending 🔄)
*   [ ] **Real-time Sync Implementation:**
    *   [ ] Create webhook endpoints for Google Calendar and Microsoft Graph notifications
    *   [ ] Implement webhook validation and security
    *   [ ] Build webhook event processing pipeline
    *   [ ] Add webhook subscription lifecycle management
    *   [ ] Implement retry mechanisms for failed webhook processing

### Enhanced Event Management (Pending 🔄)
*   [ ] **Recurrence Support:**
    *   [ ] Implement RRULE parsing and expansion for recurring events
    *   [ ] Add support for recurrence exceptions and modifications
    *   [ ] Build recurrence instance generation for calendar views

### Testing and Documentation (Pending 🔄)
*   [ ] **Comprehensive Testing:**
    *   [ ] Unit tests for all calendar and event services
    *   [ ] Integration tests for OAuth flows and platform APIs
    *   [ ] E2E tests for calendar synchronization workflows
    *   [ ] Error handling and edge case testing

## Implementation Notes

### Completed Features
- **Full Platform Integration**: Both Google and Microsoft Calendar services are now fully implemented and integrated
- **Calendar Management**: Complete CRUD operations for user calendar management in the database
- **Enhanced Event Properties**: Support for URLs, status, visibility across all platforms
- **Robust OAuth Flows**: Centralized OAuth service supporting multiple providers
- **Error Handling**: Comprehensive error handling with graceful fallbacks

### Architecture Improvements
- **Service Isolation**: Calendar platform services are properly isolated and interchangeable
- **Centralized OAuth**: OAuthService handles all OAuth flows with CSRF protection
- **Database Integration**: Calendar and event records properly linked with foreign keys
- **Type Safety**: Full TypeScript support with strict typing across all interfaces

### Configuration Required
- Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- Microsoft OAuth credentials (MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID)
- Database connection (PostgreSQL)
- Encryption key for token storage (TOKEN_ENCRYPTION_KEY)

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
