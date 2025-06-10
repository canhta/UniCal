# Challenges and Solutions

## 0. Key AI Agent Directives

*   **Development Order:** This document supports the 4-Milestone plan detailed in `apps/backend/AGENT_PLAN.md` and `apps/frontend/AGENT_PLAN.md`.
*   **Focus:** The AI agent should refer to this document for guidance on *how* to approach specific technical challenges encountered during the milestone-based implementation described in `FRD.md` and the `AGENT_PLAN.md` files.
*   **Conciseness:** This document provides targeted solutions for known challenges. Broader requirements are in `FRD.md`.

This document outlines key technical challenges anticipated during the implementation of the UniCal Minimum Viable Product (MVP) and proposes actionable solutions or approaches. It is intended to be a living document, updated as development progresses.

## 1. Two-Way Synchronization

**Challenge:** Ensuring timely, reliable, and consistent two-way synchronization of event data between UniCal and multiple native calendar platforms (Google Calendar, Microsoft Outlook Calendar) while minimizing API rate limit issues and handling potential conflicts.

**FRD References:** 3.4 (Event Management), 3.5 (Two-Way Synchronization)

**Proposed Solutions & Implementation Notes:**

*   **Real-time/Near Real-time Updates (Native to UniCal):**
    *   **Mechanism:** Utilize platform-specific push notifications/webhooks.
        *   **Google Calendar:** Google Calendar API Push Notifications. Requires a publicly accessible HTTPS endpoint on UniCal's backend.
        *   **Microsoft Outlook Calendar:** Microsoft Graph API Change Notifications (webhooks). Similar HTTPS endpoint requirement.
    *   **Action:** UniCal backend subscribes to changes for each connected calendar. Upon receiving a notification, UniCal fetches the specific changed event(s) using the event ID.
    *   **Challenge Mitigation:**
        *   **Webhook Management:** Robustly manage webhook subscriptions (creation, renewal, deletion upon account disconnect).
        *   **Scalability:** Design the webhook ingestion endpoint to handle concurrent notifications.
        *   **Security:** Validate incoming webhook notifications (e.g., using secrets or signature verification if provided by the platform).

*   **Real-time/Near Real-time Updates (UniCal to Native):**
    *   **Mechanism:** Direct API calls upon event CUD (Create, Update, Delete) operations within UniCal.
    *   **Action:** When a user saves an event in UniCal, the backend immediately makes an API call to the target native calendar to create, update, or delete the event.
    *   **Challenge Mitigation:**
        *   **Atomicity:** Consider how to handle partial failures (e.g., if saving to UniCal DB succeeds but native API call fails). Implement retry mechanisms with backoff.
        *   **API Rate Limits:** Be mindful of per-user/per-app rate limits. Queue updates if necessary, though for MVP, direct calls are prioritized.

*   **Fallback Synchronization (Periodic Polling):**
    *   **Mechanism:** Scheduled background jobs that periodically poll each connected native calendar for changes.
    *   **Action:** For each synced calendar, UniCal makes an API call (e.g., `events.list` with `updatedMin` or sync tokens if available) to fetch changes since the last poll.
    *   **Frequency:** Configurable, e.g., every 5-15 minutes. Balance between freshness and API usage.
    *   **Challenge Mitigation:**
        *   **Efficiency:** Use sync tokens (Google) or delta links (Microsoft Graph) where possible to fetch only changes, reducing data transfer and processing.
        *   **Redundancy:** This acts as a catch-all for missed webhooks or platforms without robust push notifications.

*   **Conflict Resolution (FR3.5.3):**
    *   **Mechanism:** "Last update wins" based on the event's `updated` timestamp from the native platform.
    *   **Action:**
        *   Store the native platform's `updated` timestamp for each synced event in UniCal's database.
        *   When an update comes from a native platform (webhook/poll), compare its `updated` timestamp with the stored one. If newer, apply the update.
        *   When UniCal pushes an update, it assumes its version is the latest. The native platform's subsequent `updated` timestamp will reflect this.
    *   **Consideration:** Ensure consistent timestamp handling (UTC).

*   **Data Model for Sync:**
    *   UniCal's event model should store:
        *   `native_event_id`: The ID of the event on the source platform.
        *   `native_calendar_id`: The ID of the calendar on the source platform.
        *   `platform_source`: (e.g., 'google', 'microsoft').
        *   `last_synced_timestamp_from_native`: The `updated` timestamp from the native event.
        *   All core event fields (title, start, end, description, location, all-day status, recurrence rule, privacy).
    *   **Consideration:** The model must be flexible enough to accommodate platform-specific fields or metadata that might be crucial for "deep synchronization" (e.g., unique meeting join URLs, specific reminder configurations not covered by a generic model).

*   **Platform-Specific Data Mapping and Transformation:**
    *   **Challenge:** Achieving "deep synchronization" (as per BRD Gap 1) requires more than one-to-one field mapping. Native platforms have unique features, custom fields, and ways of structuring event data (e.g., Google Meet link integration vs. Teams).
    *   **Solution Approach:** Implement an adapter or transformation layer for each supported platform. This layer will be responsible for:
        *   Translating incoming native event data into UniCal's canonical event model, preserving or mapping platform-specific details where possible.
        *   Translating UniCal event data back into the specific format required by the target native platform when creating/updating events.
        *   Handling nuances like different reminder systems, event color interpretations, or privacy setting terminologies.

*   **Handling Multi-Platform Native Event Instances (Future Challenge - Post-MVP):**
    *   **Challenge:** The BRD mentions "intelligent cross-platform event management" (Gap 3), which could imply creating a single conceptual event in UniCal that then exists *natively* on multiple selected platforms (e.g., an event created on both a user's Google Calendar and their work Outlook calendar).
    *   **Complexities:**
        *   Managing multiple `native_event_id`s for one UniCal event.
        *   Propagating updates/deletions to all native instances consistently.
        *   Handling scenarios where one platform supports a feature (e.g., a specific recurrence type) that another doesn't.
        *   Deciding which platform is the "source of truth" or how to merge conflicting changes if updates happen on multiple native instances simultaneously.
    *   **MVP Simplification:** For MVP, an event created in UniCal targets *one* native calendar. Events are aggregated for viewing, but an edit in UniCal edits the original native event.

## 2. Handling Recurring Events

**Challenge:** Accurately representing, creating, updating, and deleting instances of recurring events, including exceptions, and ensuring these are synced correctly with native platforms that have varied ways of handling recurrence.

**FRD References:** FR3.4.5 (Recurring Events - Basic Sync & Display)

**Proposed Solutions & Implementation Notes:**

*   **Reading and Displaying Recurring Events:**
    *   **Mechanism:** Fetch the recurrence rule (e.g., RRULE, EXDATE) and any exception data from the native calendar.
    *   **Action:**
        *   UniCal's backend will need a library or custom logic to parse RRULEs and expand them into individual occurrences for a given date range for display in the frontend.
        *   Store the master recurring event's details and its recurrence rule.
        *   Native platforms might send individual occurrences for a series or a master event with a rule. Handle both.
    *   **MVP Scope:** Focus on displaying existing recurring events and their instances correctly.

*   **Editing Single Instances of Recurring Events (MVP):**
    *   **Mechanism:** When a user modifies a single instance (e.g., changes time/title), UniCal needs to communicate this as an "exception" to the native platform.
    *   **Action:**
        *   The native platform's API usually allows updating a single instance of a recurring event, which creates an exception to the rule. UniCal will use this.
        *   UniCal needs to store this exception information or re-fetch the series to see the change.
    *   **Challenge:** The exact API call and parameters differ between Google and Microsoft.

*   **Deleting Single Instances of Recurring Events (MVP):**
    *   **Mechanism:** Similar to editing, delete a specific instance, which often means creating a cancellation or an EXDATE for that instance on the native platform.
    *   **Action:** Use the native API to delete the specific occurrence.
    *   **MVP Scope:** Deleting the entire series from UniCal is Post-MVP. Focus on single instance deletion.

*   **Creating New Recurring Events (Post-MVP from UniCal):**
    *   This is complex due to the need to construct valid RRULEs and ensure compatibility. For MVP, creation of new recurring events *from UniCal* is out of scope. Users create them on their native calendars.

*   **Syncing Recurrence:**
    *   **Mechanism:** Sync the recurrence rule string (e.g., RRULE) and any exception data (like modified or cancelled instances' original dates and new details).
    *   **Challenge:** Ensure the RRULE syntax and interpretation are consistent or correctly mapped between UniCal and the native platforms.

## 3. API Rate Limiting and Quotas

**Challenge:** Operating within the API rate limits and quotas imposed by Google and Microsoft, especially with an increasing number of users and connected calendars.

**Proposed Solutions & Implementation Notes:**

*   **Efficient API Usage:**
    *   **Webhooks:** Prioritize webhooks over polling to reduce unnecessary API calls.
    *   **Sync Tokens/Delta Links:** Use these for polling to fetch only changes.
    *   **Batch Requests:** Where supported by APIs, batch multiple operations (e.g., fetching details for several events) into a single API call.
    *   **Selective Sync:** Only sync data that is necessary for MVP functionality (core event fields).

*   **Error Handling and Retries:**
    *   Implement exponential backoff strategies for API calls that fail due to rate limiting.
    *   Log rate limit errors for monitoring.

*   **User-Level Throttling (Future):**
    *   If specific users or accounts cause excessive API usage, consider implementing per-user throttling on UniCal's side for polling frequency.

*   **Monitoring:**
    *   Monitor API usage against quotas through the respective developer consoles (Google Cloud Platform, Azure Portal).

## 4. Authentication and Authorization (OAuth 2.0)

**Challenge:** Securely managing OAuth 2.0 tokens (access tokens, refresh tokens) for multiple users and platforms, handling token expiry and revocation.

**FRD References:** 3.2 (Multi-Platform Connectivity)

**Proposed Solutions & Implementation Notes:**

*   **Token Storage:**
    *   Securely encrypt and store refresh tokens in UniCal's database. Access tokens can be short-lived and stored in memory (e.g., Redis cache) or fetched using refresh tokens when needed.
    *   Associate tokens with the UniCal user ID and the specific connected account.

*   **Token Refresh:**
    *   Proactively refresh access tokens before they expire using the stored refresh tokens.
    *   Implement logic to handle cases where refresh tokens also expire or are revoked.

*   **Token Revocation:**
    *   When a user disconnects an account from UniCal, ensure that UniCal revokes the stored tokens with the provider (if the API supports it) and deletes them from its database.

*   **Scope Management:**
    *   Request only the necessary OAuth scopes for MVP functionality (e.g., `calendar.readonly` and `calendar.events` for Google, `Calendars.ReadWrite` for Microsoft).

*   **Error Handling:**
    *   Clearly guide users through re-authentication if tokens become invalid and cannot be refreshed (e.g., user changed password, revoked permissions manually on the provider side).

## 5. Time Zone Handling

**Challenge:** Consistently handling and displaying event times across different time zones, and ensuring correct conversion when syncing with native calendars.

**FRD References:** FR3.3.5 (Time Zone Support)

**Proposed Solutions & Implementation Notes:**

*   **Storage:** Store all event start and end times in UTC in UniCal's database.
*   **Native Platform Data:** Native calendars usually provide events with time zone information or as UTC. Convert to UTC upon ingestion if not already, carefully preserving the original time zone information if needed for display or round-tripping complex recurrence rules.
*   **Display:** The frontend fetches UTC times from the UniCal backend and converts them to the user's browser-detected local time zone for display.
*   **Event Creation/Editing in UniCal:**
    *   Assume times entered by the user are in their local time zone.
    *   The frontend converts these local times to UTC before sending them to the backend.
    *   The backend sends UTC times to native platforms, which then handle them according to their own time zone settings. It's crucial to also send the appropriate time zone identifier if the native API requires it for correct interpretation (especially for all-day events or events spanning DST transitions).
*   **Libraries:** Use robust date/time libraries (e.g., `date-fns-tz`, `luxon` in JavaScript; corresponding libraries in the backend language) for conversions and time zone management.

## 6. System Scalability and Reliability

**Challenge:** Ensuring the system remains performant, reliable, and scalable as the number of users, connected accounts, and synced events grows, as highlighted by the BRD's emphasis on handling "numerous platform connections and the continuous flow of real-time data."

**Proposed Solutions & Implementation Notes:**

*   **Database Scalability:**
    *   **Choice of Database:** Select a database solution that can scale horizontally or vertically based on read/write loads (e.g., PostgreSQL with read replicas, NoSQL options like Cassandra or DynamoDB for specific workloads if appropriate).
    *   **Schema Design:** Optimize schema for common query patterns. Use appropriate indexing, especially for user IDs, calendar IDs, event timestamps, and sync tokens.
    *   **Connection Pooling:** Implement robust database connection pooling.

*   **Backend Service Scalability:**
    *   **Stateless Services:** Design backend services (API handlers, webhook processors, polling workers) to be stateless where possible, allowing for horizontal scaling.
    *   **Asynchronous Processing:** Utilize message queues (e.g., RabbitMQ, Kafka, Redis Streams) to decouple intensive tasks like webhook processing, outgoing sync operations, and polling from the initial request-response cycle. This improves responsiveness and allows workers to scale independently.
    *   **Load Balancing:** Implement load balancers in front of backend services to distribute traffic.

*   **Infrastructure and Operations:**
    *   **Containerization & Orchestration:** Use technologies like Docker and Kubernetes for easier deployment, scaling, and management of services.
    *   **Monitoring & Alerting:** Implement comprehensive monitoring (e.g., Prometheus, Grafana, Datadog) for system metrics (CPU, memory, disk I/O), application performance (request latency, error rates), queue lengths, and API usage against quotas. Set up alerts for critical issues.
    *   **Logging:** Centralized logging (e.g., ELK stack, Splunk) for easier debugging and auditing.

*   **API Client Robustness:**
    *   Ensure API clients for Google/Microsoft are resilient, handle transient errors gracefully, and implement retry mechanisms with exponential backoff as already mentioned in Section 3.

## 7. Future Challenges (Post-MVP Considerations from BRD)

This section outlines system-level challenges for features and capabilities identified in the BRD as important for long-term success but likely Post-MVP.

*   **Mobile Accessibility Support:**
    *   **Challenge:** The BRD identifies mobile accessibility as a key market trend. If native mobile applications are planned post-MVP, the backend system needs to be prepared.
    *   **System Considerations:**
        *   **API Design for Mobile:** APIs might need to be optimized for mobile clients (e.g., using GraphQL for flexible data fetching, minimizing payload sizes).
        *   **Push Notifications to Mobile:** Infrastructure for sending push notifications (e.g., via FCM for Android, APNS for iOS) to mobile apps for event reminders or sync status updates.
        *   **Offline Support Strategy:** While primarily a client-side concern, the backend might need to support data synchronization strategies that accommodate intermittent mobile connectivity.

*   **AI and Automation Integration:**
    *   **Challenge:** The BRD highlights AI and automation as significant opportunities (e.g., context-aware summaries, scheduling recommendations). Integrating these features post-MVP will have system-level implications.
    *   **System Considerations:**
        *   **Data Collection & Preparation:** Identify and structure the data needed for AI model training and inference (e.g., anonymized event patterns, user scheduling preferences, feedback on suggestions). Ensure data privacy and compliance.
        *   **AI Model Serving Infrastructure:** Plan for how AI models will be deployed, managed, and scaled (e.g., dedicated model serving platforms, serverless functions).
        *   **API Endpoints for AI Features:** Design APIs for AI modules to consume necessary data and for UniCal to retrieve AI-generated insights or actions.
        *   **Feedback Loops:** Mechanism for collecting user feedback on AI suggestions to improve models over time.

This initial list covers some of the most significant challenges. Further details and new challenges may emerge during development.
