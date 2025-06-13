# Admin Module Plan (Backend - MVP)

This plan outlines the backend tasks for implementing the Admin Panel MVP, based on `docs/Admin_FRD_MVP.md` and `apps/backend/AGENT_PLAN.md Phase 5`.

## Core Setup
- [x] Create `AdminModule` in `apps/backend/src/admin/admin.module.ts`.
- [x] Define `AdminController` (`admin.controller.ts`) and `AdminService` (`admin.service.ts`).
- [x] Configure routing for `/admin/*` endpoints.
- [x] Define base DTOs for pagination requests (e.g., `PageOptionsDto`) and responses (e.g., `PageDto<T>`).

## Authentication & Authorization (FR-AUSER-004-MVP, FR-AUSER-005-MVP)
- [ ] Integrate Auth0 for Admin Panel administrators.
    - [ ] Configure Auth0 application for Admin Panel (Client ID, Secret, Domain, Callback URLs).
    - [ ] Implement Auth0 strategy for NestJS (e.g., create `AdminAuth0Strategy` extending `PassportStrategy(Auth0Strategy)` if different from client app, or configure existing `AuthModule` to handle admin-specific Auth0 app).
    - [ ] Secure Admin Panel endpoints using Auth0 JWTs and `@UseGuards(AuthGuard(\'auth0-admin\'))` or similar.
- [x] Implement Role-Based Access Control (RBAC).
    - [x] Define `RolesGuard` (e.g., `AdminRolesGuard`) for `Super Admin` and `Admin` roles.
    - [x] Define decorators for roles (e.g., `@AdminRoles(\'SuperAdmin\')`).
    - [x] Define `AdminUser` Prisma model:
        - [x] `id String @id @default(cuid())`
        - [x] `auth0UserId String @unique` (Subject claim from Auth0 token)
        - [x] `email String @unique`
        - [x] `fullName String?`
        - [x] `role String` (e.g., "SuperAdmin", "Admin")
        - [x] `status String` (e.g., "Active", "Inactive")
        - [x] `createdAt DateTime @default(now())`
        - [x] `updatedAt DateTime @updatedAt`
        - [x] `auditLogs AuditLog[]` (Relation to AuditLog model)
    - [x] Ensure `AdminUser` entity in `AdminService` reflects this model.

## Admin User Management (Super Admin Only)
- **FR-AUSER-001-MVP: View Admin User List**
    - [ ] Endpoint: `GET /admin/users/admins` (e.g., `admin/admins` for clarity if `/admin/users` is for client users)
    - [ ] Service method to fetch admin users (ID, FullName, Email, Role, Status).
    - [ ] Implement pagination.
- **FR-AUSER-002-MVP: Create Admin User**
    - [ ] Endpoint: `POST /admin/users/admins`
    - [ ] DTO for creating admin user (FullName, Email, Role). Ensure validation.
    - [ ] Service method to:
        - [ ] Check for unique email in `AdminUser` table.
        - [ ] Integrate with Auth0 to invite user (or create user in Auth0).
        - [ ] Store admin user record in local DB (link to Auth0 User ID).
        - [ ] Record audit log.
- **FR-AUSER-003-MVP: Update Admin User (Role & Status)**
    - [ ] Endpoint: `PUT /admin/users/admins/:id` (or `admin/admins/:id`)
    - [ ] DTO for updating admin user (Role, Status). Ensure validation.
    - [ ] Service method to:
        - [ ] Update role/status in local DB.
        - [ ] Potentially update role/status in Auth0 if managed there.
        - [ ] Prevent self-deactivation/demotion if sole Super Admin.
        - [ ] Record audit log.

## Client User Management (Proxy/Interact with Main App DB/API)
- **FR-CUSER-001-MVP: View Client User List**
    - [ ] Endpoint: `GET /admin/users/clients` (or `admin/client-users`)
    - [ ] Service method to fetch client users from main app DB/API (ID, FullName, Email, Status, RegistrationDate).
    - [ ] Implement pagination, sorting, filtering (by Status).
- **FR-CUSER-002-MVP: View Client User Details**
    - [ ] Endpoint: `GET /admin/users/clients/:id` (or `admin/client-users/:id`)
    - [ ] Service method to fetch detailed client user info (including subscription status via main app DB/API).
- **FR-CUSER-003-MVP: Create Client User (Manual)**
    - [ ] Endpoint: `POST /admin/users/clients` (or `admin/client-users`)
    - [ ] DTO for creating client user (FullName, Email, InitialPassword handling). Ensure validation.
    - [ ] Service method to create user in main app DB/API.
    - [ ] Handle welcome/verification email trigger (if applicable).
    - [ ] Record audit log.
- **FR-CUSER-004-MVP: Update Client User (Basic Info & Status)**
    - [ ] Endpoint: `PUT /admin/users/clients/:id` (or `admin/client-users/:id`)
    - [ ] DTO for updating client user (FullName, PhoneNumber, Status). Ensure validation.
    - [ ] Service method to update user in main app DB/API.
    - [ ] Record audit log for status changes.
- **FR-CUSER-005-MVP: Delete Client User (Soft Delete - Super Admin Only)**
    - [ ] Endpoint: `DELETE /admin/users/clients/:id` (or `admin/client-users/:id`)
    - [ ] Service method to soft-delete user in main app DB/API (e.g., set status to 'Deleted').
    - [ ] Record audit log.

## General Admin Panel Features
- **FR-GEN-002-MVP: Admin Dashboard Data**
    - [ ] Endpoint: `GET /admin/dashboard/stats`
    - [ ] Service method to aggregate KPIs (total client users, new registrations, active subscriptions) by querying main app DB/API.
- **FR-GEN-003-MVP: Global Search (Client Users)**
    - [ ] Endpoint: `GET /admin/search/clients?query=<search_term>`
    - [ ] Service method to search client users by name/email in main app DB/API.
- **FR-GEN-004-MVP: Audit Logging**
    - [ ] Define `AuditLog` Prisma model:
        - [ ] `id String @id @default(cuid())`
        - [ ] `timestamp DateTime @default(now())`
        - [ ] `performingAdminUserId String`
        - [ ] `performingAdminUser AdminUser @relation(fields: [performingAdminUserId], references: [id])`
        - [ ] `actionType String` (e.g., "CREATE_CLIENT_USER", "UPDATE_ADMIN_ROLE")
        - [ ] `affectedEntityId String?`
        - [ ] `affectedEntityType String?`
        - [ ] `details Json?` (For storing old/new values or other relevant info).
    - [ ] Create `AuditLogService`.
        - [ ] Method: `recordAudit(adminUserId, action, entityId, entityType, details)`
    - [ ] Integrate `AuditLogService` into relevant User Management methods (Admin and Client).
    - [ ] Endpoint: `GET /admin/audit-logs`
        - [ ] Service method to retrieve audit logs with filtering (date range, PerformingAdminUserID).
        - [ ] Implement pagination.

## CRM Module (MVP - Read-Only Proxy)
- **FR-CRM-001-MVP: View Client User Contact Information**
    - [ ] (Covered by FR-CUSER-002-MVP - ensure contact fields are included).
- **FR-CRM-002-MVP: View Client User Basic Interaction Log**
    - [ ] Endpoint: `GET /admin/users/clients/:id/interaction-log` (or `admin/client-users/:id/interaction-log`)
    - [ ] Service method to fetch basic interaction log from main app DB/API (Account Created, Password Reset, Subscription Started/Canceled).

## Subscription Management Module (MVP - Read-Only Proxy & Cancel)
- **FR-SUB-001-MVP: View Subscription Plan List**
    - [ ] Endpoint: `GET /admin/subscriptions/plans`
    - [ ] Service method to fetch subscription plans from main app DB/API (PlanID/Name, Description, Price, BillingFrequency).
- **FR-SUB-002-MVP: View Client User Subscription Details**
    - [ ] (Covered by FR-CUSER-002-MVP - ensure subscription details are included).
- **FR-SUB-003-MVP: Cancel Client User Subscription (Admin Initiated)**
    - [ ] Endpoint: `POST /admin/users/clients/:userId/subscriptions/:subscriptionId/cancel` (or `admin/client-users/:userId/subscriptions/:subscriptionId/cancel`)
    - [ ] DTO for cancellation options (immediate / end of period). Ensure validation.
    - [ ] Service method to:
        - [ ] Call main app DB/API to cancel subscription.
        - [ ] Record audit log / interaction log.

## API Documentation & Testing
- [ ] Ensure all new Admin Panel API endpoints are documented with `@nestjs/swagger`.
    - [ ] Define DTOs with validation pipes for all inputs.
    - [ ] Document responses and error codes.
- [ ] Write unit tests for `AdminService` methods.
- [ ] Write integration tests for `AdminController` endpoints.

## Non-Functional Requirements (MVP Focus from Admin_FRD_MVP)
- [ ] **NFR-SEC-001/002:** Ensure HTTPS (via gateway/infra) and sensitive data encryption (delegated to Auth0 for admin creds, main app for client data, Prisma for AuditLog PII if any).
- [ ] **NFR-SEC-003:** Verify RBAC enforcement.
- [ ] **NFR-SEC-004:** Basic input validation via DTOs (ensure `@nestjs/class-validator` and `class-transformer` are used).
- [ ] **NFR-SEC-005:** Ensure audit logs are comprehensive for specified actions.
- [ ] **NFR-PERF-001:** Optimize queries to main app DB/API for dashboard/user lists.
- [ ] **NFR-REL-002:** Admin Panel specific data (AdminUser, AuditLog) backup strategy.

## Dependencies
- [ ] Access to main application's database (read-only for most parts, specific write for user status/subscription cancellation) OR well-defined APIs from the main application.
- [ ] Auth0 account and application setup for Admin Panel (ensure distinct from client-facing app if applicable).

**General Notes:**
*   Consistently use robust error handling (e.g., NestJS built-in HTTP exceptions, custom exception filters if needed).
*   Ensure all database interactions are through the `PrismaService`.
*   Log critical errors and important actions.
*   All date/time information should be handled in UTC.
