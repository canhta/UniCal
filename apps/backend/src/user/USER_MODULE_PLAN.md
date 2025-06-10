<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/backend/src/user/USER_MODULE_PLAN.md -->
# User Module Plan

This plan outlines the development tasks for the User module, which manages user identity, authentication aspects (in coordination with AuthModule), and user profiles.

## Phase 1: Core User Entity (Aligns with Backend AGENT_PLAN Phase 1 & 2 - Simplified Login)

*   [X] **Schema:** Define/confirm `User` schema in `prisma/schema.prisma`:
    *   `id` (autoincrement/uuid) - **Decision: Use UUID for all IDs.**
    *   `email` (unique)
    *   `name` (string, optional - can be populated from SSO or later by user)
    *   `avatarUrl` (string, optional - can be populated from SSO)
    *   `role` (enum: `USER`, `ADMIN` - defined in Prisma schema `Role` enum) - **Default to `USER` on creation.**
    *   `emailVerified` (boolean, default `false` - can be true from SSO provider)
    *   `createdAt`
    *   `updatedAt`
    *   *(Initially, no `password` field as per simplified login)*
*   [X] **Module Setup:**
    *   Create `UserService`.
    *   Create `UserController` (potentially empty or with a `/users/me` initially if needed by simplified login).
    *   Define DTOs for user operations (e.g., `CreateUserDto`, `UserResponseDto`).
*   [X] **Service Logic (Simplified):**
    *   `UserService.findOrCreateUser(data: { email: string, name?: string, avatarUrl?: string, emailVerified?: boolean })`: Finds a user by email or creates them if they don't exist. If creating, sets role to `USER` and `emailVerified` based on input (e.g. from SSO provider) or defaults to `false`. Returns the user.
    *   `UserService.findByEmail(email)`: Retrieve a user by their email address.
    *   `UserService.findById(id)`: Retrieve a user by their ID.

## Phase 2: Full Email/Password Authentication Support (Aligns with Backend AGENT_PLAN Phase 2 - Full Auth)

*Prerequisites: AuthModule is ready for full email/password flows.*

*   [ ] **Schema Update:**
    *   Add `password` (hashed string, nullable) field to `User` schema in `prisma/schema.prisma`.
    *   Add `emailVerificationToken` (string, nullable, unique) and `emailVerificationExpires` (DateTime, nullable) for email verification process.
    *   Add `passwordResetToken` (string, nullable, unique) and `passwordResetExpires` (DateTime, nullable) for password reset process.
    *   Run `prisma migrate dev --name add_auth_fields_to_user`.
*   [X] **Service Logic (Extended):**
    *   `UserService.updatePassword(userId, newPassword)`: Hash and update user's password. (Called by AuthModule's password change/reset flows).
    *   Modify `UserService.create()` (or ensure `AuthService.register` handles it): to include hashing password if provided, setting `emailVerified` to false, and generating/storing `emailVerificationToken`.
    *   `UserService.verifyEmail(token)`: Validates token, sets `emailVerified` to true, clears token fields.
    *   `UserService.setVerificationToken(userId, token, expires)`: Stores email verification token details.
    *   `UserService.setPasswordResetToken(userId, token, expires)`: Stores password reset token details.
    *   `UserService.clearPasswordResetToken(userId)`: Clears password reset token details after successful reset.
*   [ ] **Controller Endpoints (If any direct user management is needed beyond AuthModule):**
    *   Consider if any admin-level user management endpoints are needed here (e.g., list users, update role). For now, assume most user-facing actions are via AuthModule.

## Phase 3: Profile Management & Enhancements (Future Considerations)

*   [ ] **Schema Expansion (Optional):**
    *   Add fields like `firstName`, `lastName`, `profilePictureUrl`, `preferences` to `User` schema.
    *   Run necessary migrations.
*   [ ] **Service Logic:**
    *   `UserService.updateProfile(userId, updateUserProfileDto)`
    *   `UserService.getProfile(userId)`
*   [ ] **Controller Endpoints:**
    *   `GET /users/me` (get current user's profile)
    *   `PUT /users/me` (update current user's profile)

## Phase 4: Integration & Refinement

*   [ ] Write comprehensive unit tests for `UserService`.
*   [ ] Write integration tests for user creation and update flows (if applicable, separate from AuthModule tests).
*   [ ] Ensure Swagger documentation is complete and accurate for any `UserController` endpoints.
