<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/backend/src/user/USER_MODULE_PLAN.md -->
# User Module Plan

**Overall Goal:** Manage UniCal-specific user profile data and account security.

**Alignment:** This plan aligns with Backend AGENT_PLAN Phase 2.1 (Simplified User Login & Basic Setup) and Phase 2.4 (Full Email/Password - for password field if UniCal manages it).

## 1. Prisma Schema (`prisma/schema.prisma`)
*Goal: Define the structure for storing user data in the database.*

*   [ ] **Define/Confirm `User` Model:**
    *   `id` (String, PK, `@default(uuid())`)
    *   `email` (String, Unique, Index) - Read-only in UniCal after creation or updated if profile changes (future consideration).
    *   `name` (String?, Optional) - Display name. Initially set during user creation, mutable by user in UniCal.
    *   `avatarUrl` (String?, Optional) - Avatar URL. Initially set during user creation, mutable by user in UniCal.
    *   `password` (String?, Optional) - **Only if UniCal directly manages email/password auth (AGENT_PLAN Phase 2.4).** Store hashed.
    *   `role` (Role, Enum: `USER`, `ADMIN`, `@default(USER)`) - UniCal app role.
    *   `emailVerified` (Boolean, `@default(false)`) - From user creation process.
    *   `createdAt` (DateTime, `@default(now())`)
    *   `updatedAt` (DateTime, `@updatedAt`)
    *   Relations: `connectedAccounts` (`ConnectedAccount[]`), `userCalendarSettings` (`UserCalendarSetting[]`), `notifications` (`Notification[]`).
*   [ ] **Define `Role` Enum (if not global):**
    ```prisma
    enum Role {
      USER
      ADMIN
    }
    ```

## 2. DTOs (Data Transfer Objects)
*Goal: Define data structures for API requests and responses.*

*   [ ] **`UserResponseDto.ts`:** `id`, `email`, `name`, `avatarUrl`, `role`, `emailVerified`, `createdAt`, `updatedAt`.
*   [ ] **`UpdateUserProfileDto.ts`:** `name?` (String), `avatarUrl?` (String). Include validation.
*   [ ] **`InternalCreateUserDto.ts` (for `AuthModule` use):** `email`, `name?`, `avatarUrl?`, `emailVerified?`.
*   [ ] **`ChangePasswordDto.ts` (if UniCal manages passwords):** `oldPassword`, `newPassword`. Include validation.

## 3. Module Setup (`user.module.ts`)
*Goal: Configure the NestJS module for users.*

*   [ ] Create `UserModule`.
*   [ ] Import `PrismaModule`.
*   [ ] Declare and Export `UserService`.
*   [ ] Declare `UserController`.

## 4. Service Implementation (`user.service.ts`)
*Goal: Implement business logic for user management.*

*   [ ] Create `UserService`, inject `PrismaService`.
*   [ ] **`findOrCreateUserFromProvider(data: InternalCreateUserDto): Promise<User>`:**
    *   Called by `AuthModule` post-authentication.
    *   Find by `email`. If exists, update mutable fields (`name`, `avatarUrl`, `emailVerified` if changed) and return.
    *   If not, create new user with provided data, default `role` to `USER`.
    *   Return `User` object (internal use).
*   [ ] **`findByEmail(email: string): Promise<User | null>` (if UniCal manages passwords):** Retrieve user by email.
*   [ ] **`getUserProfile(email: string): Promise<UserResponseDto | null>`:** Find by `email`, map to `UserResponseDto`.
*   [ ] **`updateUserProfile(email: string, dto: UpdateUserProfileDto): Promise<UserResponseDto>`:** Find by `email`, update `name`/`avatarUrl`. Throw `NotFoundException` if no user. Return `UserResponseDto`.
*   [ ] **`updatePassword(email: string, dto: ChangePasswordDto): Promise<void>` (if UniCal manages passwords):** Validate old password, hash and save new password.
*   [ ] **`deleteUser(email: string): Promise<void>` (Internal/Admin):** Delete user and associated data (cascade via Prisma schema).

## 5. Controller Implementation (`user.controller.ts`)
*Goal: Expose user management endpoints via API.*

*   [ ] Create `UserController` (`@Controller('users')`, `@ApiTags('Users')`). Inject `UserService`.
*   [ ] **`GET /user/me` (`getCurrentUserProfile`):**
    *   `@UseGuards(AuthGuard)` (UniCal JWT Guard for session management).
    *   Extract `email` from `req.user` (or `req.auth.payload`).
    *   Call `userService.getUserProfile(email)`. Return `UserResponseDto`.
    *   Swagger: `@ApiOperation`, `@ApiResponse(200, type: UserResponseDto)`, `@ApiResponse(404)`.
*   [ ] **`PUT /user/me` (`updateCurrentUserProfile`):**
    *   `@UseGuards(AuthGuard)`.
    *   Extract `email`.
    *   Validate body with `UpdateUserProfileDto` (`ValidationPipe`).
    *   Call `userService.updateUserProfile(email, dto)`. Return `UserResponseDto`.
    *   Swagger: `@ApiOperation`, `@ApiResponse(200, type: UserResponseDto)`, `@ApiResponse(404)`.
*   [ ] **`PUT /user/me/password` (`changeCurrentUserPassword`) (if UniCal manages passwords):**
    *   `@UseGuards(AuthGuard)`.
    *   Extract `email`.
    *   Validate body with `ChangePasswordDto`.
    *   Call `userService.updatePassword(email, dto)`. Return 204 No Content.
    *   Swagger: `@ApiOperation`, `@ApiResponse(204)`, `@ApiResponse(400/401/404)`.

## 6. Testing
*Goal: Ensure reliability and correctness of the module.*

*   [ ] **Unit Tests (`UserService`):** Mock `PrismaService`. Test all service methods, including find/create paths and error handling.
*   [ ] **Integration Tests (`UserController`):** Mock auth. Test `GET /user/me`, `PUT /user/me`, and `PUT /user/me/password` (if applicable), including validation.

## 7. Dependencies
*   `PrismaModule`
*   NestJS Auth (Guards for UniCal JWTs)
*   `class-validator`, `class-transformer`
*   `@nestjs/swagger`
*   `bcrypt` (if UniCal manages passwords)

## Notes & Considerations:
*   **Data Source of Truth:** For `email`, `emailVerified`, the primary source is during user creation. UniCal reflects these. Propagation of updates (post-initial sync) is a future consideration.
*   **Data Deletion:** Cascade deletes via Prisma schema for related data.
*   **Admin Endpoints:** User management by admins (list users, change roles) is out of scope for this initial plan but can be added later.
*   **Password Field:** The `password` field in `User` model and related logic (`ChangePasswordDto`, `updatePassword` service/controller methods, `findByEmail`) are **conditional** on UniCal implementing its own email/password auth stream as per AGENT_PLAN Phase 2.4, rather than solely relying on external providers for this.

## 8. Endpoints
- [ ] `POST /auth/forgot-password` — Request password reset (send email with token)
- [ ] `POST /auth/reset-password` — Reset password using token

## 9. Tasks
- [ ] Implement controller/service methods for above endpoints
- [ ] Enforce JWT/session validation for protected routes
- [ ] Add DTOs for profile update, password change, forgot/reset password
- [ ] Add email sending logic for password reset
- [ ] Add tests for all new endpoints
- [ ] Document endpoints in Swagger
