# AI Agent Implementation Plan: UniCal Backend (NestJS)

This plan guides the UniCal backend development, prioritizing a phased rollout (FRD.md, System_Challenges_And_Solutions.md).

**Core Principles:**
*   **DDD:** Organize by domain.
*   **Best Practices:** SOLID, DRY, YAGNI, NestJS standards, testing, error handling, security.
*   **TODO-Driven:** Use `[MODULE_NAME]_PLAN.md` for detailed task checklists.
*   **Iterative Refinement:** Address system challenges progressively.

**Note on FRD Deviation:** Initial simplified login, then SSO, differs from FRD order for faster core feature access.

## Phase 1: Setup & Core Infrastructure

1.  **Project Setup:** Verify NestJS project (ESLint, Prettier, TS).
2.  **Database (Prisma):**
    *   Install Prisma Client.
    *   Define `schema.prisma`:
        *   `User` (Simplified for initial phase: `id`, `email`, `role`. No `password`).
        *   `ConnectedAccount` (Structure for later phase).
        *   `CalendarEvent` (Structure for later phase).
    *   Migration: `prisma migrate dev --name init_simplified_user_schema`
    *   Create `PrismaService`.
3.  **Configuration (`@nestjs/config`):**
    *   `.env`: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TOKEN_EXPIRATION`, `JWT_REFRESH_TOKEN_EXPIRATION`. (Platform/encryption keys added in relevant milestones).
    *   Load via `ConfigService`.
4.  **Module Structure:**
    *   Create basic module/controller/service files for `AuthModule`, `UserModule`, `CalendarPlatformModule`, `ConnectedAccountModule`, `EventModule`, `SyncModule`.
    *   Create `[MODULE_NAME]_PLAN.md` in each module directory.
    *   `EncryptionService`: Define structure in `apps/backend/src/common/encryption/`. Implement in M2.
5.  **Logging:** Implement basic consistent logging.
6.  **API Docs (Swagger):** Setup `@nestjs/swagger`. Define DTO conventions.

## Phase 2: Staged Feature Implementation

**General Guidelines:** DTOs with validation, error handling, unit/integration tests, UTC for dates, Swagger updates.

---
**Simplified User Login & Basic Setup**
*Goal: Email-only login, basic session.*

1.  **`UserModule` (Simplified - `USER_MODULE_PLAN.md`):** User creation (email, default role), find by email.
2.  **`AuthModule` (Simplified - `AUTH_MODULE_PLAN.md`):** Simplified login service (email -> JWT). `POST /auth/simple-login`. JWT strategy & `JwtAuthGuard`.
---
**Single Sign-On (SSO) Implementation**
*Goal: Google & Microsoft SSO.*

1.  **`AuthModule` (SSO Extension - `AUTH_MODULE_PLAN.md`):** OAuth 2.0/OpenID Connect integration. SSO Callbacks, user provisioning/linking. Update `User` model for SSO IDs if needed.
2.  **`CalendarPlatformModule` (OAuth Setup - `CALENDAR_PLATFORM_MODULE_PLAN.md`):** OAuth client logic for Google/Microsoft (auth aspects for SSO).
3.  **`EncryptionService` (`COMMON_UTILS_PLAN.md` or direct):** Implement encryption/decryption for tokens.
4.  **Configuration:** Add Google/Microsoft client IDs/secrets, redirect URIs, `TOKEN_ENCRYPTION_KEY` to `.env` and `ConfigService`.
---
**Core Scheduling Functionalities**
*Goal: Calendar connectivity, unified view, event management, two-way sync.*

1.  **`CalendarPlatformModule` (Full - `CALENDAR_PLATFORM_MODULE_PLAN.md`):** Full `ICalendarPlatformService` for Google/Microsoft (fetch calendars/events, CUD events, webhooks).
2.  **`ConnectedAccountModule` (`CONNECTED_ACCOUNT_MODULE_PLAN.md`):** Manage platform connections, secure token storage/refresh (use `EncryptionService`). List/select native calendars.
3.  **`EventModule` (`EVENT_MODULE_PLAN.md`):** `CalendarEvent` aggregate, CRUD ops (via `CalendarPlatformModule`). Basic recurrence (FRD 3.4.5). Privacy indication (FRD 3.7.1), reminder display (FRD 3.9.1).
4.  **`SyncModule` (`SYNC_MODULE_PLAN.md`):** Two-way sync, webhook ingestion, conflict resolution ("last update wins" - FRD 3.5.3). Initial sync.
---
**Full Email/Password Authentication & Password Management (FRD)**
*Goal: Standard email/password auth, if needed post-SSO.*

1.  **`UserModule` (Full - `USER_MODULE_PLAN.md`):** Add `password` to `User`. Password hashing/update.
2.  **`AuthModule` (Full - `AUTH_MODULE_PLAN.md`):** Register (FRD 3.1.1), Login (FRD 3.1.2), Password Reset (FRD 3.1.4), Change Password (FRD 3.1.5).
---

## Phase 3: System Challenges & Hardening

Refine implementations per `System_Challenges_And_Solutions.md`. Update module plans.

1.  **Auth Security:** Review all auth mechanisms. Token encryption, refresh logic, revocation. Access controls.
2.  **Sync Robustness:** Idempotent webhooks. Message queue (e.g., BullMQ). Data mapping validation. Edge case testing.
3.  **Recurring Events:** RRULE/EXDATE handling. Instance modification.
4.  **API Rate Limiting:** `@nestjs/throttler`. Retry mechanisms in platform clients.
5.  **Time Zones:** Verify UTC adherence.
6.  **Scalability/Reliability:** Stateless services, query optimization, logging.

## Phase 4: Integration & Refinement

1.  **Testing:** Comprehensive unit, integration, E2E tests. High coverage. CI setup.
2.  **Code Quality:** Linting, formatting (CI). Peer reviews.
3.  **API Docs:** Ensure Swagger is complete and accurate.
4.  **Security:** OWASP Top 10 review. Input validation. Security headers.
5.  **Deployment:** Dockerfile. Deployment scripts/CI/CD.

**Agent Workflow:**
1.  **Phase 1:** Execute setup tasks.
2.  **Populate Module Plans:** For each module, fill `[MODULE_NAME]_PLAN.md` with detailed TODOs for the **current phase**, adapting from the comprehensive "Detailed Backend TODO List".
3.  **Phase 2 (Phased Implementation):**
    *   For each phase: Implement features as per module plans. Write tests. Commit frequently.
4.  **Phase 3 (Hardening):** Refine based on system challenges.
5.  **Phase 4 (Refinement):** Finalize testing, docs, deployment prep.

*(Agent: Adapt the previously provided "Detailed Backend TODO List" to populate module plans per phase.)*
