# UniCal AI Agent Instructions

## Project Context
UniCal is a unified calendar portal aggregating Google/Outlook calendars. Monorepo with `@unical/frontend` (Next.js 15), `@unical/backend` (NestJS/Prisma), `@unical/core` (shared types).

## Key Documentation
- Agent Plans: `apps/{backend,frontend}/AGENT_PLAN.md`
- Requirements: `docs/{FRD,BRD}.md`
- Technical: `docs/{Challenges,EventCalendar}.md`
- Module Plans: `[MODULE_NAME]_PLAN.md` files

## Core Principles

### 1. Phased Development
- **CRITICAL:** Only implement current phase features from agent plans
- Never skip ahead to future phases
- Follow phase sequence methodically

### 2. TODO-Driven Process
- Update relevant `[MODULE_NAME]_PLAN.md` with TODOs before coding
- Use `- [ ]` for pending, `- [x]` for completed tasks
- Mark TODOs complete as you implement

### 3. Tech Stack Standards
**Backend:** NestJS, DDD architecture, Prisma/PostgreSQL, Auth0 SSO, Swagger docs, Jest testing
**Frontend:** Next.js 15 App Router, Tailwind CSS, Headless UI, `@event-calendar/core`, `@auth0/nextjs-auth0`

### 4. Code Quality
- TypeScript strict mode, ESLint/Prettier
- Write tests for business logic
- Small, clear commits

## Workflow
1. Review current phase in agent plan
2. Check FRD.md/BRD.md for requirements
3. Update module plan with TODOs
4. Implement, test, document
5. Mark TODOs complete and commit

## Key Requirements (FRD)
- Auth: Email login → SSO (Google/Microsoft)
- Integrations: Google Calendar, Microsoft Outlook
- Views: Day/Week/Month calendar with event aggregation
- CRUD: Basic event management
- Sync: Two-way calendar synchronization

## Quality Gates
- Ask for clarification, never assume requirements
- Prioritize security, accessibility, performance
- Follow established patterns and conventions
- Use yarn workspaces for dependencies

## Workspace CLI
- Use `yarn workspace @unical/{frontend,backend} <command>` for workspace commands
- Use `yarn workspace @unical/core <command>` for shared core commands
- Use `yarn workspace @unical/{module} <command>` for module-specific commands (e.g. Add dependencies, run scripts)
- Use `yarn <command>` for root-level commands
- Use `yarn dev` for local development