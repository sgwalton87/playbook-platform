# Playbook OS Product Roadmap

## Purpose
This roadmap describes the long-term product and technical direction for Playbook OS from foundation through production release and future expansion.

This roadmap is a future-direction document, not the implementation source of truth. Use [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md) for current build status, active blockers, sprint execution, QA evidence, and release readiness.

## Ownership
Owned by Product and Engineering. Product owns milestone priority; Engineering owns technical sequencing and release feasibility.

## Last Updated
July 23, 2026

## Related Documents
- Master checklist: [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Database: [DATABASE.md](./DATABASE.md)
- Design system: [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md)
- Release process: [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)

## Roadmap Principles
- Build the Scholar Record as the durable system of truth.
- Prioritize verified evidence over self-reported claims.
- Make opportunity workflows easier for Scholars and more trustworthy for supporters.
- Ship role-aware surfaces before expanding high-stakes collaboration.
- Preserve a clear upgrade path from beta to production SaaS operations.

## Phase 1: Foundation
### Product Milestones
- Scholar onboarding and profile foundations.
- Portfolio view, share, export, and completion indicators.
- Core dashboards for primary roles.
- Initial Opportunity and Compass surfaces.

### Technical Milestones
- Stabilize App Router route ownership.
- Normalize Supabase migrations and RLS patterns.
- Establish shared navigation and role routing.
- Establish documentation, release, and decision records.

## Phase 2: Guided Journeys
### Product Milestones
- Application workspace and recommendation workflows.
- Family, mentor, educator, and counselor support journeys.
- Notifications and digest experiences.
- Guided portfolio improvement actions.

### Technical Milestones
- Harden invitation and relationship activation flows.
- Add tests for role transitions and permission boundaries.
- Expand event bus usage for journey state changes.
- Improve reusable component and design token coverage.

## Phase 3: Intelligence Layer
### Product Milestones
- Academic Intelligence for transcript and readiness insights.
- Portfolio Intelligence for evidence quality and completion.
- Opportunity matching informed by verified records.
- Compass AI assistance with human-controlled outcomes.

### Technical Milestones
- Define AI input, output, audit, and safety contracts.
- Centralize engine interfaces under `lib/engines/` and domain modules.
- Store intelligence outputs with provenance and review states.
- Add deterministic tests for recommendations and scoring logic.

## Phase 4: Network OS
### Product Milestones
- Support network messaging and action routing.
- Community events, mentorship, and collaboration tools.
- District, university, employer, and brand partner operating surfaces.
- Trust and safety workflows for reporting, blocking, and moderation.

### Technical Milestones
- Formalize role relationship matrix.
- Add moderation audit logs and escalation states.
- Harden real-time and notification delivery rules.
- Expand analytics for activation, retention, safety, and outcomes.

## Production Release
### Product Milestones
- Public SaaS launch for approved customer segments.
- Release notes, support process, onboarding documentation, and customer-facing help paths.
- Launch readiness for Scholars and support roles.

### Technical Milestones
- CI gates for lint, build, tests, link checks, and migration validation.
- Production observability with alerts and ownership.
- Database backup and rollback runbooks.
- Security, privacy, and accessibility launch review.

## Future Expansion
- Mobile-first Progressive Web App enhancements.
- Native mobile companion experiences if product usage warrants them.
- Partner APIs for verified achievements, opportunity ingestion, and institutional reporting.
- Marketplace-style opportunity, mentor, and brand partner ecosystems.
- Advanced portfolio media, evidence packs, and longitudinal outcome reporting.

## Roadmap Governance
The roadmap is reviewed at release planning and after major ADRs. Material shifts should be reflected in [DECISIONS.md](./DECISIONS.md), delivery status should update [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md), and shipped work should follow [RELEASE_PROCESS.md](./RELEASE_PROCESS.md).
