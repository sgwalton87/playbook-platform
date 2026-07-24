# Playbook OS Architecture Decision Records

## Purpose
This document is the Architecture Decision Record index for important Playbook OS technical and product-architecture choices.

## Ownership
Owned by Playbook OS Engineering. Product, Design, Data, Security, and Operations contribute decisions when their domains are affected.

## Last Updated
July 23, 2026

## Related Documents
- Constitution: [../CODEX.md](../CODEX.md)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Database: [DATABASE.md](./DATABASE.md)
- UI design system: [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md)
- Release process: [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)
- Existing ADR folder: [DECISIONS/README.md](./DECISIONS/README.md)

## Guiding Principles
These architectural beliefs are constitutional principles rather than one-time implementation decisions:

- Scholar Record First: every feature should improve, verify, interpret, present, or activate the Scholar Record.
- Living Evidence: achievement becomes more valuable when it is supported by documents, media, certificates, reflections, artifacts, outcomes, and verification.
- Domain Engines: durable business meaning belongs in engines and repositories rather than page components.
- Trust Layer: recommendations and opportunity readiness depend on evidence quality, verification, achievement, outcomes, activity, and community signals.
- Starting Five: trusted relationships are a platform subsystem for permissions, collaboration, messaging, and support.
- Role-Based Operating Systems: Playbook OS is one shared platform with role-specific operating systems.
- Opportunity First: records, learning, community, and intelligence should unlock real opportunities.
- Operating System over LMS: Playbook OS is broader than courses; learning is one engine inside a lifelong Scholar operating system.

## ADR Categories
Decisions should be categorized for long-term navigation:

- Architecture
- Database
- Security
- AI
- Product
- UI/UX
- Infrastructure
- Operations
- Documentation

## Preserve History
Never delete old architectural decisions. Instead mark them as Accepted, Superseded, Deprecated, Historic, or Rejected. Architecture history is institutional knowledge: it explains why Playbook OS evolved toward its current shape and helps future engineers avoid repeating settled debates.

## ADR Format
Every material decision should use this structure:

### Decision Number
Use `ADR-####` with a four-digit sequence.

### Date
Use an absolute date in `YYYY-MM-DD` format.

### Context
Describe the problem, constraints, stakeholders, and why the decision matters now.

### Decision
State the selected path clearly.

### Alternatives
List serious alternatives and why they were not selected.

### Consequences
Document benefits, tradeoffs, risks, follow-up work, and operational impact.

### Status
Use one of: Proposed, Accepted, Superseded, Deprecated, Historic, Rejected.

## Categorized Decision Index

### Architecture
| Decision | Date | Context | Decision | Status |
| --- | --- | --- | --- | --- |
| ADR-0002 | 2026-07-23 | The platform needs a stable data center for portfolios, recommendations, and support workflows. | Treat the Scholar Record as the primary source of truth and require new features to improve or responsibly consume it. | Accepted |
| ADR-0005 | 2026-07-07 | Intelligence systems needed a stable boundary between domain meaning and persistence. | Adopt Engine → Repository architecture so engines create meaning and repositories own durable access. | Historic |
| ADR-0006 | 2026-07-07 | Features needed a consistent internal interface to engines, repositories, records, graphs, and UI primitives. | Establish the Playbook SDK as the internal access layer for platform capabilities. | Historic |
| ADR-0009 | 2026-07-07 | Platform health needed automated verification of critical subsystems. | Establish Sentinel as the health-checking subsystem for SDK, engines, events, migrations, docs, and tests. | Historic |
| ADR-0010 | 2026-07-07 | The repository needed generated architecture maps without manual drift. | Establish Cartographer as the system-map and catalog generator. | Historic |
| ADR-0012 | 2026-07-07 | Academic Intelligence needed transcript-aware reasoning beyond static GPA displays. | Establish Academic Intelligence v2 around Academic DNA, transcript analysis, readiness, and recommendations. | Historic |
| ADR-0013 | 2026-07-07 | Opportunity recommendations needed a graph model rather than static listings. | Establish Opportunity Graph for matching Scholars to colleges, scholarships, careers, mentorship, and related opportunities. | Historic |
| ADR-0014 | 2026-07-07 | Engine boundaries needed to remain stable as Playbook moved toward Alpha. | Freeze Alpha architecture around records, graph, event bus, engines, repositories, SDK, and intelligence layers. | Historic |

### Database
| Decision | Date | Context | Decision | Status |
| --- | --- | --- | --- | --- |
| ADR-0003 | 2026-07-23 | Role-specific SaaS workflows require consistent permission boundaries. | Centralize role and permission logic in domain modules and enforce sensitive access through Supabase RLS. | Accepted |

### AI
| Decision | Date | Context | Decision | Status |
| --- | --- | --- | --- | --- |
| ADR-0007 | 2026-07-07 | Scholars needed explainable next-step guidance from platform intelligence. | Establish Compass as the reasoning and recommendation layer for guided action. | Historic |
| ADR-0015 | 2026-07-07 | The platform needed reusable intelligence engines rather than feature-specific AI calls. | Establish engine architecture for Compass, Academic Intelligence, Opportunity Graph, Trust, Timeline, and Portfolio intelligence. | Historic |

### UI/UX
| Decision | Date | Context | Decision | Status |
| --- | --- | --- | --- | --- |
| ADR-0004 | 2026-07-23 | UI quality must scale across dashboards, roles, and opportunity workflows. | Use a token-driven shared design system and require reusable components for repeated patterns. | Accepted |

### Documentation
| Decision | Date | Context | Decision | Status |
| --- | --- | --- | --- | --- |
| ADR-0001 | 2026-07-23 | Playbook needs a durable engineering handbook for human and AI contributors. | Establish `CODEX.md`, root `AGENTS.md`, and the canonical `docs/` handbook files as the production documentation system. | Accepted |
| ADR-0008 | 2026-07-07 | Architecture, roadmap, release, and implementation history needed durable institutional memory. | Establish Archivist as the documentation and repository-history intelligence subsystem. | Historic |
| ADR-0011 | 2026-07-07 | Documentation quality needed automated governance as the repository grew. | Establish Documentation Governor to scan, index, and consolidate documentation health. | Historic |

## Historical Decision Notes
- Engine → Repository architecture keeps business interpretation separate from persistence access.
- Playbook SDK prevents features from importing random internal paths and creates a stable internal platform API.
- Compass centralizes guidance, explainability, goals, reasoning, and next steps.
- Sentinel verifies that critical subsystems remain present and connected.
- Archivist preserves repository and documentation memory.
- Cartographer maps files, engines, repositories, events, components, pages, migrations, tests, and docs.
- Documentation Governor protects discoverability and prevents documentation drift.
- Academic Intelligence v2 connects transcript analysis, Academic DNA, readiness, and recommendations.
- Opportunity Graph models opportunity matching as relationships rather than static listings.
- Engine architecture keeps Compass, Academic Intelligence, Opportunity Graph, Trust, Timeline, Portfolio, and other engines reusable.
- Alpha architecture freeze records the milestone where Playbook OS stabilized around records, graph, event bus, engines, repositories, SDK, and intelligence infrastructure.

## Decision Index
| Decision | Date | Context | Decision | Status |
| --- | --- | --- | --- | --- |
| ADR-0001 | 2026-07-23 | Playbook needs a durable engineering handbook for human and AI contributors. | Establish `CODEX.md`, root `AGENTS.md`, and the canonical `docs/` handbook files as the production documentation system. | Accepted |
| ADR-0002 | 2026-07-23 | The platform needs a stable data center for portfolios, recommendations, and support workflows. | Treat the Scholar Record as the primary source of truth and require new features to improve or responsibly consume it. | Accepted |
| ADR-0003 | 2026-07-23 | Role-specific SaaS workflows require consistent permission boundaries. | Centralize role and permission logic in domain modules and enforce sensitive access through Supabase RLS. | Accepted |
| ADR-0004 | 2026-07-23 | UI quality must scale across dashboards, roles, and opportunity workflows. | Use a token-driven shared design system and require reusable components for repeated patterns. | Accepted |
| ADR-0005 | 2026-07-07 | Intelligence systems needed a stable boundary between domain meaning and persistence. | Adopt Engine → Repository architecture. | Historic |
| ADR-0006 | 2026-07-07 | Features needed a consistent internal interface to platform capabilities. | Establish the Playbook SDK. | Historic |
| ADR-0007 | 2026-07-07 | Scholars needed explainable next-step guidance from platform intelligence. | Establish Compass. | Historic |
| ADR-0008 | 2026-07-07 | Architecture, roadmap, release, and implementation history needed durable institutional memory. | Establish Archivist. | Historic |
| ADR-0009 | 2026-07-07 | Platform health needed automated verification of critical subsystems. | Establish Sentinel. | Historic |
| ADR-0010 | 2026-07-07 | The repository needed generated architecture maps without manual drift. | Establish Cartographer. | Historic |
| ADR-0011 | 2026-07-07 | Documentation quality needed automated governance as the repository grew. | Establish Documentation Governor. | Historic |
| ADR-0012 | 2026-07-07 | Academic Intelligence needed transcript-aware reasoning beyond static GPA displays. | Establish Academic Intelligence v2. | Historic |
| ADR-0013 | 2026-07-07 | Opportunity recommendations needed a graph model rather than static listings. | Establish Opportunity Graph. | Historic |
| ADR-0014 | 2026-07-07 | Engine boundaries needed to remain stable as Playbook moved toward Alpha. | Freeze Alpha architecture. | Historic |
| ADR-0015 | 2026-07-07 | The platform needed reusable intelligence engines rather than feature-specific AI calls. | Establish engine architecture. | Historic |

## ADR-0001: Canonical Engineering Documentation System
### Decision Number
ADR-0001

### Date
2026-07-23

### Context
The repository contains rich historical and product documentation, but the engineering team needs a concise canonical handbook at predictable paths for day-to-day implementation, review, release, and AI-agent work.

### Decision
Create root-level `CODEX.md` and `AGENTS.md`, plus the canonical documentation set in `docs/`: `MASTER_CHECKLIST.md`, `ROADMAP.md`, `ARCHITECTURE.md`, `DATABASE.md`, `UI_DESIGN_SYSTEM.md`, `DECISIONS.md`, and `RELEASE_PROCESS.md`.

### Alternatives
- Keep only historical documents: rejected because sprint execution needs operational guidance.
- Put all guidance in one large file: rejected because separate architecture, database, UI, and release concerns need focused ownership.

### Consequences
Contributors have a predictable source of truth. Documentation must stay synchronized with code and roadmap changes.

### Status
Accepted

## ADR-0002: Scholar Record First
### Decision Number
ADR-0002

### Date
2026-07-23

### Context
Playbook OS serves many roles, but the product value depends on verified Scholar evidence that can power portfolios, opportunities, recommendations, and intelligence.

### Decision
The Scholar Record is the primary product data concept. Features should either improve it, interpret it, protect it, or activate it for a valid role.

### Alternatives
- Build isolated features per role: rejected because it fragments the Scholar journey.
- Treat the portfolio as only a presentation layer: rejected because evidence and verification need durable data modeling.

### Consequences
Architecture, database, AI, and UI work must consider Scholar Record impact. Domain engines should consume normalized data rather than duplicated route-specific models.

### Status
Accepted

## ADR-0003: Role-aware Permission Boundaries
### Decision Number
ADR-0003

### Date
2026-07-23

### Context
Families, educators, mentors, districts, universities, employers, partners, and admins need different access to Scholar data. Permission drift would create privacy and trust risks.

### Decision
Centralize application permission logic and pair it with Supabase RLS for sensitive data access.

### Alternatives
- Check permissions only in UI: rejected because client controls are not a security boundary.
- Use one broad support-role permission: rejected because relationships and institutions need scoped access.

### Consequences
New workflows must define role, relationship, ownership, and database access rules before release.

### Status
Accepted

## ADR-0004: Token-driven Shared UI
### Decision Number
ADR-0004

### Date
2026-07-23

### Context
Playbook OS includes many dashboards and role surfaces. Inconsistent UI would slow delivery and reduce trust.

### Decision
Use a shared, token-driven design system and extract reusable components for repeated interaction patterns.

### Alternatives
- Let each route define independent styling: rejected because it increases maintenance and visual inconsistency.
- Freeze all UI into one rigid component framework: rejected because product discovery still needs controlled iteration.

### Consequences
Design changes should happen through tokens and shared components where possible. Route-specific UI remains acceptable for unique experiments that are later consolidated.

### Status
Accepted
