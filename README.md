# UniCal - Unified Calendar System

UniCal consolidates events from multiple calendar platforms. It's a Yarn monorepo with a NestJS backend and Next.js frontend.

## Prerequisites

*   Node.js (v23 or newer recommended)
*   Corepack (for Yarn 4.x, usually included with Node.js v16.10+)
*   Docker and Docker Compose

## Local Development Setup

1.  **Enable Corepack & Get Code**
    ```bash
    corepack enable
    git clone git@github.com:canhta/UniCal.git
    cd UniCal
    ```
    Corepack uses the Yarn version in `package.json`.

2.  **Install Dependencies**
    ```bash
    yarn install
    ```

3.  **Configure Backend Environment (`apps/backend/.env`)**
    *   Navigate to `apps/backend`.
    *   Create a `.env` file by copying the example: `cp .env.example .env`.
    *   Open `apps/backend/.env` and fill in the required values:
        *   `JWT_SECRET`: A strong secret string for signing JWTs.
        *   `TOKEN_ENCRYPTION_KEY`: A 32-character string for encrypting sensitive tokens.
        *   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Your Google OAuth credentials.
        *   `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`: Your Microsoft OAuth credentials.
        *   The `DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT` are pre-filled for local Docker. 
        *   **Important:** Update `PORT` to `3000`. Consequently, `GOOGLE_REDIRECT_URI` and `MICROSOFT_REDIRECT_URI` should also reflect port 3000 (e.g., `http://localhost:3000/api/connect/google/callback`). Adjust these in your `.env` file and ensure they match your OAuth provider configurations.
    *   Return to the project root: `cd ../..`

4.  **Configure Frontend Environment (`apps/frontend/.env.local`)**
    *   Navigate to `apps/frontend`.
    *   Create a `.env.local` file by copying the example: `cp .env.example .env.local`.
        *   Next.js uses `.env.local` for local environment variables that are not committed to Git.
    *   The `NEXT_PUBLIC_API_URL` in `.env.local` should be updated to point to the backend at port 3000 (e.g., `http://localhost:3000/api`).
    *   Return to the project root: `cd ../..`

5.  **Start Local Services (PostgreSQL & Redis)**
    *   Ensure Docker is running.
    *   From the project root (`/Users/canh/Projects/Personals/UniCal`):
        ```bash
        docker-compose up -d
        ```
        This starts PostgreSQL (port 5432) and Redis (port 6379).
        Manage with `docker-compose ps`, `docker-compose logs -f <service>`, `docker-compose down`.

6.  **Run Database Migrations**
    Once PostgreSQL is healthy, from the project root:
    ```bash
    yarn workspace @unical/backend prisma migrate dev
    ```

7.  **Start Development Servers**
    From the project root:
    ```bash
    yarn dev
    ```
    *   Backend (NestJS) typically on `http://localhost:3000` (as per your `.env` setting).
    *   Frontend (Next.js) typically on `http://localhost:3030` (you will need to configure this in `apps/frontend/package.json` or Next.js config).

## Project Structure

*   `apps/backend`: NestJS API.
*   `apps/frontend`: Next.js UI.
*   `docs/`: Documentation.
*   `docker-compose.yml`: Local development services.

## Available Scripts (Root)

*   `yarn dev`: Starts backend and frontend.

(Refer to `package.json` in `apps/*` for app-specific scripts.)

## Stopping Local Development

1.  Stop dev servers (Ctrl+C).
2.  Stop Docker services: `docker-compose down`.
