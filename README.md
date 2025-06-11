# UniCal - Unified Calendar System

UniCal consolidates events from multiple calendar platforms. It's a Yarn monorepo with a NestJS backend and Next.js frontend.

## Prerequisites

*   Node.js (v23 or newer recommended)
*   Corepack (for Yarn 4.x, usually included with Node.js v16.10+)
*   Docker and Docker Compose

## Quick Start (Recommended)

We provide an automated setup script that handles the entire development environment setup:

1.  **Get the Code**
    ```bash
    corepack enable
    git clone git@github.com:canhta/UniCal.git
    cd UniCal
    ```

2.  **Run the Setup Script**
    ```bash
    chmod +x scripts/setup.sh
    ./scripts/setup.sh
    ```

The setup script automatically:
- 🔧 Creates environment files with secure auto-generated keys
- 🐳 Sets up and starts Docker services (PostgreSQL & Redis)
- 📦 Installs all project dependencies
- 🗄️ Runs database migrations and generates Prisma client
- ✅ Performs health checks
- 🚀 Optionally starts development servers

After running the script, you'll have:
- Backend API at `http://localhost:3000`
- Frontend at `http://localhost:3030`
- PostgreSQL at `localhost:5432`
- Redis at `localhost:6379`

## Manual Configuration (Optional)

After running the setup script, you may want to configure OAuth credentials:

### Backend Environment (`apps/backend/.env`)
Update the following values for calendar integrations:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: Your Google OAuth credentials
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`: Your Microsoft OAuth credentials
- Ensure redirect URIs match: `http://localhost:3000/api/connect/google/callback`

### Frontend Environment (`apps/frontend/.env.local`)
The setup script handles most configuration, but you can customize:
- `NEXT_PUBLIC_API_URL`: Should point to `http://localhost:3000/api`

## Manual Setup (Alternative)

If you prefer manual setup or need to troubleshoot:

<details>
<summary>Click to expand manual setup instructions</summary>

1.  **Install Dependencies**
    ```bash
    yarn install
    ```

2.  **Configure Environment Files**
    ```bash
    # Backend
    cp apps/backend/.env.example apps/backend/.env
    # Frontend  
    cp apps/frontend/.env.example apps/frontend/.env.local
    ```

3.  **Start Docker Services**
    ```bash
    docker-compose up -d
    ```

4.  **Run Database Setup**
    ```bash
    yarn workspace @unical/backend prisma generate
    yarn workspace @unical/backend prisma migrate dev --name init
    ```

5.  **Start Development Servers**
    ```bash
    yarn dev
    ```

</details>

## Project Structure

*   `apps/backend`: NestJS API server
*   `apps/frontend`: Next.js frontend application
*   `packages/core`: Shared types and utilities
*   `docs/`: Project documentation
*   `scripts/`: Development and deployment scripts
*   `docker-compose.yml`: Local development services

## Development Commands

### Quick Start Commands
- `yarn setup`: Complete automated setup (recommended for first-time setup)
- `yarn dev`: Start both backend and frontend development servers concurrently
- `yarn env:copy`: Copy all environment example files

### Workspace Commands
- `yarn frontend <command>`: Run frontend-specific commands
- `yarn backend <command>`: Run backend-specific commands

### Development Workflow
```bash
# Start development servers
yarn dev

# Run specific workspace commands
yarn frontend dev          # Start only frontend
yarn backend start:dev     # Start only backend

# Environment setup
yarn env:copy              # Copy all environment files
yarn env:copy:frontend     # Copy only frontend environment
yarn env:copy:backend      # Copy only backend environment
```

### Database Management
```bash
yarn prisma <command>      # Run any Prisma command
yarn db:setup             # Run database migrations
yarn db:reset             # Reset database (caution: destroys data)
yarn db:generate          # Generate Prisma client
```

### Docker Operations
```bash
yarn docker:up            # Start all Docker services
yarn docker:down          # Stop all Docker services  
yarn docker:clean         # Stop services and remove volumes
yarn docker:logs          # View Docker service logs
```

### Code Quality & Testing
```bash
# Linting
yarn lint                 # Lint both frontend and backend
yarn lint:fix             # Fix linting issues automatically
yarn format               # Format code with Prettier
yarn type-check           # Run TypeScript type checking

# Testing
yarn test                 # Run all tests
yarn test:watch           # Run tests in watch mode
yarn test:e2e             # Run end-to-end tests
```

### Build & Production
```bash
# Building
yarn build                # Build both applications
yarn build:frontend       # Build only frontend
yarn build:backend        # Build only backend

# Production
yarn start                # Start both applications in production mode
yarn start:frontend       # Start only frontend in production
yarn start:backend        # Start only backend in production
```

### Common Development Workflows

**First-time setup:**
```bash
yarn setup                # Automated complete setup
yarn dev                  # Start development
```

**Daily development:**
```bash
yarn docker:up            # Start services
yarn dev                  # Start development servers
# ... develop ...
yarn docker:down          # Stop services when done
```

**Before committing:**
```bash
yarn lint:fix             # Fix linting issues
yarn test                 # Run tests
yarn type-check           # Verify types
```

**Database changes:**
```bash
yarn db:reset             # Reset if needed
yarn db:setup             # Apply migrations
```

## Docker Services

*   **PostgreSQL**: Database server on port 5432
*   **Redis**: Caching and session store on port 6379

Manage services:
```bash
docker-compose ps          # View running services
docker-compose logs -f     # View all logs
docker-compose logs -f postgres  # View specific service logs
docker-compose down        # Stop all services
```

## Troubleshooting

### Setup Script Issues
- Ensure Docker is running before running the setup script
- On macOS, the script uses `openssl` to generate secure keys
- If setup fails, check Docker service status: `docker-compose ps`

### Database Connection Issues
- Verify PostgreSQL is running: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`
- Regenerate Prisma client: `yarn workspace @unical/backend prisma generate`

### Port Conflicts
- Backend default: `http://localhost:3000`
- Frontend default: `http://localhost:3030`
- Database: `localhost:5432`
- Redis: `localhost:6379`

If ports are occupied, update the respective configuration files.

## Stopping Development

1.  Stop development servers (Ctrl+C)
2.  Stop Docker services: `docker-compose down`

## Next Steps

After setup, configure your OAuth credentials in the environment files to enable calendar integrations with Google and Microsoft.
