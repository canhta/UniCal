\
# Backend Setup Plan

This document outlines the initial setup steps for the UniCal backend application.

## Core Technologies & Libraries

*   **Framework:** NestJS
*   **ORM:** Prisma
*   **Database:** PostgreSQL
*   **Caching/Job Queue:** Redis (BullMQ)
*   **API Documentation:** Swagger (OpenAPI)
*   **Language:** TypeScript
*   **Package Manager:** npm

## Phase 1: Project Initialization & Core NestJS Setup

*   [ ] **NestJS Project Structure:**
    *   Verify standard NestJS project structure (`src`, `test`, `main.ts`, `app.module.ts`, etc.).
*   [ ] **Configuration Module (`@nestjs/config`):**
    *   Install: `npm install @nestjs/config`
    *   Implement `ConfigModule` to manage environment variables (`.env` file).
    *   Define initial environment variables: `NODE_ENV`, `PORT`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`.
*   [ ] **Basic Logging:**
    *   Utilize NestJS built-in `Logger` service for application logging.
*   [ ] **Basic Error Handling:**
    *   Implement a global exception filter for handling common HTTP errors and ensuring consistent error responses.

## Phase 2: Database Setup (Prisma & PostgreSQL)

*   [ ] **Install Prisma CLI:**
    *   `npm install prisma --save-dev`
*   [ ] **Initialize Prisma:**
    *   `npx prisma init --datasource-provider postgresql`
*   [ ] **Configure `DATABASE_URL`:**
    *   Ensure `DATABASE_URL` in `.env` points to a valid PostgreSQL instance (e.g., from `docker-compose.yml`).
*   [ ] **Define Initial Schemas:**
    *   Define core schemas in `prisma/schema.prisma` for `User`, `ConnectedAccount`, `CalendarEvent`, `UserCalendarSetting`, `Calendar`, `Event`.
    *   Refer to `USER_MODULE_PLAN.md`, `ACCOUNTS_MODULE_PLAN.md`, `EVENTS_MODULE_PLAN.md`, `CALENDARS_MODULE_PLAN.md`.
*   [ ] **Generate Prisma Client:**
    *   `npx prisma generate`
*   [ ] **Create Prisma Service:**
    *   Create `src/prisma/prisma.service.ts` extending `PrismaClient` and implementing `OnModuleInit`.
    *   Provide this service globally or in modules requiring database access.
*   [ ] **Initial Migration:**
    *   `npx prisma migrate dev --name initial_setup`
*   [ ] **Docker Setup for PostgreSQL:**
    *   Verify PostgreSQL service is configured in `docker-compose.yml` at the project root.

## Phase 3: Redis Integration (for Job Queues)

*   [ ] **Install Redis Client Libraries (BullMQ):**
    *   `npm install bullmq @nestjs/bullmq`
*   [ ] **Configure Redis Connection:**
    *   Add `REDIS_HOST` and `REDIS_PORT` (or `REDIS_URL`) to `.env` (e.g., from `docker-compose.yml`).
*   [ ] **Implement Job Queue (BullMQ):**
    *   Configure `BullModule` (from `@nestjs/bullmq`) in `app.module.ts` or relevant feature modules (e.g., `SyncModule`).
    *   Define queues, producers, and consumers as per `SYNC_MODULE_PLAN.md`.
*   [ ] **Docker Setup for Redis:**
    *   Verify Redis service is configured in `docker-compose.yml`.

## Phase 4: API Documentation (Swagger)

*   [ ] **Install Swagger Dependencies:**
    *   `npm install @nestjs/swagger swagger-ui-express`
*   [ ] **Initialize Swagger in `main.ts`:**
    *   Configure `SwaggerModule` to generate API documentation (title, description, version, path e.g., `/api-docs`).
*   [ ] **Add API Decorators:**
    *   Use `@nestjs/swagger` decorators (`@ApiProperty`, `@ApiResponse`, `@ApiOperation`, `@ApiTags`) in DTOs and controllers, starting with `AuthModule`, `UserModule`, `AccountsModule`.

## Phase 5: Core Services & Utilities

*   [ ] **Encryption Service:**
    *   Create `EncryptionService` in `src/common/encryption/encryption.service.ts`.
    *   Use Node.js `crypto` module (`aes-256-gcm`) for encryption/decryption.
    *   Store `ENCRYPTION_KEY` (32 bytes, hex-encoded) securely via `ConfigService` (from `.env`).
*   [ ] **Global Pipes for Validation:**
    *   Install: `npm install class-validator class-transformer`
    *   Enable `ValidationPipe` globally in `main.ts` for DTO validation.
*   [ ] **Module Aliases (Path Mapping):**
    *   Configure TypeScript path mapping in `tsconfig.json` (e.g., `@/src/*`) for cleaner imports.

## Phase 6: Linting & Formatting

*   [ ] **ESLint & Prettier Setup:**
    *   Verify/Update ESLint rules in `eslint.config.mjs` for NestJS/TypeScript best practices.
    *   Ensure Prettier is integrated for consistent code formatting.
    *   Add/Verify npm scripts for linting and formatting (e.g., `lint`, `format`).
*   [ ] **Husky & lint-staged:**
    *   Install: `npm install husky lint-staged --save-dev`
    *   Configure pre-commit hooks to automatically lint and format staged files.

## Phase 7: Initial Testing Setup

*   [ ] **Unit Test Configuration (Jest):**
    *   Verify Jest configuration.
    *   Write initial unit tests for core services (e.g., `AppService`, `ConfigService`, `PrismaService`).
*   [ ] **E2E Test Configuration (Jest):**
    *   Verify Jest E2E setup (`test/jest-e2e.json`).
    *   Write a basic E2E test for a health check endpoint (e.g., `/`).

## Next Steps

Proceed with implementing features as outlined in individual module plans.
