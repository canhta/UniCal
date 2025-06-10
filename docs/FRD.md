# Functional Requirements Document: Unified Calendar System

## 1. Introduction

This Functional Requirements Document (FRD) specifies the functional requirements for the Unified Calendar System (UCS). The UCS is conceived as a centralized hub to combat the significant inefficiencies stemming from a fragmented digital scheduling landscape, as detailed in the Business Requirements Document (BRD). These inefficiencies, including difficulty in obtaining a holistic view of availability, an increased risk of double-bookings, time lost to redundant event entry, and challenges in accurately sharing availability, lead to tangible productivity losses. The UCS aims to directly address these critical pain points.

**For the Minimum Viable Product (MVP), the focus is on delivering core functionalities that directly address the critical user pain points of schedule fragmentation and the lack of a holistic availability overview, as identified in the Business Requirements Document (BRD). The MVP will provide a foundational, reliable unified view and two-way synchronization for initial core calendar platforms.**

This FRD is based on the Business Requirements Document (BRD) for UniCal.

## 2. Scope

### 2.1. In Scope (MVP)

*   **User Account Management (MVP):**
    *   Email/Password based User Registration.
    *   User Login.
    *   Password Reset.
*   **Multi-Platform Connectivity (MVP Core - Google & Outlook):**
    *   Secure connection to Google Calendar using OAuth 2.0.
    *   Secure connection to Microsoft Outlook Calendar using Microsoft Graph API (OAuth 2.0).
    *   (Post-MVP Consideration for initial expansion: Apple Calendar via CalDAV).
    *   **BRD Alignment:** This directly enables the system to start aggregating data from major platforms, a first step towards a unified system.
*   **Unified Calendar View (MVP):**
    *   Consolidated display of events from connected calendars. **This directly addresses the BRD-identified pain points of lacking a holistic schedule overview and helps mitigate the risk of double-bookings by providing a single source of truth for the user's time.**
    *   Standard Day, Week, and Month views.
    *   Basic visual differentiation for event sources (e.g., distinct, non-customizable colors per platform).
    *   Ability to toggle visibility of individual connected calendars.
*   **Event Management (CRUD Operations - MVP):**
    *   Read events from connected calendars.
    *   Create new events in UCS, which then sync to one selected primary connected native calendar. **This begins to address the inefficiency of redundant event entry.**
    *   Update existing events (synced from native calendar or created in UCS) with changes propagating to the native calendar.
    *   Delete existing events (synced from native calendar or created in UCS) with changes propagating to the native calendar.
    *   Support for basic recurrence (e.g., daily, weekly, monthly - read and display, with single instance modification).
*   **Two-Way Synchronization (MVP - for core connected platforms):**
    *   Synchronization of core event details (title, start/end time, description, location, basic recurrence). **This establishes the "deep synchronization" principle from the BRD for essential event data, ensuring consistency across platforms.**
    *   Conflict resolution: "Last update wins" strategy.
*   **Basic Privacy Indication (MVP):**
    *   Visually indicate if an event was marked as "private" on the source calendar (e.g., details might be masked or event shown as "Busy"). UCS will not allow changing this privacy from UCS itself in MVP.
*   **Responsive Web Design (MVP):**
    *   The web application interface is usable on common desktop and mobile browsers.
*   **Basic Event Reminders (MVP):**
    *   Display reminders that are set on the native calendars. UCS itself will not create new reminders in MVP.

### 2.2. Out of Scope (Initially - Post-MVP Features)

*   **Advanced User Account Management:**
    *   All Single Sign-On (SSO) options (Google, Microsoft, SAML/OpenID Connect).
    *   Detailed Profile Management (beyond password change).
*   **Expanded Multi-Platform Connectivity:**
    *   Apple Calendar (iCloud via CalDAV).
    *   Zoom account direct integration for creating/managing meetings from UCS. (Viewing Zoom meetings that appear on a synced GCal/Outlook is implicitly in scope if the calendar sync brings them).
*   **Advanced Unified Calendar View Features:**
    *   User-customizable colors for calendars.
    *   Agenda view.
    *   Advanced time zone management features (beyond basic display in user's primary TZ).
*   **Advanced Event Management:**
    *   Creating a single event in UCS and having it propagate to *multiple* selected native calendars simultaneously. (MVP: syncs to one primary chosen calendar).
    *   Rich text support in descriptions.
    *   Attendee management directly from UCS (inviting, seeing RSVP status from UCS).
    *   Advanced recurrence patterns.
*   **Personal Booking Page:** All features related to the personal booking page.
*   **Granular Privacy Controls within UCS:** Event-level privacy settings managed *from* UCS.
*   **AI-Driven Features:** All AI-powered scheduling recommendations and context-aware summaries.
*   **Task Integration.**
*   **Focus Time Blocking.**
*   **Native Mobile Applications.**
*   **Advanced Synchronization Controls:** User control over sync direction (one-way/two-way), manual sync triggers for individual accounts.
*   **Advanced Conflict Resolution Mechanisms.**
*   **UCS-Generated Notifications:**
    *   UCS-specific event reminders (MVP relies on native calendar reminders).
    *   Booking notifications (as booking page is Post-MVP).
    *   Proactive sync status/error notifications (MVP will show status on connection page, but not send separate alerts).

## 3. Functional Requirements

The functional requirements detailed in this section are specifically scoped for the Minimum Viable Product (MVP). Each feature is designed to directly address the core user pain points identified in the Business Requirements Document (BRD) – primarily schedule fragmentation, the difficulty in achieving a holistic schedule overview, the risk of conflicting appointments, and the inefficiencies of manual cross-platform event management. By focusing on these foundational elements, the MVP aims to deliver tangible improvements to user productivity and schedule clarity.

### 3.1. User Account Management (MVP)

*   **FR3.1.1 User Registration:**
    *   **User Story:** As a new user, I want to register for an account by providing my email address and creating a secure password, so I can start using the Unified Calendar System to consolidate my schedules.
    *   **Solution Details:**
        *   The system will present a registration page with fields for `Email Address`, `Password`, and `Confirm Password`.
        *   Client-side validation will check for email format and password presence. Server-side validation will ensure email uniqueness and enforce password complexity (e.g., min 8 characters, at least one number, one uppercase, one lowercase - defined in NFRs).
        *   Passwords will be securely hashed (e.g., using bcrypt or Argon2) before storing in the database.
        *   No email verification will be required for MVP to simplify registration, but this is a high-priority post-MVP feature.
    *   **Acceptance Criteria:**
        *   A user can access the registration page.
        *   A user can successfully submit the registration form with a unique email and a password meeting complexity rules.
        *   Upon successful registration, the user is automatically logged in and redirected to the main dashboard/calendar view.
        *   Appropriate error messages are displayed for invalid email format, non-unique email, or passwords not meeting complexity.

*   **FR3.1.2 User Login:**
    *   **User Story:** As a registered user, I want to log in with my email and password, so I can access my unified calendar and get a clear overview of my commitments.
    *   **Solution Details:**
        *   The system will present a login page with fields for `Email Address` and `Password`.
        *   A "Forgot Password?" link will be present.
        *   Authentication will be performed by comparing the provided password (after hashing) with the stored hashed password for the given email.
        *   Session management will be implemented using secure HTTP-only cookies or tokens.
    *   **Acceptance Criteria:**
        *   A registered user can successfully log in with correct credentials.
        *   Upon successful login, the user is redirected to their main dashboard or unified calendar view.
        *   Clear error messages are displayed for incorrect credentials or non-existent accounts.
        *   (Post-MVP) Implement account lockout after multiple failed attempts.

*   **FR3.1.3 Single Sign-On (SSO):** (Moved to Post-MVP)

*   **FR3.1.4 Password Reset:**
    *   **User Story:** As a user who has forgotten my password, I want to be able to securely reset it, so I can regain access to my account.
    *   **Solution Details:**
        *   User clicks "Forgot Password?" and enters their registered email.
        *   The system generates a unique, time-limited (e.g., 1 hour) token and stores it (hashed) associated with the user account.
        *   An email is sent to the user with a link containing this token (e.g., `app.unical.com/reset-password?token=TOKEN_VALUE`).
        *   Clicking the link directs the user to a page where they can enter a new password and confirm it.
        *   On submission, the system validates the token (existence, non-expiry, matches user) and the new password's complexity, then updates the user's hashed password and invalidates the token.
    *   **Acceptance Criteria:**
        *   A user can request a password reset.
        *   A password reset email with a unique, time-limited link is sent.
        *   The user can set a new password using the link, adhering to complexity rules.
        *   The reset link can only be used once.
        *   Old password no longer works.

*   **FR3.1.5 Profile Management:** (Simplified for MVP - only password change after login)
    *   **User Story:** As a logged-in user, I want to change my password, so I can maintain account security.
    *   **Solution Details:**
        *   Within an "Account Settings" area, a user can access a "Change Password" form.
        *   The form requires `Current Password`, `New Password`, and `Confirm New Password`.
        *   The system validates the current password before allowing the change. New password must meet complexity rules.
    *   **Acceptance Criteria:**
        *   A logged-in user can access the change password interface.
        *   A user can successfully change their password after providing the correct current password and a valid new password.
        *   Error messages are shown for incorrect current password or if the new password doesn't meet complexity.

### 3.2. Multi-Platform Connectivity (MVP)

*   **FR3.2.1 Connect Google Calendar:**
    *   **User Story:** As a user, I want to securely connect my Google Calendar account to UCS, so my Google Calendar events are seamlessly integrated into my unified view, helping me avoid fragmentation.
    *   **Solution Details:**
        *   UCS will register as an OAuth 2.0 client with Google Cloud Platform.
        *   A "Connect Google Calendar" button in UCS settings will initiate the OAuth 2.0 authorization code flow.
        *   User is redirected to Google's consent screen. UCS will request minimal necessary scopes (e.g., `https://www.googleapis.com/auth/calendar.readonly` and `https://www.googleapis.com/auth/calendar.events` for read/write).
        *   Upon user consent, Google redirects back to UCS with an authorization code.
        *   UCS server exchanges the code for an access token and a refresh token.
        *   Access and refresh tokens are securely stored (encrypted at rest) associated with the UCS user account.
        *   The system will then allow the user to select which of their Google calendars (primary, secondary) they want to sync with UCS (MVP: initially sync primary by default, allow choosing later).
    *   **Acceptance Criteria:**
        *   User can successfully complete the Google OAuth flow and grant permissions.
        *   Access and refresh tokens are securely stored.
        *   The connected Google account (e.g., email) is displayed in UCS settings.
        *   User can select (or system defaults to primary) specific Google calendars to sync.
        *   Clear error handling for OAuth failures or permission denial.

*   **FR3.2.2 Connect Microsoft Outlook/Teams Calendar:**
    *   **User Story:** As a user, I want to securely connect my Microsoft Outlook calendar account to UCS, so my Outlook events are part of my consolidated schedule, reducing the need to check multiple apps.
    *   **Solution Details:**
        *   Similar to Google Calendar, UCS will register as an OAuth 2.0 client with Microsoft Azure Active Directory.
        *   A "Connect Microsoft Calendar" button initiates the OAuth 2.0 flow.
        *   User is redirected to Microsoft's consent screen. UCS will request necessary Microsoft Graph API permissions (e.g., `Calendars.ReadWrite`).
        *   Access and refresh tokens are obtained and stored securely.
        *   User can select specific calendars from their Microsoft account to sync.
    *   **Acceptance Criteria:**
        *   User can successfully complete the Microsoft OAuth flow.
        *   Tokens are securely stored.
        *   Connected Microsoft account is displayed.
        *   User can select specific Outlook calendars to sync.
        *   Error handling for OAuth failures.

*   **FR3.2.3 Connect Apple Calendar (iCloud):** (Post-MVP)

*   **FR3.2.4 Connect Zoom Account:** (Post-MVP for direct integration. Viewing Zoom meetings from synced GCal/Outlook is passive.)

*   **FR3.2.5 Manage Connected Accounts (MVP):**
    *   **User Story:** As a user, I want to see my connected calendar accounts and be able to disconnect them.
    *   **Solution Details:**
        *   An "Integrations" or "Connected Accounts" page will list connected accounts (e.g., "Google Calendar - user@example.com", "Microsoft Outlook - user@outlook.com").
        *   Each entry will show the platform, account identifier, and a "Disconnect" button.
        *   (MVP Simplification) Status will implicitly be "Connected" if listed. Detailed sync status like "Syncing" or "Needs Re-authentication" might be basic text or deferred to post-MVP for richer UI. If a token expires, sync will fail, and user might need to disconnect and reconnect.
        *   Disconnecting will revoke stored tokens and remove the account from the list. Data already synced might be soft-deleted or marked as orphaned.
    *   **Acceptance Criteria:**
        *   User can view a list of their connected calendar platform accounts.
        *   User can successfully disconnect an account.
        *   Upon disconnection, UCS no longer attempts to sync with that account.
        *   (Post-MVP) Clearer status indicators and re-authentication flows.

*   **FR3.2.6 Authentication Error Handling (MVP):**
    *   **Solution Details:** During the connection process, if OAuth fails or permissions are denied, the user will be redirected back to a UCS page with a generic error message (e.g., "Failed to connect to [Platform]. Please try again or check your permissions on [Platform]."). Specific error codes from providers will be logged for debugging but not necessarily shown to the user in MVP.
    *   **Acceptance Criteria:** User is informed of connection failures.

### 3.3. Unified Calendar View (MVP)

*   **FR3.3.1 Standard Calendar Views:**
    *   **User Story:** As a user, I want to view my aggregated schedule in day, week, and month formats, so I can choose the overview that best helps me understand my availability and commitments, thus tackling the challenge of a fragmented schedule.
    *   **Solution Details:**
        *   A JavaScript-based calendar library (e.g., FullCalendar, TuiCalendar, or a simpler custom solution) will be used to render the views.
        *   **Day View:** Chronological timeline for a selected day. Navigation to previous/next day.
        *   **Week View:** 7-day week view. Navigation to previous/next week. (Configurable 5-day work week is Post-MVP).
        *   **Month View:** Standard calendar grid for the month. Navigation to previous/next month.
        *   (Agenda View is Post-MVP).
        *   Data will be fetched via API calls from the UCS backend, which aggregates events from connected and selected native calendars.
    *   **Acceptance Criteria:**
        *   Day, Week, and Month views are functional and display events from all selected synced calendars.
        *   Users can switch between these views.
        *   Navigation to past/future periods is available.
        *   Current date is highlighted.

*   **FR3.3.2 Visual Differentiation of Events (MVP):**
    *   **User Story:** As a user, I want events from my different connected calendar platforms (Google, Outlook) to be visually distinct in the unified view, so I can quickly understand the source of each commitment.
    *   **Solution Details:**
        *   The system will assign a fixed, non-customizable color to events based on their source platform (e.g., Google Calendar events are blue, Outlook events are green).
        *   If multiple accounts from the same platform are connected (e.g., two Google accounts), they will share the same platform color in MVP. (Distinguishing between same-platform accounts is Post-MVP).
    *   **Acceptance Criteria:**
        *   Events from Google Calendar have one consistent color.
        *   Events from Microsoft Outlook have another consistent, distinct color.

*   **FR3.3.3 Calendar Visibility Toggle (MVP):**
    *   **User Story:** As a user, I want to show or hide events from specific connected calendar accounts (e.g., hide my personal Google Calendar while viewing work Outlook), so I can focus on the relevant subset of my unified schedule.
    *   **Solution Details:**
        *   A sidebar or dropdown will list all successfully connected and selected native calendars (e.g., "Google - personal@gmail.com - Primary", "Outlook - work@company.com - Calendar").
        *   Each listed calendar will have a checkbox. Unchecking it will hide its events from the unified view.
        *   Visibility preferences will be stored locally in the browser (e.g., localStorage) or on the server per user.
    *   **Acceptance Criteria:**
        *   Users can toggle the visibility of events from any individual synced native calendar.
        *   The unified view updates immediately.
        *   Visibility preferences are remembered across sessions (if server-side) or for the current session (if client-side).

*   **FR3.3.4 Event Display in Views (MVP):**
    *   **User Story:** As a user, I want to see essential event details directly in the calendar views and access more information by clicking, allowing me to quickly grasp my schedule from the unified interface.
    *   **Solution Details:**
        *   Calendar views will display event title and start time.
        *   On hover (desktop), a tooltip will show full title, start/end time, and source calendar name (e.g., "Google - personal@gmail.com").
        *   Clicking an event will open a modal/pop-up displaying: Title, Start/End Date & Time, Description (plain text for MVP), Location (plain text), Source Calendar. Buttons for "Edit" and "Delete" will be present.
    *   **Acceptance Criteria:**
        *   Event title and start time are visible in calendar cells.
        *   Hover provides more details.
        *   Clicking opens a modal with key event information and Edit/Delete options.
        *   Overlapping events are visually indicated (e.g., slightly offset or stacked).

*   **FR3.3.5 Time Zone Support (MVP):**
    *   **User Story:** As a user, I want events to be displayed in my current system's time zone.
    *   **Solution Details:**
        *   All event times fetched from native calendars will be converted and stored in UTC on the backend.
        *   The frontend will fetch UTC times and display them in the user's browser-detected local time zone.
        *   When creating/editing events, times entered by the user will be assumed to be in their local time zone and converted to UTC for storage/sync.
        *   (User-selectable primary time zone in UCS settings is Post-MVP).
    *   **Acceptance Criteria:**
        *   Events are displayed correctly according to the user's browser/system time zone.
        *   Times are correctly converted to UTC for backend storage and synchronization.

### 3.4. Event Management (CRUD Operations - MVP)

*   **FR3.4.1 Create Event (MVP):**
    *   **User Story:** As a user, I want to create a new event once in UCS, specify which of my connected native calendars it belongs to (e.g., my primary work Outlook calendar), and have it automatically appear there, saving me from manual redundant entry.
    *   **Solution Details:**
        *   User can initiate event creation (e.g., click time slot, "New Event" button).
        *   Event creation modal includes:
            *   Title (required, plain text)
            *   Start date/time (required)
            *   End date/time (required)
            *   All-day event toggle
            *   Target Calendar: Dropdown listing all user's individual connected native calendars (e.g., "Google - personal@gmail.com - Primary", "Outlook - work@company.com - Calendar"). The event will be created on this selected native calendar.
            *   Description (plain text, multi-line)
            *   Location (plain text)
        *   (Recurrence, Attendees, Conferencing, Visibility, Reminders from UCS are Post-MVP for creation. Basic recurrence sync is covered in FR3.4.5).
        *   On save, UCS sends the event data to the API of the selected target native calendar.
    *   **Acceptance Criteria:**
        *   User can create an event with title, start/end times, and select a single target native calendar.
        *   The event is successfully created on the chosen native calendar platform.
        *   The new event appears in the UCS unified view (after the next sync cycle, or immediately if possible).
        *   Error handling for creation failures (e.g., API error from native platform).

*   **FR3.4.2 Read Event Details (MVP):** (Covered by FR3.3.4 click action)
    *   **User Story:** As a user, I want to view all details of an event by clicking on it.
    *   **Solution Details:** As per FR3.3.4, clicking an event opens a modal showing Title, Start/End Date & Time, Description (plain text), Location (plain text), Source Calendar.
    *   **Acceptance Criteria:** All available core details are displayed.

*   **FR3.4.3 Update Event (MVP):**
    *   **User Story:** As a user, I want to modify existing events that appear in my UCS unified view and have these changes automatically reflected on the original native calendar, ensuring my schedule is consistent everywhere.
    *   **Solution Details:**
        *   From the event details modal (FR3.3.4), an "Edit" button opens the event creation/editing modal pre-filled with the event's data.
        *   User can modify Title, Start/End times, Description, Location.
        *   (Changing the "Target Calendar" for an existing event is complex and Post-MVP. Edits apply to the original source calendar).
        *   On save, UCS sends the update to the native calendar API using the event's unique ID from that platform.
    *   **Acceptance Criteria:**
        *   User can edit the core fields of an event.
        *   Changes are saved in UCS and synced to the original native calendar platform.
        *   Error handling for update failures.

*   **FR3.4.4 Delete Event (MVP):**
    *   **User Story:** As a user, I want to delete events shown in UCS, and have them removed from the original native calendar, keeping my consolidated schedule accurate and up-to-date.
    *   **Solution Details:**
        *   From the event details modal (FR3.3.4), a "Delete" button is available.
        *   A confirmation prompt ("Are you sure you want to delete this event?") is shown.
        *   Upon confirmation, UCS sends a delete request to the native calendar API using the event's ID.
        *   (Options for deleting recurring event instances like "this and future" are Post-MVP. MVP deletes the single instance or the whole series based on what the native API supports by default for a single delete action).
    *   **Acceptance Criteria:**
        *   User can delete an event after confirmation.
        *   The event is removed from UCS and the native calendar platform.
        *   Error handling for deletion failures.

*   **FR3.4.5 Recurring Events (MVP - Basic Sync & Display):**
    *   **User Story:** As a user, I want to see my recurring events from my native calendars correctly displayed in UCS, and if I change a single instance (e.g., move one meeting), that change should sync back, maintaining the integrity of my overall schedule.
    *   **Solution Details:**
        *   UCS will read and display recurring events from connected native calendars, showing all instances within the viewed date range.
        *   When editing a single instance of a recurring event (e.g., changing its time for one day), UCS will attempt to sync this as an "exception" to the recurrence rule on the native platform.
        *   Creating new complex recurrence rules *from UCS* is Post-MVP. Deleting a single instance of a recurring series will be attempted.
        *   The system will rely on the native calendar's handling of recurrence. If a native calendar sends individual occurrences for a recurring event, UCS will display them. If it sends a rule, UCS will attempt to expand it for display.
    *   **Acceptance Criteria:**
        *   Recurring events from native calendars are displayed as multiple instances in UCS views.
        *   Editing a single occurrence's time/title in UCS syncs that change as an exception to the native calendar if the API supports it.
        *   Deleting a single occurrence in UCS deletes that instance on the native calendar if the API supports it.
        *   (Creating/editing the recurrence rule itself from UCS is Post-MVP).

### 3.5. Two-Way Synchronization (MVP)

*   **FR3.5.1 Real-time/Near Real-time Sync (MVP):**
    *   **User Story:** As a user, I expect changes made in my native calendars (Google/Outlook) or in UCS to be reflected across platforms reasonably quickly, ensuring my unified view is a reliable and up-to-date source of truth for my schedule.
    *   **Solution Details:**
        *   **Google Calendar:** Utilize Google Calendar API push notifications (webhooks) for near real-time updates from Google to UCS.
        *   **Microsoft Outlook Calendar:** Utilize Microsoft Graph API change notifications (webhooks) for near real-time updates from Outlook to UCS.
        *   **Fallback/Outgoing Sync:** For changes made *in UCS* to be synced *to* native platforms, UCS will make direct API calls immediately upon save (for create, update, delete).
        *   A periodic background poll (e.g., every 5-15 minutes) will also run for each connected account as a fallback or to catch missed webhook notifications.
        *   (User-visible sync status indicators are basic in MVP, e.g., a general "Last checked: [time]" on the integrations page).
    *   **Acceptance Criteria:**
        *   Changes from connected native calendars (Google/Outlook) using webhooks are reflected in UCS within 1 minute.
        *   Changes made in UCS are reflected in the native calendar within 1 minute.
        *   Periodic polling ensures eventual consistency if webhooks fail.

*   **FR3.5.2 Sync Depth (MVP):**
    *   **User Story:** As a user, I want core event details (like title, time, description, location) to be accurately synchronized between UCS and my native calendars, providing a consistent and "deep" level of detail for my MVP needs.
    *   **Solution Details:** Synchronization will cover: Title, Start/End Date & Time (with time zone info, stored as UTC), All-day status, Description (plain text), Location (plain text). Basic recurrence rules (as supported by native platforms for read, and for single instance modification).
    *   (Attendees, rich text descriptions, attachments, advanced recurrence, event colors, reminders created in UCS are Post-MVP for sync).
    *   **Acceptance Criteria:** Specified core event fields are accurately synchronized between UCS and connected native calendars.

*   **FR3.5.3 Conflict Resolution (MVP):**
    *   **User Story:** As a user, if an event is changed in two places (UCS and native calendar) at roughly the same time, I understand the most recent change will likely win.
    *   **Solution Details:** "Last update wins" based on the event's `updated` timestamp from the native platform. When UCS receives an update via webhook or poll, it will compare the incoming event's `updated` timestamp with the version it has stored (if any). If the incoming is newer, UCS updates its copy. If UCS pushes an update, it assumes its version is now the latest.
    *   **Acceptance Criteria:** The system consistently applies the "last update wins" rule based on available timestamps. (No complex merging or user notification of conflicts in MVP).

*   **FR3.5.4 Sync Control (MVP):** (Simplified - primarily about which calendars under an account are synced)
    *   **User Story:** As a user, after connecting an account (e.g., Google), I want to choose which of my calendars under that account (e.g., Personal, Work, Shared) are synced with UCS.
    *   **Solution Details:**
        *   After successful OAuth connection for an account (Google/Microsoft), UCS will fetch the list of calendars available to that user on that platform.
        *   The user will be presented with this list (calendar name) and checkboxes to select which ones to include in UCS synchronization.
        *   (One-way/two-way explicit toggles, manual "Sync Now" button per account are Post-MVP).
    *   **Acceptance Criteria:**
        *   Users can select/deselect individual calendars from a connected account for syncing.
        *   Only selected calendars' events are fetched and displayed in UCS.
        *   Changes made in UCS only affect the original native calendar the event belongs to.

### 3.6. Personal Booking Page (Moved to Post-MVP)

### 3.7. Privacy Controls (MVP - Basic Indication)

*   **FR3.7.1 Event-Level Privacy Indication:**
    *   **User Story:** As a user, if I mark an event as "private" on my Google or Outlook calendar, I want UCS to show it as busy but not display its details publicly if those features were available.
    *   **Solution Details:**
        *   When syncing events, UCS will check the visibility/privacy flag from the native calendar (e.g., Google Calendar's `visibility` property: `private`, `public`, `default`).
        *   If an event is marked as private on the source, UCS will still display it in the user's own unified view (as they own the calendar). However, the event data will carry this privacy flag.
        *   For MVP, this flag doesn't have further implications as booking pages and team views are out of scope. It's about correctly ingesting this piece of information.
        *   UCS will not allow changing this privacy setting from within UCS in MVP.
    *   **Acceptance Criteria:**
        *   UCS correctly reads and stores the privacy status of an event from the native calendar.
        *   The user can see their own private events in their unified view.

*   **FR3.7.2 Control over Shared Availability:** (Moved to Post-MVP as it relates to Booking Page)

### 3.8. AI-Driven Features (Initial Scope) (Moved to Post-MVP)

### 3.9. Notifications (MVP - Basic)

*   **FR3.9.1 Event Reminders (MVP - Passthrough/Display):**
    *   **User Story:** As a user, I want to see the reminders that are already set on my events in my native Google or Outlook calendars.
    *   **Solution Details:**
        *   When an event is synced from a native calendar, UCS will also fetch its reminder settings if the API provides them (e.g., "10 minutes before, popup").
        *   In the event details modal (FR3.3.4) in UCS, this reminder information will be displayed as text (e.g., "Reminder: 10 mins before via popup on Google Calendar").
        *   UCS will *not* generate its own notifications or popups for these reminders in MVP. The native calendar app/platform is still responsible for triggering the actual reminder.
    *   **Acceptance Criteria:**
        *   Reminder information from native calendar events is displayed in the UCS event details view.
        *   UCS does not create or trigger its own duplicate reminders.

*   **FR3.9.2 Booking Notifications:** (Moved to Post-MVP)

*   **FR3.9.3 Sync Status/Error Notifications:** (Simplified for MVP - no proactive alerts)
    *   **User Story:** As a user, if a calendar connection has an issue (e.g. token expired), I want to be able to see this on the 'Connected Accounts' page.
    *   **Solution Details:**
        *   The "Connected Accounts" page (FR3.2.5) will be the primary place to check status.
        *   If an API call fails due to an authentication issue (e.g., expired token) during a background sync, the system might display a simple, persistent error message next to the affected account on this page, like "Connection issue, please try disconnecting and reconnecting."
        *   Proactive notifications (emails, in-app banners for sync errors) are Post-MVP.
    *   **Acceptance Criteria:**
        *   Persistent authentication errors for a connected account result in a visible status update on the "Connected Accounts" page.

## 6. Future Considerations (Post-Initial Launch)

This section outlines features and enhancements planned for versions beyond the initial MVP.

*   **Advanced User Account Management:**
    *   Single Sign-On (SSO) with Google, Microsoft.
    *   SAML/OpenID Connect for enterprise users.
    *   Detailed Profile Management (e.g., updating name, email preferences).
    *   Account lockout after multiple failed login attempts.
    *   Email verification for new registrations.
*   **Expanded Multi-Platform Connectivity:**
    *   Apple Calendar (iCloud via CalDAV).
    *   Direct Zoom integration (create/manage Zoom meetings from UCS).
    *   Other relevant platforms (e.g., specific project management tools with calendar views).
*   **Personal Booking Page:**
    *   Unique booking page URL.
    *   Availability display based on selected UCS calendars.
    *   Configurable event types for booking.
    *   Customizable booking page (profile picture, welcome message).
    *   Buffer times.
    *   Automatic event creation in UCS user's calendar upon booking.
    *   Email confirmations and calendar invites for booker and UCS user.
*   **Advanced Calendar View & Event Management:**
    *   Agenda view.
    *   User-customizable colors for calendars and events.
    *   Advanced time zone management (user-selectable primary TZ, display multiple TZs).
    *   Creating a single UCS event that propagates to *multiple* selected native calendars.
    *   Rich text support in event descriptions.
    *   Attendee management from UCS (inviting, tracking RSVPs).
    *   Creating and managing complex recurrence rules from UCS.
    *   UCS-managed event reminders and notifications.
    *   Support for event attachments.
*   **Granular Privacy Controls within UCS:**
    *   Setting event-level privacy (public/private) from UCS that syncs to native platforms.
    *   Controlling which calendars contribute to booking page availability.
*   **AI-Driven Features:**
    *   Scheduling recommendations based on attendee availability within UCS.
    *   Context-aware schedule summaries.
    *   Proactive conflict resolution suggestions.
    *   "Smart" time blocking for tasks or focus.
*   **Task Integration:**
    *   Connecting with popular task management apps (e.g., Todoist, Asana, Trello).
    *   Viewing tasks with due dates in the calendar.
    *   Ability to block time for tasks.
*   **Focus Time Blocking:** Dedicated features to help users schedule and protect focus time.
*   **Native Mobile Applications (iOS, Android).**
*   **Team Features:**
    *   Shared team calendar views.
    *   Team-based scheduling and availability overview.
*   **Advanced Synchronization Controls:**
    *   User control over sync direction (one-way/two-way per calendar).
    *   Manual "Sync Now" button per account with detailed feedback.
    *   More sophisticated conflict resolution options (e.g., user choice on conflict).
*   **Advanced Notifications:**
    *   Proactive in-app and email notifications for sync errors or re-authentication needs.
    *   Customizable notification preferences.
*   **Analytics:** Insights into time spent in meetings, popular meeting times, etc.
