Follow these general instructions to build UniCal portal:

## Core References
- Backend: `apps/backend/AGENT_PLAN.md`
- Frontend: `apps/frontend/AGENT_PLAN.md`
- Requirements: `docs/FRD.md`, `docs/BRD.md`
- Technical: `docs/Challenges.md`, `docs/EventCalendar.md`
- Each feature/module: `[MODULE_OR_FEATURE_NAME]_PLAN.md` (checklists)

## Principles
- **Phased Only:** Implement features for the current phase as defined in the agent plan. Do not skip ahead.
- **TODO-Driven:**
  - Update the relevant `[MODULE_OR_FEATURE_NAME]_PLAN.md` with actionable TODOs for the phase before coding.
  - Mark TODOs as complete as you implement.
- **Backend:** DDD, NestJS, Prisma, UTC, Swagger, robust error handling.
- **Frontend:** Next.js App Router, Tailwind, component-based, follow `src/lib` plans, use `@event-calendar/core`.
- **General:** Write/run tests, follow ESLint/Prettier, make small, clear commits.

## Workflow
1. Review the current phase in the agent plan.
2. Reference requirements and challenges docs.
3. Update the relevant feature/module plan with TODOs.
4. Implement, test, and document each TODO.
5. Commit with clear messages.
6. Refine and align with best practices.
7. Ask for clarification if anything is unclear—never assume.

## Focus
- Only work on what is defined.
- Prioritize and follow TODOs in each plan.
- Reference docs for requirements and solutions.
