\
# Backend Setup Plan

This document outlines the initial setup steps for the UniCal backend application.

## Core Technologies & Libraries

*   **Framework:** NestJS
*   **ORM:** Prisma
*   **Database:** PostgreSQL
*   **Caching/Job Queue:** Redis
*   **API Documentation:** Swagger (OpenAPI)
*   **Language:** TypeScript
*   **Package Manager:** npm (as per existing `package.json`)

## Phase 1: Project Initialization & Core NestJS Setup

*   [ ] **NestJS Project Structure:** (Already initialized)
    *   Confirm standard NestJS project structure (`src`, `test`, `main.ts`, `app.module.ts`, etc.).
*   [ ] **Configuration Module (`@nestjs/config`):**
    *   Install: `npm install @nestjs/config`
    *   Implement `ConfigModule` to manage environment variables (`.env` file).
    *   Define initial environment variables (e.g., `NODE_ENV`, `PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`).
*   [ ] **Basic Logging:**
    *   Utilize NestJS built-in `Logger` service.
    *   Consider more advanced logging solutions (e.g., Winston, Pino) for later phases if needed.
*   [ ] **Basic Error Handling:**
    *   Implement global exception filter for handling common HTTP errors.
    *   Define custom exception classes as needed.

## Phase 2: Database Setup (Prisma & PostgreSQL)

*   [ ] **Install Prisma CLI:**
    *   `npm install prisma --save-dev`
*   [ ] **Initialize Prisma:**
    *   `npx prisma init --datasource-provider postgresql`
*   [ ] **Configure `DATABASE_URL`:**
    *   Ensure `DATABASE_URL` in `.env` points to a valid PostgreSQL instance.
*   [ ] **Define Initial Schemas:**
    *   Start defining core schemas in `prisma/schema.prisma` based on module plans (e.g., `User`, `ConnectedAccount`, `CalendarEvent`, `UserCalendarSetting`, `Calendar`, `Event`).
    *   Refer to `USER_MODULE_PLAN.md`, `ACCOUNTS_MODULE_PLAN.md`, `EVENTS_MODULE_PLAN.md`, `CALENDARS_MODULE_PLAN.md`.
*   [ ] **Generate Prisma Client:**
    *   `npx prisma generate` (after schema changes)
*   [ ] **Create Prisma Service:**
    *   Create a `PrismaService` (e.g., `src/prisma/prisma.service.ts`) that extends `PrismaClient` and implements `OnModuleInit`.
    *   Provide this service globally or in modules that need database access.
*   [ ] **Initial Migration:**
    *   `npx prisma migrate dev --name initial_setup`
*   [X] **Docker Setup for PostgreSQL (Optional but Recommended for Dev):**
    *   Update `docker-compose.yml` at the project root to include a PostgreSQL service.

## Phase 3: Redis Integration

*   [ ] **Install Redis Client Libraries:**
    *   `npm install cache-manager cache-manager-redis-store` (for caching)
    *   `npm install bullmq @nestjs/bullmq` (for job queues - using bullmq as it is more modern than bull)
    *   Alternatively, `npm install ioredis` for direct Redis interaction.
*   [ ] **Configure Redis Connection:**
    *   Add `REDIS_HOST` and `REDIS_PORT` (or `REDIS_URL`) to `.env`.
*   [ ] **Implement Caching Service (Optional - for specific use cases):**
    *   Use `@nestjs/cache-manager` and `cache-manager-redis-store` to set up Redis as a cache store.
*   [ ] **Implement Job Queue (BullMQ - for SyncModule):**
    *   Configure `BullModule` (from `@nestjs/bullmq`) in `app.module.ts` or relevant feature modules (e.g., `SyncModule`).
    *   Define queues, producers, and consumers as per `SYNC_MODULE_PLAN.md`.
*   [X] **Docker Setup for Redis (Optional but Recommended for Dev):**
    *   Update `docker-compose.yml` to include a Redis service.

## Phase 4: API Documentation (Swagger)

*   [ ] **Install Swagger Dependencies:**
    *   `npm install @nestjs/swagger swagger-ui-express`
*   [ ] **Initialize Swagger in `main.ts`:**
    *   Configure `SwaggerModule` to generate API documentation.
    *   Set up document title, description, version, and API path (e.g., `/api-docs`).
*   [ ] **Add API Decorators:**
    *   Use `@nestjs/swagger` decorators (`@ApiProperty`, `@ApiResponse`, `@ApiOperation`, `@ApiTags`, etc.) in DTOs and controllers to enrich documentation.
    *   Start with core modules like `AuthModule`, `UserModule`, `AccountsModule`.

## Phase 5: Core Services & Utilities

*   [ ] **Encryption Service:**
    *   Create `EncryptionService` (e.g., `src/common/encryption/encryption.service.ts`).
    *   Use Node.js `crypto` module: `aes-256-gcm` for encryption/decryption. **(Avoid bcrypt for general encryption; it's for hashing).**
    *   Store `ENCRYPTION_KEY` (32 bytes, hex-encoded) securely via `ConfigService` from environment variables.
    *   This will be used by `AccountsModule` and potentially `AuthModule`.
*   [ ] **Global Pipes for Validation:**
    *   Enable `ValidationPipe` globally in `main.ts` to automatically validate incoming request DTOs using `class-validator` and `class-transformer`.
    *   Install dependencies: `npm install class-validator class-transformer`
*   [ ] **Module Aliases (Path Mapping):**
    *   Configure TypeScript path mapping in `tsconfig.json` (e.g., `@/src/*`) for cleaner imports, if not already done.

## Phase 6: Linting & Formatting

*   [ ] **ESLint & Prettier Setup:** (Partially exists via `eslint.config.mjs`)
    *   Ensure ESLint rules are configured for NestJS/TypeScript best practices.
    *   Integrate Prettier for consistent code formatting.
    *   Add npm scripts for linting and formatting (e.g., `lint`, `format`).
*   [ ] **Husky & lint-staged (Optional):**
    *   Set up pre-commit hooks to automatically lint and format staged files.

## Phase 7: Initial Testing Setup

*   [ ] **Unit Test Configuration:** (Jest is default with NestJS)
    *   Ensure Jest is configured correctly.
    *   Write initial unit tests for core services (e.g., `AppService`, `ConfigService`, `PrismaService`).
*   [ ] **E2E Test Configuration:** (Jest is default with NestJS)
    *   Ensure Jest E2E setup is functional (`test/jest-e2e.json`).
    *   Write a basic E2E test for a health check endpoint.

## Next Steps

Once this base setup is complete, proceed with implementing features as outlined in the individual module plans (`ACCOUNTS_MODULE_PLAN.md`, `AUTH_MODULE_PLAN.md`, etc.).
