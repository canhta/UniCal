# Functional Requirements Document: Unified Calendar System

## 1. Introduction

This Functional Requirements Document (FRD) specifies the functional requirements for the Unified Calendar System (UCS). The UCS aims to address inefficiencies from fragmented digital scheduling.

**For the initial product, the focus is on core functionalities for a unified view and two-way synchronization for key calendar platforms.**

This FRD is based on the Business Requirements Document (BRD) for UniCal.

## 2. Scope

### 2.1. In Scope (Implemented via Phased Rollout)

*   **User Account Management (Staged Rollout):**
    *   **Initial Phase: Simplified Email-Only Login.**
    *   **Later Phase: Single Sign-On (SSO) - Google & Microsoft.**
    *   **Later Phase: Full Email/Password User Account Management.**
*   **Multi-Platform Connectivity (Core - Google & Outlook - Implemented in early phases):**
    *   Secure connection to Google Calendar (OAuth 2.0).
    *   Secure connection to Microsoft Outlook Calendar (Microsoft Graph API - OAuth 2.0).
*   **Unified Calendar View (Initial Product):**
    *   Consolidated display of events.
    *   Standard Day, Week, and Month views.
    *   Basic visual differentiation for event sources.
    *   Toggle visibility of connected calendars.
*   **Event Management (CRUD Operations - Initial Product):**
    *   Read events.
    *   Create new events (syncs to one selected primary native calendar).
    *   Update existing events.
    *   Delete existing events.
    *   Basic recurrence support (read, display, single instance modification).
*   **Two-Way Synchronization (Initial Product - for core connected platforms):**
    *   Synchronization of core event details.
    *   Conflict resolution: "Last update wins".
*   **Basic Privacy Indication (Initial Product):**
    *   Visually indicate "private" events from source.
*   **Responsive Web Design (Initial Product):**
    *   Usable on common desktop and mobile browsers.
*   **Basic Event Reminders (Initial Product):**
    *   Display reminders from native calendars.

### 2.2. Out of Scope (Initially - Post-Initial Product Features)

*   Advanced User Account Management (beyond initial phases, e.g., detailed profiles).
*   Expanded Multi-Platform Connectivity (e.g., Apple Calendar, direct Zoom integration).
*   Advanced Unified Calendar View Features (e.g., customizable colors, agenda view).
*   Advanced Event Management (e.g., multi-calendar event creation, rich text, attendee management from UCS).
*   Personal Booking Page.
*   Granular Privacy Controls within UCS.
*   AI-Driven Features.
*   Task Integration.
*   Focus Time Blocking.
*   Native Mobile Applications.
*   Advanced Synchronization Controls (e.g., user-controlled sync direction).
*   Advanced Conflict Resolution.
*   UCS-Generated Notifications (beyond basic status).

## 3. Functional Requirements

Functional requirements for the initial product, implemented via a phased strategy, focus on addressing core user pain points: schedule fragmentation, lack of holistic overview, conflict risks, and manual event management inefficiencies.

### 3.1. User Account Management (Staged for Phased Rollout)

*   **FR3.1.0 Simplified Email-Only Login (Initial Phase):**
    *   **User Story:** As a new user, I want to quickly log in using only my email to access basic functionalities.
    *   **Solution:** Email input for login; backend issues JWT. No password initially.
    *   **Acceptance Criteria:** User enters email, receives token, accesses system. No password field.

*   **FR3.1.1 User Registration (Later Phase):**
    *   **User Story:** As a new user, I want to register with email and password for full account features.
    *   **Solution:** Registration page: `Email Address`, `Password`, `Confirm Password`. No email verification for initial product.
    *   **Acceptance Criteria:** Access registration. Error messages for invalid input.

*   **FR3.1.2 User Login (with Password - Later Phase):**
    *   **User Story:** As a registered user, I want to log in with email and password.
    *   **Solution:** Login page: `Email Address`, `Password`. Secure session management.
    *   **Acceptance Criteria:** Successful login. (Post-initial product: account lockout).

*   **FR3.1.3 Single Sign-On (SSO) (Early Phase):**
    *   **User Story:** As a user, I want to sign in with Google or Microsoft.
    *   **Solution:** "Sign in with Google/Microsoft" options. OAuth 2.0 / OpenID Connect. Provision/link UniCal account.
    *   **Acceptance Criteria:** Successful Google/Microsoft SSO. UniCal account created/linked. User logged in.

*   **FR3.1.4 Password Reset (Later Phase):**
    *   **User Story:** As a user, I want to reset my forgotten password.
    *   **Solution:** "Forgot Password?" -> email entry. System sends time-limited tokenized reset link. User sets new password via link.
    *   **Acceptance Criteria:** Request reset. Email with link sent. Set new password. Link single-use. Old password invalid.

*   **FR3.1.5 Profile Management (Simplified - password change only - Later Phase):**
    *   **User Story:** As a logged-in user, I want to change my password.
    *   **Solution:** "Account Settings" -> "Change Password" form (`Current Password`, `New Password`, `Confirm New Password`). Validate current password.
    *   **Acceptance Criteria:** Access change password. Successful password change. Error messages for invalid input.

### 3.2. Multi-Platform Connectivity (Initial Product)

*   **FR3.2.1 Connect Google Calendar:**
    *   **User Story:** As a user, I want to connect my Google Calendar for unified view.
    *   **Solution:** OAuth 2.0 client. "Connect Google Calendar" button -> Google consent screen. Request minimal scopes. Exchange auth code for tokens. Securely store tokens. Allow selection of Google calendars to sync.
    *   **Acceptance Criteria:** Successful Google OAuth. Tokens stored. Account displayed. Calendars selectable. Error handling.

*   **FR3.2.2 Connect Microsoft Outlook/Teams Calendar:**
    *   **User Story:** As a user, I want to connect my Microsoft Outlook calendar.
    *   **Solution:** Similar to Google. OAuth 2.0 client (Azure AD). "Connect Microsoft Calendar" button. Request Graph API permissions. Securely store tokens. Allow selection of Outlook calendars.
    *   **Acceptance Criteria:** Successful Microsoft OAuth. Tokens stored. Account displayed. Calendars selectable. Error handling.

*   **FR3.2.3 Connect Apple Calendar (iCloud):** (Post-Initial Product)

*   **FR3.2.4 Connect Zoom Account:** (Post-Initial Product)

*   **FR3.2.5 Manage Connected Accounts (Initial Product):**
    *   **User Story:** As a user, I want to see and disconnect my connected accounts.
    *   **Solution:** "Integrations" page lists connected accounts (platform, identifier, "Disconnect" button). Disconnecting revokes tokens.
    *   **Acceptance Criteria:** View connected accounts. Disconnect account. UCS stops syncing. (Post-initial product: richer status/re-auth).

*   **FR3.2.6 Authentication Error Handling (Initial Product):**
    *   **Solution:** On OAuth failure/denial, redirect to UCS page with generic error message. Log specific errors.
    *   **Acceptance Criteria:** User informed of connection failures.

### 3.3. Unified Calendar View (Initial Product)

*   **FR3.3.1 Standard Calendar Views:**
    *   **User Story:** As a user, I want day, week, and month views of my aggregated schedule.
    *   **Solution:** JS calendar library. Day, Week, Month views with navigation. Fetch aggregated data from UCS backend.
    *   **Acceptance Criteria:** Functional views display events from selected synced calendars. View switching. Past/future navigation. Current date highlighted.

*   **FR3.3.2 Visual Differentiation of Events (Initial Product):**
    *   **User Story:** As a user, I want events from different platforms visually distinct.
    *   **Solution:** Fixed, non-customizable color per platform (e.g., Google=blue, Outlook=green).
    *   **Acceptance Criteria:** Consistent, distinct colors for Google and Outlook events.

*   **FR3.3.3 Calendar Visibility Toggle (Initial Product):**
    *   **User Story:** As a user, I want to show/hide events from specific connected native calendars.
    *   **Solution:** List of synced native calendars with checkboxes. Unchecking hides events. Preferences stored locally or server-side.
    *   **Acceptance Criteria:** Toggle visibility. View updates. Preferences remembered.

*   **FR3.3.4 Event Display in Views (Initial Product):**
    *   **User Story:** As a user, I want to see essential event details in views and access more by clicking.
    *   **Solution:** Views show title, start time. Hover (desktop): full title, start/end time, source. Click: modal with Title, Start/End, Description (plain text), Location (plain text), Source. Edit/Delete buttons.
    *   **Acceptance Criteria:** Title/start time in cells. Hover details. Click modal with info & actions. Overlapping events indicated.

*   **FR3.3.5 Time Zone Support (Initial Product):**
    *   **User Story:** As a user, I want events displayed in my current system's time zone.
    *   **Solution:** Backend stores times in UTC. Frontend displays in browser's local time zone. Times entered assumed local, converted to UTC.
    *   **Acceptance Criteria:** Events displayed in local TZ. Times correctly converted/stored in UTC.

### 3.4. Event Management (CRUD Operations - Initial Product)

*   **FR3.4.1 Create Event (Initial Product):**
    *   **User Story:** As a user, I want to create an event in UCS, select a target native calendar, and have it sync.
    *   **Solution:** Event creation modal: Title, Start/End, All-day, Target Calendar (dropdown of connected native calendars), Description, Location (all plain text). UCS sends to selected native calendar API.
    *   **Acceptance Criteria:** Create event with core details, select target. Event created on native platform. Appears in UCS view. Error handling.

*   **FR3.4.2 Read Event Details (Initial Product):** (Covered by FR3.3.4)
    *   **User Story:** As a user, I want to view all details of an event.
    *   **Solution:** Per FR3.3.4 click action.
    *   **Acceptance Criteria:** Core details displayed.

*   **FR3.4.3 Update Event (Initial Product):**
    *   **User Story:** As a user, I want to modify events in UCS and have changes sync to the native calendar.
    *   **Solution:** Edit from event details modal. Modify core fields. UCS sends update to native calendar API.
    *   **Acceptance Criteria:** Edit core fields. Changes saved in UCS & synced. Error handling.

*   **FR3.4.4 Delete Event (Initial Product):**
    *   **User Story:** As a user, I want to delete events in UCS and have them removed from the native calendar.
    *   **Solution:** Delete from event details modal with confirmation. UCS sends delete to native calendar API.
    *   **Acceptance Criteria:** Delete event after confirmation. Removed from UCS & native platform. Error handling.

*   **FR3.4.5 Recurring Events (Initial Product - Basic Sync & Display):**
    *   **User Story:** As a user, I want to see recurring events and sync single instance changes.
    *   **Solution:** Read/display recurring events. Sync single instance edits as exceptions. Rely on native calendar recurrence handling.
    *   **Acceptance Criteria:** Recurring events displayed. Single instance edits/deletes sync if API supports. (Creating/editing rules from UCS is post-initial product).

### 3.5. Two-Way Synchronization (Initial Product)

*   **FR3.5.1 Real-time/Near Real-time Sync (Initial Product):**
    *   **User Story:** As a user, I expect changes to sync quickly between UCS and native calendars.
    *   **Solution:** Webhooks (Google/Microsoft) for native-to-UCS. Direct API calls for UCS-to-native. Periodic poll fallback.
    *   **Acceptance Criteria:** Changes via webhooks reflected <1 min. UCS changes to native <1 min. Polling for eventual consistency.

*   **FR3.5.2 Sync Depth (Initial Product):**
    *   **User Story:** As a user, I want core event details accurately synced.
    *   **Solution:** Sync: Title, Start/End (UTC), All-day, Description (plain text), Location (plain text). Basic recurrence.
    *   **Acceptance Criteria:** Specified fields accurately synced.

*   **FR3.5.3 Conflict Resolution (Initial Product):**
    *   **User Story:** As a user, I understand the most recent change wins in conflicts.
    *   **Solution:** "Last update wins" based on native platform's `updated` timestamp.
    *   **Acceptance Criteria:** System consistently applies "last update wins".

*   **FR3.5.4 Sync Control (Initial Product - Calendar Selection):**
    *   **User Story:** As a user, I want to choose which calendars under a connected account are synced.
    *   **Solution:** Post-OAuth, list user's calendars from platform. User selects via checkboxes.
    *   **Acceptance Criteria:** Select/deselect individual calendars. Only selected are synced/displayed.

### 3.6. Personal Booking Page (Moved to Post-Initial Product)

### 3.7. Privacy Controls (Initial Product - Basic Indication)

*   **FR3.7.1 Event-Level Privacy Indication:**
    *   **User Story:** As a user, I want UCS to acknowledge an event's "private" status from the native calendar.
    *   **Solution:** Read native privacy flag. Store with event data. User sees own private events. No change to privacy from UCS in initial product.
    *   **Acceptance Criteria:** UCS reads/stores privacy. User sees own private events.

*   **FR3.7.2 Control over Shared Availability:** (Moved to Post-Initial Product)

### 3.8. AI-Driven Features (Moved to Post-Initial Product)

### 3.9. Notifications (Initial Product - Basic)

*   **FR3.9.1 Event Reminders (Initial Product - Passthrough/Display):**
    *   **User Story:** As a user, I want to see reminders set on my native calendar events.
    *   **Solution:** Fetch/display reminder info from native events in UCS event details modal (text only). UCS does not trigger its own reminders.
    *   **Acceptance Criteria:** Native reminder info displayed. UCS doesn't create/trigger duplicate reminders.

*   **FR3.9.2 Booking Notifications:** (Moved to Post-Initial Product)

*   **FR3.9.3 Sync Status/Error Notifications (Initial Product - Basic):**
    *   **User Story:** As a user, I want to see connection issues on the 'Connected Accounts' page.
    *   **Solution:** "Connected Accounts" page shows basic status. Persistent auth errors may show simple message (e.g., "Connection issue, try reconnecting"). No proactive alerts.
    *   **Acceptance Criteria:** Auth errors result in visible status on "Connected Accounts" page.

## 6. Future Considerations (Post-Initial Launch)

This section outlines features for versions beyond the initial product.

*   **Advanced User Account Management:** Email verification.
*   **Expanded Multi-Platform Connectivity:** Apple Calendar, direct Zoom.
*   **Personal Booking Page:** URL, availability display, event types, customization, buffer times, auto event creation, confirmations.
*   **Advanced Calendar View & Event Management:** Agenda view, customizable colors, advanced TZ management, multi-calendar event creation, rich text, attendee management, advanced recurrence from UCS, UCS-managed reminders, attachments.
*   **Granular Privacy Controls within UCS:** Set privacy from UCS, control booking page availability.
*   **AI-Driven Features:** Scheduling recommendations, summaries, conflict suggestions, smart time blocking.
*   **Task Integration.**
*   **Focus Time Blocking.**
*   **Native Mobile Applications.**
*   **Team Features.**
*   **Advanced Synchronization Controls:** User-controlled direction, manual sync, sophisticated conflict resolution.
*   **Advanced Notifications:** Proactive error/re-auth alerts, customizable preferences.
*   **Analytics.**
