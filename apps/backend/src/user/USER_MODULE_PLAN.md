<!-- filepath: /Users/canh/Projects/Personals/UniCal/apps/backend/src/user/USER_MODULE_PLAN.md -->
# User Module Plan (Backend)

**Overall Goal:** Manage UniCal-specific user profile data, linked to an Auth0 identity. Auth0 handles primary authentication and core identity attributes.

**Alignment:** This plan aligns with Backend AGENT_PLAN Phase 2.1 (Simplified User Login & Basic Setup) and Phase 2.4 (Full Email/Password - for password field if UniCal manages it).

## 1. Prisma Schema (`prisma/schema.prisma`)
*Goal: Define the structure for storing user data in the database.*

*   [ ] **Define/Confirm `User` Model:**
    *   `id` (String, PK, `@default(uuid())`)
    *   `auth0Id` (String, Unique, Index) - Identifier from Auth0. **Primary link.**
    *   `email` (String, Unique, Index) - From Auth0. Read-only in UniCal after creation or updated if Auth0 profile changes (future consideration).
    *   `name` (String?, Optional) - Display name. From Auth0 initially, mutable by user in UniCal.
    *   `avatarUrl` (String?, Optional) - Avatar URL. From Auth0 initially, mutable by user in UniCal.
    *   `password` (String?, Optional) - **Only if UniCal directly manages email/password auth (AGENT_PLAN Phase 2.4).** Store hashed.
    *   `role` (Role, Enum: `USER`, `ADMIN`, `@default(USER)`) - UniCal app role.
    *   `emailVerified` (Boolean, `@default(false)`) - From Auth0.
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

*   [ ] **`UserResponseDto.ts`:** `id`, `auth0Id`, `email`, `name`, `avatarUrl`, `role`, `emailVerified`, `createdAt`, `updatedAt`.
*   [ ] **`UpdateUserProfileDto.ts`:** `name?` (String), `avatarUrl?` (String). Include validation.
*   [ ] **`InternalCreateUserDto.ts` (for `AuthModule` use):** `auth0Id`, `email`, `name?`, `avatarUrl?`, `emailVerified?`.
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
    *   Called by `AuthModule` post-Auth0 authentication.
    *   Find by `auth0Id`. If exists, update mutable fields (`name`, `avatarUrl`, `emailVerified` if changed from Auth0) and return.
    *   If not, create new user with Auth0 data, default `role` to `USER`.
    *   Return `User` object (internal use).
*   [ ] **`findByAuth0Id(auth0Id: string): Promise<User | null>`:** Retrieve user by `auth0Id`.
*   [ ] **`findByEmail(email: string): Promise<User | null>` (if UniCal manages passwords):** Retrieve user by email.
*   [ ] **`getUserProfile(auth0Id: string): Promise<UserResponseDto | null>`:** Find by `auth0Id`, map to `UserResponseDto`.
*   [ ] **`updateUserProfile(auth0Id: string, dto: UpdateUserProfileDto): Promise<UserResponseDto>`:** Find by `auth0Id`, update `name`/`avatarUrl`. Throw `NotFoundException` if no user. Return `UserResponseDto`.
*   [ ] **`updatePassword(auth0Id: string, dto: ChangePasswordDto): Promise<void>` (if UniCal manages passwords):** Validate old password, hash and save new password.
*   [ ] **`deleteUser(auth0Id: string): Promise<void>` (Internal/Admin):** Delete user and associated data (cascade via Prisma schema).

## 5. Controller Implementation (`user.controller.ts`)
*Goal: Expose user management endpoints via API.*

*   [ ] Create `UserController` (`@Controller('users')`, `@ApiTags('Users')`). Inject `UserService`.
*   [ ] **`GET /me` (`getCurrentUserProfile`):**
    *   `@UseGuards(AuthGuard)` (UniCal JWT Guard for Auth0-derived sessions).
    *   Extract `auth0Id` from `req.user` (or `req.auth.payload`).
    *   Call `userService.getUserProfile(auth0Id)`. Return `UserResponseDto`.
    *   Swagger: `@ApiOperation`, `@ApiResponse(200, type: UserResponseDto)`, `@ApiResponse(404)`.
*   [ ] **`PUT /me` (`updateCurrentUserProfile`):**
    *   `@UseGuards(AuthGuard)`.
    *   Extract `auth0Id`.
    *   Validate body with `UpdateUserProfileDto` (`ValidationPipe`).
    *   Call `userService.updateUserProfile(auth0Id, dto)`. Return `UserResponseDto`.
    *   Swagger: `@ApiOperation`, `@ApiResponse(200, type: UserResponseDto)`, `@ApiResponse(404)`.
*   [ ] **`POST /me/change-password` (`changeCurrentUserPassword`) (if UniCal manages passwords):**
    *   `@UseGuards(AuthGuard)`.
    *   Extract `auth0Id`.
    *   Validate body with `ChangePasswordDto`.
    *   Call `userService.updatePassword(auth0Id, dto)`. Return 204 No Content.
    *   Swagger: `@ApiOperation`, `@ApiResponse(204)`, `@ApiResponse(400/401/404)`.

## 6. Testing
*Goal: Ensure reliability and correctness of the module.*

*   [ ] **Unit Tests (`UserService`):** Mock `PrismaService`. Test all service methods, including find/create paths and error handling.
*   [ ] **Integration Tests (`UserController`):** Mock auth. Test `GET /me`, `PUT /me`, and `POST /me/change-password` (if applicable), including validation.

## 7. Dependencies
*   `PrismaModule`
*   NestJS Auth (Guards for UniCal JWTs)
*   `class-validator`, `class-transformer`
*   `@nestjs/swagger`
*   `bcrypt` (if UniCal manages passwords)

## Notes & Considerations:
*   **Auth0 as Primary Source of Truth:** For `email`, `emailVerified`, Auth0 is primary. UniCal reflects these. Propagation of updates from Auth0 to UniCal (post-initial sync) is a future consideration.
*   **Data Deletion:** Cascade deletes via Prisma schema for related data.
*   **Admin Endpoints:** User management by admins (list users, change roles) is out of scope for this initial plan but can be added later.
*   **Password Field:** The `password` field in `User` model and related logic (`ChangePasswordDto`, `updatePassword` service/controller methods, `findByEmail`) are **conditional** on UniCal implementing its own email/password auth stream as per AGENT_PLAN Phase 2.4, rather than solely relying on Auth0 for this.
