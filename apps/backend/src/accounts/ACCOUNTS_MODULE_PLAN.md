\
# Accounts Module Plan (Backend)

**Overall Goal:** Manage connections to third-party provider accounts (e.g., Google Calendar, Outlook Calendar) for users. This includes storing OAuth tokens securely and associated metadata. This module is critical for calendar synchronization.

**Alignment:** This plan primarily aligns with Backend AGENT_PLAN Phase 3 (Core Features - Calendar Sync & Integrations).

## 1. Prisma Schema (`prisma/schema.prisma`)
*Goal: Define the database structure for storing connected account information.*

*   [ ] **Define `ConnectedAccount` Model:**
    *   `id` (String, PK, `@default(uuid())`)
    *   `userId` (String) - Foreign Key to `User` model.
    *   `user` (User, `@relation(fields: [userId], references: [id], onDelete: Cascade)`)
    *   `provider` (String, e.g., "GOOGLE", "OUTLOOK_CALENDAR", "APPLE_CALENDAR") - Consider an Enum if providers are fixed.
    *   `providerAccountId` (String) - User's ID on the third-party provider.
    *   `accessToken` (String, `@db.Text`) - Encrypted OAuth access token.
    *   `refreshToken` (String?, `@db.Text`) - Encrypted OAuth refresh token (if applicable).
    *   `expiresAt` (DateTime?) - Expiry timestamp for the access token.
    *   `scopes` (String[]) - List of scopes granted by the user.
    *   `accountEmail` (String?) - Email associated with the connected account (useful for display).
    *   `metadata` (Json?, Optional) - For any other provider-specific information.
    *   `createdAt` (DateTime, `@default(now())`)
    *   `updatedAt` (DateTime, `@updatedAt`)
    *   `@@unique([userId, provider, providerAccountId])` - Ensure a user doesn't connect the same provider account multiple times.
    *   `@@index([userId])`

*   [ ] **Define `ProviderType` Enum (Optional, if using Enum for `provider` field):**
    ```prisma
    // enum ProviderType {
    //   GOOGLE
    //   OUTLOOK_CALENDAR
    //   APPLE_CALENDAR
    // }
    ```

## 2. DTOs (Data Transfer Objects)
*Goal: Define data structures for API requests and responses, and internal service communication.*

*   [ ] **`ConnectedAccountResponseDto.ts`:** `id`, `userId`, `provider`, `providerAccountId`, `accountEmail`, `scopes`, `createdAt`, `updatedAt`. (Exclude tokens).
*   [ ] **`InternalCreateConnectedAccountDto.ts` (for `SyncService` or `AuthCallbackHandler` use):** `userId`, `provider`, `providerAccountId`, `accessToken`, `refreshToken?`, `expiresAt?`, `scopes`, `accountEmail?`, `metadata?`.
*   [ ] **`InternalUpdateConnectedAccountDto.ts` (for token refresh):** `accessToken`, `refreshToken?`, `expiresAt?`.

## 3. Module Setup (`accounts.module.ts`)
*Goal: Configure the NestJS module for connected accounts.*

*   [ ] Create `AccountsModule`.
*   [ ] Import `PrismaModule`.
*   [ ] Import `EncryptionModule` (or a shared crypto service for token encryption/decryption).
*   [ ] Declare and Export `AccountsService`.
*   [ ] Declare `AccountsController`.

## 4. Service Implementation (`accounts.service.ts`)
*Goal: Implement business logic for managing connected accounts, with a strong focus on security.*

*   [ ] Create `AccountsService`, inject `PrismaService` and `EncryptionService`.
*   [ ] **`createConnectedAccount(dto: InternalCreateConnectedAccountDto): Promise<ConnectedAccount>`:**
    *   Encrypt `accessToken` and `refreshToken`.
    *   Create or update (if `providerAccountId` matches for the user and provider) the connected account.
    *   Return the `ConnectedAccount` entity (internal use, tokens remain encrypted in DB).
*   [ ] **`getConnectedAccountsForUser(userId: string): Promise<ConnectedAccountResponseDto[]>`:**
    *   Retrieve all connected accounts for a user.
    *   Map to `ConnectedAccountResponseDto` (never expose raw tokens).
*   [ ] **`getConnectedAccountById(userId: string, accountId: string): Promise<ConnectedAccountResponseDto | null>`:**
    *   Retrieve a specific connected account by its ID, ensuring it belongs to the `userId`.
    *   Map to `ConnectedAccountResponseDto`.
*   [ ] **`findAccountByProviderDetails(userId: string, provider: string, providerAccountId: string): Promise<ConnectedAccount | null>`:**
    *   Find an account by user, provider, and provider's account ID.
*   [ ] **`getDecryptedAccessToken(accountId: string, userId: string): Promise<string | null>`:**
    *   **Highly sensitive method.** Retrieve account, verify ownership by `userId`.
    *   Decrypt and return the `accessToken`.
    *   Implement robust logging and auditing for calls to this method.
    *   To be used *only* by trusted internal services (e.g., `SyncService`).
*   [ ] **`updateTokens(accountId: string, userId: string, dto: InternalUpdateConnectedAccountDto): Promise<ConnectedAccount>`:**
    *   Verify ownership by `userId`.
    *   Encrypt new `accessToken` and `refreshToken`.
    *   Update the specified account's tokens and `expiresAt`.
*   [ ] **`deleteConnectedAccount(userId: string, accountId: string): Promise<void>`:**
    *   Verify ownership.
    *   Delete the connected account.
    *   Consider any cleanup needed (e.g., revoking tokens with the provider if possible - future enhancement).

## 5. Controller Implementation (`accounts.controller.ts`)
*Goal: Expose API endpoints for managing connected accounts.*

*   [ ] Create `AccountsController` (`@Controller('accounts')`, `@ApiTags('Connected Accounts')`). Inject `AccountsService`.
*   [ ] **`GET /` (`listConnectedAccounts`):**
    *   `@UseGuards(AuthGuard)` (UniCal JWT Guard).
    *   Extract `userId` from `req.user.sub` (or equivalent based on JWT structure).
    *   Call `accountsService.getConnectedAccountsForUser(userId)`.
    *   Return `ConnectedAccountResponseDto[]`.
    *   Swagger: `@ApiOperation`, `@ApiResponse(200, type: [ConnectedAccountResponseDto])`.
*   [ ] **`GET /:accountId` (`getConnectedAccountDetails`):**
    *   `@UseGuards(AuthGuard)`.
    *   Extract `userId`.
    *   Call `accountsService.getConnectedAccountById(userId, accountId)`.
    *   Return `ConnectedAccountResponseDto`. Throw `NotFoundException` if not found or not owned.
    *   Swagger: `@ApiOperation`, `@ApiResponse(200, type: ConnectedAccountResponseDto)`, `@ApiResponse(404)`.
*   [ ] **`DELETE /:accountId` (`removeConnectedAccount`):**
    *   `@UseGuards(AuthGuard)`.
    *   Extract `userId`.
    *   Call `accountsService.deleteConnectedAccount(userId, accountId)`.
    *   Return 204 No Content.
    *   Swagger: `@ApiOperation`, `@ApiResponse(204)`, `@ApiResponse(404)`.

**Note:** The actual connection flow (OAuth dance) will likely be initiated and handled by a dedicated `SyncSetupService` or similar, which would then call `AccountsService.createConnectedAccount` upon successful authorization.

## 6. Testing
*Goal: Ensure reliability and correctness of the module.*

*   [ ] **Unit Tests (`AccountsService`):**
    *   Mock `PrismaService` and `EncryptionService`.
    *   Test token encryption/decryption logic (if handled directly, otherwise mock `EncryptionService` calls).
    *   Test all service methods: create, get (list/single), update tokens, delete.
    *   Test ownership checks and error handling (e.g., account not found).
*   [ ] **Integration Tests (`AccountsController`):**
    *   Mock auth (`AuthGuard`).
    *   Test API endpoints: `GET /`, `GET /:id`, `DELETE /:id`.
    *   Verify correct DTO mapping and response codes.
    *   Test access control (user can only manage their own accounts).

## 7. Dependencies
*   `PrismaModule`
*   `EncryptionModule` (or equivalent crypto utility/service)
*   NestJS Auth (Guards for UniCal JWTs)
*   `class-validator`, `class-transformer`
*   `@nestjs/swagger`

## 8. Security & Data Handling
*   **Token Encryption:** All stored OAuth tokens (`accessToken`, `refreshToken`) **MUST** be encrypted at rest using strong encryption (e.g., AES-256-GCM). The `EncryptionService` will be responsible for this.
*   **Token Exposure:** Decrypted tokens should **NEVER** be exposed via API responses. The `getDecryptedAccessToken` method is for internal server-side use only by trusted services and must be carefully controlled.
*   **Input Validation:** Rigorously validate all inputs.
*   **Error Handling:** Implement proper error handling and return appropriate HTTP status codes.
*   **Auditing:** Consider audit logging for sensitive operations like token decryption or account deletion.

## Notes & Considerations:
*   **Encryption Service:** A robust `EncryptionService` is a prerequisite. This service should handle symmetric encryption/decryption of tokens.
*   **OAuth Flow Management:** This module focuses on *storing and managing* connected account data. The actual OAuth 2.0/OpenID Connect flows (redirects, token exchange with providers) will be handled by a different module/service (e.g., part of the `SyncModule` or a dedicated `OAuthHandlerService`), which will then use `AccountsService` to persist the connection details.
*   **Token Refresh:** The `SyncService` will likely be responsible for orchestrating token refresh logic, using `AccountsService.getDecryptedAccessToken` (for the refresh token, if stored and encrypted) and `AccountsService.updateTokens`.
*   **Provider-Specific Logic:** Keep provider-specific details (e.g., unique API endpoints for token revocation) outside this core module if possible, perhaps in strategies within the `SyncModule`.
