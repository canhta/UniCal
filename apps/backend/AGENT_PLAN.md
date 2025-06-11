<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/backend/AGENT_PLAN.md -->
# AI Agent Implementation Plan: UniCal Backend (NestJS)

This plan guides the UniCal backend development, prioritizing a phased rollout (FRD.md, Challenges.md).

**Core Principles:**
*   **DDD:** Organize by domain.
*   **Best Practices:** SOLID, DRY, YAGNI, NestJS standards, testing, error handling, security.
*   **TODO-Driven:** Use `[MODULE_NAME]_PLAN.md` for detailed task checklists. Populate these from this master plan.
*   **Iterative Refinement:** Address system challenges progressively.

**Note on FRD Deviation:** Initial simplified login, then SSO, differs from FRD order for faster core feature access.

## Phase 1: Setup & Core Infrastructure

**Goal:** Establish a runnable NestJS project with database, basic configuration, core module structure, and essential services.

*   [x] **Project Setup:** Verify NestJS project (ESLint, Prettier, TS).
*   [x] **Database (Prisma):**
    *   Install Prisma Client.
    *   Define `schema.prisma` for `User`, `ConnectedAccount`, `CalendarEvent` (align with respective module plans).
    *   Run migration: `prisma migrate dev --name initial_schema`.
    *   Create `PrismaService`.
*   [x] **Configuration (`@nestjs/config`):**
    *   Setup `.env`: `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`. (Platform client IDs/secrets, Auth0 domain/keys added in relevant milestones).
    *   Implement `ConfigService`.
*   [x] **Module Structure:**
    *   Create skeleton module/controller/service files for `AuthModule`, `UserModule`, `CalendarPlatformModule`, `ConnectedAccountModule`, `EventModule`, `SyncModule`.
    *   Create `[MODULE_NAME]_PLAN.md` in each module directory.
    *   Define `EncryptionService` structure in `apps/backend/src/common/encryption/`. (Implementation in M2).
*   [x] **Logging:** Implement basic, consistent logging framework.
*   [x] **API Docs (Swagger):** Setup `@nestjs/swagger`. Define DTO conventions.

## Phase 2: Staged Feature Implementation

**General Guidelines:** For each sub-phase, ensure DTOs with validation, robust error handling, unit/integration tests, UTC for dates, and Swagger documentation updates.

---
**Sub-Phase 2.1: Simplified User Login & Basic Setup**
*Goal: Enable basic user interaction with the system post-authentication, focusing on Auth0/SSO as the primary mechanism.*

*   [x] **`UserModule` (Simplified - `USER_MODULE_PLAN.md`):** Implement user profile management (`GET /me`, `PUT /me`). User creation/linking primarily handled by Auth0/SSO flow.
*   [x] **`AuthModule` (SSO Focused - `AUTH_MODULE_PLAN.md`):** Implement Auth0 (or other OIDC/OAuth2 provider) integration. Handle callbacks, JWT validation (Auth0 JWKS). Minimal local strategy only if essential for pre-Auth0 testing, marked for deprecation.

---
**Sub-Phase 2.2: Single Sign-On (SSO) & Account Connection**
*Goal: Robust Auth0 (or Google/Microsoft direct) SSO for user login, and ability to connect external calendar accounts.*

*   [x] **`AuthModule` (SSO Login - `AUTH_MODULE_PLAN.md`):** Solidify Auth0/OIDC integration. Handle SSO Callbacks, user provisioning/linking from provider data. Update `User` model fields (`emailVerified`, `firstName`, `lastName`, `picture`) from provider.
*   [ ] **`AccountsModule` (Account Connection - `ACCOUNTS_MODULE_PLAN.md`):**
    *   Implement OAuth 2.0 flow for connecting external calendar accounts (e.g., `/accounts/connect/google`, `/accounts/connect/google/callback`).
    *   Utilize `CalendarPlatformModule` for OAuth client logic.
    *   Securely store external provider tokens in `ConnectedAccount` using `EncryptionService`.
*   [ ] **`CalendarPlatformModule` (OAuth Client Logic - `CALENDAR_PLATFORM_MODULE_PLAN.md`):** Provide services to `AccountsModule` for OAuth token exchange and refresh.
*   [ ] **`EncryptionService` (`apps/backend/src/common/encryption/encryption.service.ts`):** Implement encryption/decryption for external provider tokens.
*   [ ] **Configuration:** Add `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, Google/Microsoft OAuth client IDs/secrets (for account connection), and redirect URIs to `.env` and `ConfigService`.

---
**Sub-Phase 2.3: Core Scheduling Functionalities**
*Goal: Enable calendar connectivity, unified event view, event management, and two-way synchronization.*

*   [ ] **`CalendarPlatformModule` (Full - `CALENDAR_PLATFORM_MODULE_PLAN.md`):** Implement full `ICalendarPlatformService` for Google/Microsoft (fetch calendars/events, CUD events, webhooks).
*   [ ] **`ConnectedAccountModule` (`CONNECTED_ACCOUNT_MODULE_PLAN.md`):** Manage platform connections, secure token storage/refresh. Implement list/select native calendars.
*   [ ] **`EventModule` (`EVENT_MODULE_PLAN.md`):** Implement `CalendarEvent` aggregate, CRUD operations (via `CalendarPlatformModule`). Handle basic recurrence (FRD 3.4.5), privacy indication (FRD 3.7.1), reminder display (FRD 3.9.1).
*   [ ] **`SyncModule` (`SYNC_MODULE_PLAN.md`):** Implement two-way sync, webhook ingestion, conflict resolution (FRD 3.5.3 "last update wins"). Implement initial sync.

---
**Sub-Phase 2.4: Full Email/Password Authentication & Password Management (If Required Post-SSO, as per FRD)**
*Goal: Implement standard email/password authentication and management features if deemed necessary after primary SSO implementation.*

*   [ ] **`UserModule` (Full - `USER_MODULE_PLAN.md`):** Add `password` (hashed) to `User` model. Implement password update logic.
*   [ ] **`AuthModule` (Full - `AUTH_MODULE_PLAN.md`):** Implement registration (FRD 3.1.1), login (FRD 3.1.2), password reset (FRD 3.1.4), change password (FRD 3.1.5) for email/password users.

---

## Phase 3: System Challenges & Hardening

**Goal:** Refine implementations based on `Challenges.md`, focusing on security, robustness, and scalability. Update module plans accordingly.

*   [ ] **Auth Security Review:** Comprehensive review of all authentication mechanisms. Token encryption, refresh logic, revocation, access controls.
*   [ ] **Sync Robustness:** Ensure idempotent webhooks. Consider message queue (e.g., BullMQ). Validate data mapping. Test edge cases.
*   [ ] **Recurring Events:** Implement robust RRULE/EXDATE handling and instance modification logic.
*   [ ] **API Rate Limiting:** Implement `@nestjs/throttler`. Add retry mechanisms in platform client services.
*   [ ] **Time Zones:** Verify strict UTC adherence in backend logic and data storage.
*   [ ] **Scalability/Reliability:** Ensure stateless services where possible. Optimize database queries. Enhance logging.

## Phase 4: Integration & Refinement

**Goal:** Finalize the application with comprehensive testing, complete documentation, security hardening, and deployment readiness.

*   [ ] **Testing:** Achieve high coverage with unit, integration, and E2E tests. Setup and integrate CI.
*   [ ] **Code Quality:** Enforce linting and formatting via CI. Conduct peer reviews.
*   [ ] **API Docs:** Ensure Swagger documentation is complete, accurate, and user-friendly.
*   [ ] **Security:** Perform OWASP Top 10 review. Ensure comprehensive input validation and security headers.
*   [ ] **Deployment:** Finalize Dockerfile. Prepare deployment scripts and CI/CD pipeline.

**Agent Workflow:**
1.  **Understand Phase Goals:** For each phase and sub-phase, internalize the objectives.
2.  **Populate Module Plans:** For each module, populate its `[MODULE_NAME]_PLAN.md` with detailed, actionable TODOs derived from the goals of the **current phase/sub-phase**. These module plans are the granular checklists.
3.  **Implement Incrementally:** Execute tasks from module plans. Write tests alongside features. Commit frequently with clear messages.
4.  **Iterate & Refine:** Address challenges and refine implementations as you proceed.
5.  **Seek Clarification:** If any task is ambiguous, request clarification before proceeding.

*(Agent: Adapt the previously provided "Detailed Backend TODO List" or generate new detailed tasks to populate module plans according to each phase's requirements.)*
