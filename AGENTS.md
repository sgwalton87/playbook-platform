# Playbook OS Agent Instructions

## Purpose
AGENTS.md instructs AI coding agents and automated contributors how to work safely inside the Playbook OS repository.

## Ownership
Owned by Playbook OS Engineering. These instructions apply to the full repository tree unless a more deeply nested `AGENTS.md` file overrides them for a specific path.

## Last Updated
July 23, 2026

## Related Documents
- Engineering constitution: [CODEX.md](./CODEX.md)
- Delivery tracker: [docs/MASTER_CHECKLIST.md](./docs/MASTER_CHECKLIST.md)
- Architecture handbook: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- Database handbook: [docs/DATABASE.md](./docs/DATABASE.md)
- Design system: [docs/UI_DESIGN_SYSTEM.md](./docs/UI_DESIGN_SYSTEM.md)
- Release process: [docs/RELEASE_PROCESS.md](./docs/RELEASE_PROCESS.md)
- Auto sprint system: [docs/auto_sprint.md](./docs/auto_sprint.md)

## Repository Rules
- Work from the repository root: `/workspace/playbook-platform`.
- Read this file and any scoped `AGENTS.md` before editing files.
- Preserve unrelated user changes and inspect `git status --short` before committing.
- Do not modify application code for documentation-only tasks unless required to fix broken documentation references.
- Prefer small, focused changes with clear commit history.

## Coding Conventions
- Keep business logic in domain modules under `lib/` and keep route/page files focused on composition.
- Reuse existing utilities before introducing new abstractions.
- Use descriptive names that match Playbook terminology: Scholar, Portfolio, Scholar Record, role, permission, opportunity, evidence, verification, and journey.
- Avoid dead code, hidden feature flags, and undocumented side effects.
- Never wrap imports in `try`/`catch` blocks.

## TypeScript Standards
- Use strict, explicit types for domain models and public function signatures.
- Prefer discriminated unions for role-specific and status-specific flows.
- Avoid `any`; if an external boundary is unknown, validate and narrow it.
- Keep Supabase row shapes and application models intentionally mapped rather than loosely spread across the app.
- Ensure async functions return predictable success or error shapes.

## React Standards
- Prefer functional components and hooks.
- Keep components small, accessible, and state-explicit.
- Do not duplicate shared UI; extract reusable patterns into `components/` when they serve more than one route.
- Model loading, empty, error, success, and permission-restricted states deliberately.
- Use semantic HTML and ARIA only when native semantics are insufficient.

## Next.js Standards
- This repository uses a modern Next.js version with breaking changes from older conventions. Before editing Next.js-specific code, read the relevant guide in `node_modules/next/dist/docs/`.
- Use App Router patterns in `app/` for pages, layouts, and route handlers.
- Keep server-only logic out of client components.
- Keep environment-dependent Supabase and secret-bearing logic in server boundaries.
- Use route handlers for API surfaces and document API strategy in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md#api-strategy).

## Supabase Standards
- Treat Supabase as a production data boundary, not a client-side convenience layer.
- Enforce Row Level Security for user-owned or role-restricted data.
- Add migrations under `supabase/migrations/` for schema changes.
- Use indexes for common lookups, relationship joins, feeds, and status filters.
- Document table, relationship, index, and RLS changes in [docs/DATABASE.md](./docs/DATABASE.md).

## Component Reuse Policy
- Check `components/`, `lib/design-system/`, and existing route implementations before creating new UI.
- Shared components must accept clear props, expose accessible markup, and avoid route-specific assumptions.
- Feature-specific components may live in feature folders but should graduate to shared components after reuse.
- Do not fork components only to change spacing, copy, or color; use tokens and variants.

## Testing Expectations
- Run `npm run lint` for all code changes.
- Run `npm run build` before release-oriented or application-impacting changes.
- Run targeted tests when changing domain logic, API handlers, permissions, data models, or UI behavior.
- Document any environment limitation clearly in the pull request.

## Documentation Requirements
- Update docs in the same change when behavior, architecture, database, UI standards, or release workflow changes.
- Documentation must include title, purpose, ownership, last updated date, and related links when it is part of the engineering handbook.
- Do not add placeholder language.
- Keep terminology consistent with [CODEX.md](./CODEX.md).

## Pull Request Expectations
- Pull requests must include a concise title, summary, test evidence, risk notes, and documentation impact.
- Link related roadmap, checklist, decision, release, or database documentation when relevant.
- The pull request should be reviewable without requiring hidden context.

## Commit Message Conventions
Use concise conventional commits:

- `docs: ...` for documentation-only changes.
- `feat: ...` for user-facing functionality.
- `fix: ...` for bug fixes.
- `refactor: ...` for behavior-preserving code changes.
- `test: ...` for test-only changes.
- `chore: ...` for maintenance.

## Prohibited Behaviors
- Do not commit secrets, `.env` files, credentials, or tokens.
- Do not introduce placeholders, fabricated implementation details, or unverifiable claims.
- Do not bypass lint, type, build, RLS, or permission failures without documenting and resolving the root cause.
- Do not delete historical documentation unless explicitly requested and reviewed.
- Do not make broad formatting-only changes outside the requested scope.
