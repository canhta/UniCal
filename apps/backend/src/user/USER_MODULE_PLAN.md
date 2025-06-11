<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/backend/src/user/USER_MODULE_PLAN.md -->
# User Module Plan

This plan outlines the development tasks for the User module, which manages user identity, authentication aspects (in coordination with AuthModule), and user profiles.

## Phase 1: Core User Entity (Aligns with Backend AGENT_PLAN Phase 1 & 2 - Simplified Login)

*   [ ] **Schema:** Define/confirm `User` schema in `prisma/schema.prisma`:
    *   `id` (autoincrement/uuid) - **Decision: Use UUID for all IDs.**
    *   `auth0Id` (string, unique) - **Key identifier from Auth0, used for linking.**
    *   `email` (unique) - **Initially populated from Auth0. Source of truth is Auth0; read-only in UniCal post-initial sync.**
    *   `name` (string, optional - serves as **display name**) - **Initially populated from Auth0. UniCal DB is source of truth after initial sync; user can update in UniCal. No sync-back to Auth0 for MVP.**
    *   `avatarUrl` (string, optional - serves as **avatar/profile picture URL**) - **Initially populated from Auth0. UniCal DB is source of truth after initial sync; user can update in UniCal. No sync-back to Auth0 for MVP.**
    *   `role` (enum: `USER`, `ADMIN` - defined in Prisma schema `Role` enum) - **Default to `USER` on creation.**
    *   `emailVerified` (boolean, default `false` - can be true from SSO provider, synced from Auth0)
    *   `createdAt`
    *   `updatedAt`
    *   *(Initially, no `password` field as per simplified login)*
*   [ ] **Module Setup:**
    *   Create `UserService`.
    *   Create `UserController` (potentially empty or with a `/users/me` initially if needed by simplified login).
    *   Define DTOs for user operations (e.g., `CreateUserDto`, `UserResponseDto`).
*   [ ] **Service Logic (Simplified):**
    *   `UserService.findOrCreateUser(data: { auth0Id: string, email: string, name?: string, avatarUrl?: string, emailVerified?: boolean })`: Finds a user by `auth0Id` or creates them if they don't exist. If creating, sets role to `USER`, populates `name`, `avatarUrl`, `email`, and `emailVerified` from Auth0 data. Returns the user.
    *   `UserService.findByEmail(email)`: Retrieve a user by their email address.
    *   `UserService.findById(id)`: Retrieve a user by their UniCal ID.
    *   `UserService.findByAuth0Id(auth0Id: string)`: Retrieve a user by their Auth0 ID.

## Phase 2: Full Email/Password Authentication Support (Aligns with Backend AGENT_PLAN Phase 2 - Full Auth)

*Prerequisites: AuthModule is ready for full email/password flows (if UniCal manages this directly, separate from Auth0's own email/password). This phase primarily concerns UniCal-managed credentials if implemented.*
*Note: For an Auth0-centric approach, Auth0 handles its own email/password, verification, and reset flows. The fields below would be relevant if UniCal were to manage these aspects independently or needed to store related state.*

*   [ ] **Schema Update (Conditional, if UniCal manages passwords/verification directly):**
    *   Add `password` (hashed string, nullable) field to `User` schema in `prisma/schema.prisma`.
    *   Add `emailVerificationToken` (string, nullable, unique) and `emailVerificationExpires` (DateTime, nullable) for email verification process.
    *   Add `passwordResetToken` (string, nullable, unique) and `passwordResetExpires` (DateTime, nullable) for password reset process.
    *   Run `prisma migrate dev --name add_auth_fields_to_user`.
*   [ ] **Service Logic (Extended, largely delegated to Auth0 if Auth0-centric):**
    *   `UserService.updatePassword(userId, newPassword)`: Hash and update user's password. (Called by AuthModule's password change/reset flows, if UniCal manages passwords).
    *   Modify `UserService.create()` (or ensure `AuthService.register` handles it): to include hashing password if provided, setting `emailVerified` to false, and generating/storing `emailVerificationToken` (if UniCal manages this).
    *   `UserService.verifyEmail(token)`: Validates token, sets `emailVerified` to true, clears token fields (if UniCal manages this).
    *   `UserService.setVerificationToken(userId, token, expires)`: Stores email verification token details (if UniCal manages this).
    *   `UserService.setPasswordResetToken(userId, token, expires)`: Stores password reset token details (if UniCal manages this).
    *   `UserService.clearPasswordResetToken(userId)`: Clears password reset token details after successful reset (if UniCal manages this).
    *   `UserService.deleteAccount(auth0Id: string)`: Handles deletion of user-specific data in UniCal. **Coordinates with AuthModule (token invalidation) and potentially other modules (e.g., ConnectedAccountsModule for cleanup). This should also consider triggering Auth0 account deletion if required by policy.**
*   [ ] **Controller Endpoints (If any direct user management is needed beyond AuthModule):**
    *   Consider if any admin-level user management endpoints are needed here (e.g., list users, update role). For now, assume most user-facing actions are via AuthModule.

## Phase 3: Profile Management & Enhancements

*   [ ] **Schema Expansion (Consider for Future):**
    *   Fields like `firstName`, `lastName` (if more granular name control is needed beyond the primary `name` field), `preferences` (JSONB for user-specific settings).
    *   If added, run necessary migrations.
    *   *(For MVP, the existing `name` and `avatarUrl` fields are used for profile updates via `updateProfile`.)*
*   [ ] **Service Logic:**
    *   `UserService.updateProfile(auth0Id: string, updateUserProfileDto: { name?: string, avatarUrl?: string })`: Updates the UniCal user record's `name` and `avatarUrl`.
    *   `UserService.getProfile(auth0Id: string)`: Retrieves the UniCal user profile using `auth0Id`.
*   [ ] **Controller Endpoints:**
    *   `GET /users/me` (get current user's profile, including `name`, `email`, `avatarUrl`, `role`, `emailVerified` - uses `auth0Id` from authenticated JWT).
    *   `PUT /users/me` (update current user's profile - `name`, `avatarUrl` - uses `auth0Id` from authenticated JWT).

## Phase 4: Integration & Refinement

*   [ ] Write comprehensive unit tests for `UserService`.
*   [ ] Write integration tests for user creation and update flows (if applicable, separate from AuthModule tests).
*   [ ] Ensure Swagger documentation is complete and accurate for any `UserController` endpoints.
