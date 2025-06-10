<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/backend/src/user/USER_MODULE_PLAN.md -->
# User Module Plan

This plan outlines the development tasks for the User module, which manages user identity, authentication aspects (in coordination with AuthModule), and user profiles.

## Phase 1: Core User Entity (Aligns with Backend AGENT_PLAN Phase 1 & 2 - Simplified Login)

*   [ ] **Schema:** Define/confirm `User` schema in `schema.prisma`:
    *   `id` (autoincrement/uuid)
    *   `email` (unique)
    *   `role` (e.g., USER, ADMIN - define enum if necessary) **(Clarify: Define the specific roles (e.g., 'USER', 'ADMIN') and how the initial role is assigned, e.g., default to 'USER' on creation).**
    *   `createdAt`
    *   `updatedAt`
    *   *(Initially, no `password` field as per simplified login)*
*   [ ] **Module Setup:**
    *   Create `UserService`.
    *   Create `UserController`.
    *   Define DTOs for user operations (e.g., `CreateUserDto`, `UserResponseDto`).
*   [ ] **Service Logic (Simplified):**
    *   `UserService.create(createUserDto)`: Create a new user (email, default role). Primarily called by AuthModule during SSO or simplified login. **(Ensure initial role assignment logic is implemented here as per role definition).**
    *   `UserService.findByEmail(email)`: Retrieve a user by their email address.
    *   `UserService.findById(id)`: Retrieve a user by their ID.

## Phase 2: Full Email/Password Authentication Support (Aligns with Backend AGENT_PLAN Phase 2 - Full Auth)

*Prerequisites: AuthModule is ready for full email/password flows.*

*   [ ] **Schema Update:**
    *   Add `password` (hashed) field to `User` schema in `schema.prisma`.
    *   Run `prisma migrate dev --name add_password_to_user`.
*   [ ] **Service Logic (Extended):**
    *   `UserService.updatePassword(userId, newPassword)`: Hash and update user's password. (Called by AuthModule's password change/reset flows).
    *   Modify `UserService.create()` if direct user creation with password (e.g. by an admin) is required, distinct from registration flow in AuthModule.
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
