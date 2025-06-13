<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/backend/AGENT_PLAN.md -->
# AI Agent Implementation Plan: UniCal Backend (NestJS)

This plan guides the UniCal backend development, prioritizing a phased rollout (FRD.md, Challenges.md).

**Core Principles:**
*   **DDD:** Organize by domain.
*   **Best Practices:** SOLID, DRY, YAGNI, NestJS standards, testing, error handling, security.
*   **TODO-Driven:** Use `[MODULE_NAME]_PLAN.md` for detailed task checklists. Populate these from this master plan.
*   **Iterative Refinement:** Address system challenges progressively.

## Phase 1: Setup & Core Infrastructure

**Goal:** Establish a runnable NestJS project with database, basic configuration, core module structure, and essential services.

*   [x] **Project Setup:** Verify NestJS project (ESLint, Prettier, TS).
*   [x] **Database (Prisma):**
    *   Install Prisma Client.
    *   Define `schema.prisma` for `User` (unified model), `Role`, `UserRole` (join table), `Lead`, `ConnectedAccount`, `CalendarEvent` (align with respective module plans).
    *   Run migration: `prisma migrate dev --name initial_schema_unified_user_lead`.
    *   Create `PrismaService`.
*   [x] **Configuration (`@nestjs/config`):**
    *   Setup `.env`: `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`.
    *   Implement `ConfigService`.
*   [x] **Module Structure:**
    *   Create skeleton module/controller/service files for `AuthModule`, `UserModule` (unified), `RoleModule`, `LeadModule`, `CalendarPlatformModule`, `ConnectedAccountModule`, `EventModule`, `SyncModule`.
    *   Create `[MODULE_NAME]_PLAN.md` in each module directory.
    *   Define `EncryptionService` structure in `apps/backend/src/common/encryption/`. (Implementation in M2).
*   [x] **Logging:** Implement basic, consistent logging framework.
*   [x] **API Docs (Swagger):** Setup `@nestjs/swagger`. Define DTO conventions.

## Phase 2: Staged Feature Implementation

**General Guidelines:** For each sub-phase, ensure DTOs with validation, robust error handling, unit/integration tests, UTC for dates, and Swagger documentation updates.

---
**Sub-Phase 2.1: Unified User Login & Basic Setup**
*Goal: Enable basic user interaction with the system post-authentication, focusing on a unified user model and standard username/password mechanism initially.*

*   [ ] **`UserModule` (Unified Model - `USER_MODULE_PLAN.md`):** Implement user profile management (`GET /users/me`, `PUT /users/me`) for the unified `User` model. User creation to handle different user types via roles.
*   [ ] **`AuthModule` (Username/Password Focused - `AUTH_MODULE_PLAN.md`):** Implement standard username/password authentication. JWT validation and refresh logic. Authorization to consider multiple roles.
*   [ ] **`RoleModule` (`ROLE_MODULE_PLAN.md`):** Basic CRUD for `Role` entities (likely admin-only later). Service for assigning/unassigning roles to users (`UserRole` table).

---
**Sub-Phase 2.2: Account Connection**
*Goal: Ability to connect external calendar accounts for event synchronization.*

*   [x] **`AccountsModule` (Account Connection - `ACCOUNTS_MODULE_PLAN.md`):**
    *   Implement logic for connecting external calendar accounts (e.g., `/accounts/connect/google`, `/accounts/connect/google/callback`).
    *   Utilize `CalendarPlatformModule` for client logic.
    *   Securely store external provider tokens in `ConnectedAccount` using `EncryptionService`.
*   [x] **`CalendarPlatformModule` (Client Logic - `CALENDAR_PLATFORM_MODULE_PLAN.md`):** Provide services to `AccountsModule` for token exchange and refresh.
*   [x] **`EncryptionService` (`apps/backend/src/common/encryption/encryption.service.ts`):** Implement encryption/decryption for external provider tokens.
*   [x] **Configuration:** Add Google/Microsoft OAuth client IDs/secrets (for account connection), and redirect URIs to `.env` and `ConfigService`.

---
**Sub-Phase 2.3: Core Scheduling Functionalities**
*Goal: Enable calendar connectivity, unified event view, event management, and two-way synchronization.*

*   [ ] **`CalendarPlatformModule` (Full - `CALENDAR_PLATFORM_MODULE_PLAN.md`):** Implement full `ICalendarPlatformService` for Google/Microsoft (fetch calendars/events, CUD events, webhooks).
*   [ ] **`ConnectedAccountModule` (`CONNECTED_ACCOUNT_MODULE_PLAN.md`):** Manage platform connections, secure token storage/refresh. Implement list/select native calendars.
*   [ ] **`EventModule` (`EVENT_MODULE_PLAN.md`):** Implement `CalendarEvent` aggregate, CRUD operations (via `CalendarPlatformModule`). Handle basic recurrence (FRD 3.4.5), privacy indication (FRD 3.7.1), reminder display (FRD 3.9.1).
*   [ ] **`SyncModule` (`SYNC_MODULE_PLAN.md`):** Implement two-way sync, webhook ingestion, conflict resolution (FRD 3.5.3 "last update wins"). Implement initial sync.

---
**Sub-Phase 2.4: Password Management (If Required)**
*Goal: Implement password management features if deemed necessary after primary feature implementation for non-SSO users.*

*   [ ] **`UserModule` (Full - `USER_MODULE_PLAN.md`):** Add `password` (hashed) to unified `User` model. Implement password update logic.
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

---

## Phase 5: Admin Panel MVP Backend

**Goal:** Implement backend functionalities for the Admin Panel MVP as defined in `docs/Admin_FRD.md` (updated for unified user and lead management).

*   [ ] **`AdminModule` (`ADMIN_MODULE_PLAN.md`):**
    *   [ ] **Authentication & Authorization:** Integrate with Auth0 for admin-roled users. Implement RBAC considering multiple roles (e.g., `Super Admin`, `Admin`) for accessing admin functionalities (FR-USER-006-MVP, FR-USER-007-MVP).
    *   [ ] **Unified User Management (within `UserModule` primarily, accessed via `AdminModule`):**
        *   Endpoints to list all users with filters (by role, status) (FR-USER-001-MVP).
        *   Endpoints to view user details (FR-USER-002-MVP).
        *   Endpoints for creating users (manual, assigning roles) (FR-USER-003-MVP).
        *   Endpoints for updating users (basic info, status, roles) (FR-USER-004-MVP).
        *   Endpoints for (soft) deleting users (Super Admin role only) (FR-USER-005-MVP).
        *   (Leverage `UserModule` and `RoleModule` services).
    *   [ ] **Lead Management (`LeadModule` - `LEAD_MODULE_PLAN.md`, accessed via `AdminModule`):**
        *   Endpoints for creating leads (FR-LEAD-001-MVP).
        *   Endpoints to list leads with filters (FR-LEAD-002-MVP).
        *   Endpoints to view lead details (FR-LEAD-003-MVP).
        *   Endpoints for updating leads (info, status) (FR-LEAD-004-MVP).
        *   Endpoints for converting a lead to a user (creates a User record with appropriate role(s)) (FR-LEAD-005-MVP).
        *   Endpoints for (soft) deleting leads (FR-LEAD-006-MVP).
    *   [ ] **Dashboard Data:** Implement endpoint to provide data for the simplified admin dashboard (FR-GEN-002-MVP, reflecting unified users).
    *   [ ] **Global Search (Users & Leads):** Implement endpoint for searching users and leads (FR-GEN-003-MVP).
    *   [ ] **Audit Logging:** Implement service to record and retrieve audit logs for critical actions on Users (all types) and Leads (FR-GEN-004-MVP).
    *   [ ] **CRM Data (Proxy/Read - User focused):** Implement endpoints to view user contact info and basic interaction logs (FR-CRM-001-MVP, FR-CRM-002-MVP - focused on User entity).
    *   [ ] **Subscription Data (Proxy/Read & Cancel - for Users with 'Client' role):** Implement endpoints to view subscription plans, user subscriptions, and initiate subscription cancellations (FR-SUB-001-MVP, FR-SUB-002-MVP, FR-SUB-003-MVP - linked to User entity).
    *   [ ] **API Documentation:** Ensure all Admin Panel API endpoints are documented with Swagger.
    *   [ ] **Testing:** Write unit and integration tests for all Admin Panel functionalities, including user and lead management.

*(Agent: Populate `apps/backend/src/admin/ADMIN_MODULE_PLAN.md`, `apps/backend/src/user/USER_MODULE_PLAN.md`, `apps/backend/src/role/ROLE_MODULE_PLAN.md`, and `apps/backend/src/lead/LEAD_MODULE_PLAN.md` with detailed tasks based on `Admin_FRD.md` and the above items.)*

## Phase 6: Integration & Refinement (Renumbered from Phase 4)

**Goal:** Finalize the application with comprehensive testing, complete documentation, security hardening, and deployment readiness.

*   [ ] **Testing:** Achieve high coverage with unit, integration, and E2E tests. Setup and integrate CI.
*   [ ] **Code Quality:** Enforce linting and formatting via CI. Conduct peer reviews.
*   [ ] **API Docs:** Ensure Swagger documentation is complete, accurate, and user-friendly for all modules.
*   [ ] **Security:** Perform OWASP Top 10 review. Ensure comprehensive input validation and security headers.
*   [ ] **Deployment:** Finalize Dockerfile. Prepare deployment scripts and CI/CD pipeline.

**Agent Workflow:**
1.  **Understand Phase Goals:** For each phase and sub-phase, internalize the objectives.
2.  **Populate Module Plans:** For each module, populate its `[MODULE_NAME]_PLAN.md` with detailed, actionable TODOs derived from the goals of the **current phase/sub-phase**, reflecting the unified user model, multi-role RBAC, and lead management. These module plans are the granular checklists.
3.  **Implement Incrementally:** Execute tasks from module plans. Write tests alongside features. Commit frequently with clear messages.
4.  **Iterate & Refine:** Address challenges and refine implementations as you proceed.
5.  **Seek Clarification:** If any task is ambiguous, request clarification before proceeding.

*(Agent: Adapt the previously provided "Detailed Backend TODO List" or generate new detailed tasks to populate module plans according to each phase's requirements.)*
