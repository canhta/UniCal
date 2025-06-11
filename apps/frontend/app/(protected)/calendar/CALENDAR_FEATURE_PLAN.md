# Calendar Feature Plan (Phase 3)

This plan details the UI and interaction for the main Unified Calendar View and Event Management functionalities.

## FRD Alignment
*   **FR3.3.1 Standard Calendar Views**
*   **FR3.3.2 Visual Differentiation of Events**
*   **FR3.3.3 Calendar Visibility Toggle**
*   **FR3.3.4 Event Display in Views (and Details Modal)**
*   **FR3.3.5 Time Zone Support**
*   **FR3.4.1 Create Event**
*   **FR3.4.2 Read Event Details (Covered by FR3.3.4)**
*   **FR3.4.3 Update Event**
*   **FR3.4.4 Delete Event**
*   **FR3.4.5 Recurring Events (Basic Sync & Display)**
*   **FR3.7.1 Event-Level Privacy Indication (Display)**
*   **FR3.9.1 Event Reminders (Passthrough/Display)**

## Core Page: `/calendar` (Protected Route)

This page will likely be a mix of Server and Client Components. The main calendar display and event fetching will benefit from client-side interactivity and libraries.
`apps/frontend/app/(protected)/calendar/page.tsx`

## UI Elements & Functionality

### 1. Main Calendar View (`apps/frontend/components/calendar/UniCalendar.tsx`)
*   **Tech:** `@event-calendar/core` with plugins (`@event-calendar/daygrid`, `@event-calendar/timegrid`, `@event-calendar/list`, `@event-calendar/interaction`).
*   **FR3.3.1 Standard Calendar Views:**
    *   **[ ] View Selector:** Buttons/Dropdown (`components/ui/Dropdown.tsx` or `Button.tsx` group) for Day, Week, Month views.
    *   **[ ] Navigation:** "Previous", "Next", "Today" buttons.
    *   **[ ] Date Display:** Show current view's date range or selected date.
    *   **[ ] Event Fetching:** Fetch events from backend API (e.g., `GET /api/events?start_date=...&end_date=...&calendar_ids=...&tz=...`) based on current view, date range, and selected native calendar visibility.
        *   This will be a client-side fetch, likely managed by the `UniCalendar` component or a custom hook.
*   **FR3.3.2 Visual Differentiation:**
    *   **[ ] Event Styling:** Apply fixed, non-customizable colors to events based on their source platform (e.g., Google=blue, Outlook=green). This mapping will be done in the frontend based on event data from the API.
*   **FR3.3.4 Event Display in Views:**
    *   **[ ] Cell Display:** Show event title and start time in calendar cells.
    *   **[ ] Hover (Desktop):** On hover, show a tooltip with full title, start/end time, source platform.
    *   **[ ] Click Action:** Clicking an event opens the Event Details Modal (see below).
*   **FR3.3.5 Time Zone Support:**
    *   **[ ] Display:** Ensure `@event-calendar/core` is configured to display events in the user's browser local time zone. Backend provides events in UTC.
*   **FR3.4.5 Recurring Events (Display):**
    *   **[ ] Data Handling:** The backend will provide expanded instances of recurring events or the master event with recurrence rules. The frontend calendar library should be able to display these correctly.
    *   **[ ] Display:** Show recurring events as normal event occurrences.
*   **Event Interaction (`@event-calendar/interaction`):**
    *   **[ ] Date Click/Select:** Clicking on a date/time slot in the calendar should open the Create Event Modal, pre-filling the start/end times.
    *   **[ ] Event Drag & Drop/Resize (Post-MVP or if simple with library):** If the library supports it easily, allow dragging to change event time or resizing to change duration. This would trigger the Update Event flow.

### 2. Calendar Sidebar/Controls (`apps/frontend/components/calendar/CalendarControls.tsx`)
*   **FR3.3.3 Calendar Visibility Toggle:**
    *   **[ ] Data Fetching:** Fetch the list of user's selected native calendars from connected accounts (e.g., from a global state populated after integrations setup, or a dedicated API call `GET /api/user/settings/calendars-visibility`).
    *   **[ ] UI:** Display a list of these native calendars (e.g., "Google: Personal", "Outlook: Work") with checkboxes (`components/ui/Checkbox.tsx`).
    *   **[ ] Action:** Toggling a checkbox updates a local state that filters the events displayed on the main calendar. This preference should also be saved to the backend (e.g., `PUT /api/user/settings/calendars-visibility`).
*   **[ ] "Create Event" Button:** A prominent button to open the Create Event Modal.

### 3. Event Details Modal (`apps/frontend/components/calendar/EventDetailsModal.tsx`)
*   **Triggered by clicking an event on the calendar.**
*   **FR3.3.4 Event Details Display:**
    *   **[ ] Fields:** Display Title, Start Time, End Time, All-day status, Description (plain text), Location (plain text), Source Platform (e.g., "From your Google Calendar").
*   **FR3.7.1 Event-Level Privacy Indication (Display):**
    *   **[ ] Display:** If the event is marked as "private" (info from backend), display a visual indicator (e.g., a lock icon, text "Private Event").
*   **FR3.9.1 Event Reminders (Display):**
    *   **[ ] Display:** Show reminder information from native events (e.g., "Reminder: 15 minutes before via email"). This is text-only display; UniCal does not trigger its own reminders for MVP.
*   **Actions:**
    *   **[ ] "Edit Event" Button:** Opens the Edit Event Modal (pre-filled with current details).
    *   **[ ] "Delete Event" Button:** Triggers the Delete Event flow.
    *   **[ ] Close Button.**

### 4. Create Event Modal (`apps/frontend/components/calendar/CreateEventModal.tsx`)
*   **Triggered by "Create Event" button or clicking a date/time slot.**
*   **FR3.4.1 Create Event:**
    *   **[ ] Form Fields (`components/ui/Input.tsx`, `components/ui/Toggle.tsx`, `components/ui/Dropdown.tsx`):
        *   Title (text input)
        *   Start Date & Time (datetime picker - consider a library or styled native inputs)
        *   End Date & Time (datetime picker)
        *   All-day toggle (`components/ui/Toggle.tsx`)
        *   Target Native Calendar (dropdown (`components/ui/Dropdown.tsx`) listing user's connected native calendars where event can be created - e.g., "Google: Personal", "Outlook: Work"). Data from `GET /api/calendars/targetable`.
        *   Description (textarea)
        *   Location (text input)
    *   **[ ] Time Zone Handling:** Times entered are assumed to be in the user's local time zone. Convert to UTC before sending to backend.
    *   **[ ] Actions:**
        *   "Save" button: Makes API call (`POST /api/events`) with event data.
        *   "Cancel" button.
*   **Target Calendar Selection:**
    *   When creating a new event, a dropdown will allow the user to select the target native calendar.
    *   This dropdown will be populated by calling a backend endpoint (e.g., `GET /calendars/targetable` from the `calendars` module) which lists all native calendars the user has connected and has write permissions for.
    *   The selected `nativeCalendarId` will be sent with the `POST /events` request.

### 5. Edit Event Modal (`apps/frontend/components/calendar/EditEventModal.tsx`)
*   **Similar to Create Event Modal, but pre-filled with existing event data.**
*   **FR3.4.3 Update Event:**
    *   **[ ] Form Fields:** Same as Create Event, pre-filled.
        *   Target Native Calendar (dropdown): Allows changing the native calendar for the event. This field should be editable.
    *   **[ ] Actions:**
        *   \"Save Changes\" button: Makes API call (`PUT /api/events/{eventId}`) with updated event data.
        *   \"Cancel\" button.
*   **FR3.4.5 Recurring Events (Single Instance Edit - if supported by backend/library for MVP):**
    *   If editing an instance of a recurring event, the modal will ask "Edit this instance only or the entire series?". Editing only the current instance (creating an exception) is the MVP behavior. Series editing is Post-MVP.

### 6. Delete Event Flow
*   **FR3.4.4 Delete Event:**
    *   **[ ] Confirmation Modal (`components/ui/Modal.tsx`):** Triggered by "Delete Event" button in Event Details Modal. Show message like "Are you sure you want to delete this event? This action will also remove it from your native calendar."
    *   **[ ] Action:** On confirmation, make API call (`DELETE /api/events/{eventId}`).
*   **FR3.4.5 Recurring Events (Single Instance Delete - if supported for MVP):**
    *   If deleting an instance of a recurring event, the confirmation will ask "Delete this instance only or the entire series?". Deleting only the current instance (creating an exception) is the MVP behavior. Series deletion is Post-MVP.

## State Management Considerations:
*   **Current View/Date:** Local state within `UniCalendar.tsx` or a shared context/store.
*   **Fetched Events:** Could be managed by SWR/React Query for caching and re-fetching, or a global state manager.
*   **Selected Native Calendars (for visibility):** Global state or context, persisted to user settings.
*   **Modal States (Open/Closed, data for modals):** Local component state or a UI state slice in a global manager.

## API Endpoints (Frontend Perspective - to be consumed):
*   `GET /api/events?start_date=...&end_date=...&calendar_ids=...&tz=...` (Fetch events for display)
*   `POST /api/events` (Create new event)
*   `GET /api/events/{eventId}` (Fetch single event details - might not be needed if all data is in the list view)
*   `PUT /api/events/{eventId}` (Update event)
*   `DELETE /api/events/{eventId}` (Delete event)
*   `GET /api/calendars/targetable` (To populate "Target Native Calendar" dropdown, replacing old `/api/integrations/accounts?writable=true`)
*   `GET /api/user/settings/calendars-visibility` (To get/set calendar visibility toggles)
*   `PUT /api/user/settings/calendars-visibility`

## Implementation Notes:
*   **SSR Preference:** While the main calendar interaction is client-side, the initial page (`/calendar`) can be a Server Component. It might pre-fetch initial settings like available native calendars for toggling, or user preferences. The actual event data for the calendar grid is better suited for client-side fetching due to its dynamic nature (date navigation, view changes).
*   **Date/Time Picker:** This is a critical component. Evaluate options: styled native pickers, or a lightweight, accessible React date/time picker library.
*   **Performance:** Efficiently fetch and render events, especially for month views with many events.
*   **Error Handling & Loading States:** Crucial for all API interactions (creating, updating, deleting events, fetching data).
