# Playbook OS Architecture

## Purpose
This document explains the Playbook OS platform architecture for engineers, reviewers, and AI coding agents working on production SaaS functionality.

## Ownership
Owned by Playbook OS Engineering. Security-sensitive architecture changes require review from the platform owner and must be recorded in [DECISIONS.md](./DECISIONS.md).

## Last Updated
July 23, 2026

## Related Documents
- Constitution: [../CODEX.md](../CODEX.md)
- Agent rules: [../AGENTS.md](../AGENTS.md)
- Database: [DATABASE.md](./DATABASE.md)
- Design system: [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md)
- Roadmap: [ROADMAP.md](./ROADMAP.md)
- Release process: [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)

## Platform Overview
Playbook OS is a Next.js App Router SaaS platform backed by Supabase and organized around the Scholar Record. The application presents role-aware dashboards and workflows for Scholars, families, educators, mentors, districts, universities, employers, admins, and partners.

## Architecture Philosophy
Playbook OS is not simply a web application; it is an Operating System for Scholars. The architecture must help Scholars build identity, prove achievement, receive support, discover opportunities, and continue growing over a lifetime.

Every architectural decision should support one or more platform pillars:

- Scholar Record
- Opportunity
- Community
- Verification
- Trust
- Lifelong Growth

The Scholar Record is the center of gravity for the platform. Domain engines create meaning from raw data, while pages and dashboards present that meaning to the right role at the right time. Engineering should therefore prioritize durable domain models, reusable engines, trustworthy permissions, and role-aware presentation over isolated page-level implementations.

## Scholar Record First Principle
Every feature must either:

- Improve the Scholar Record.
- Verify the Scholar Record.
- Interpret the Scholar Record.
- Present the Scholar Record.
- Unlock opportunities through the Scholar Record.

If a feature accomplishes none of these objectives, reconsider whether it belongs in Playbook OS. The Scholar Record is the platform's primary source of truth for achievement, evidence, relationships, readiness, and opportunity activation.

## Folder Structure
| Path | Responsibility |
| --- | --- |
| `app/` | App Router pages, layouts, route handlers, global styles, and route-level composition |
| `components/` | Reusable UI and feature components used by pages and workflows |
| `lib/` | Domain engines, clients, permissions, event bus, navigation, AI integrations, and business logic |
| `supabase/migrations/` | SQL migrations for schema, indexes, functions, and RLS policies |
| `docs/` | Engineering handbook, product records, architecture records, release history, and historical context |
| `tests/` | Test guidance and test-supporting documentation |

## App Router
Routes are implemented under `app/`. Page files compose feature experiences, layout files define shared shells, and route handlers under `app/api/` expose server-side API surfaces. Sensitive logic should remain in server contexts, while client components should focus on interaction and presentation.

## Authentication
Authentication is Supabase-backed. Client access should use public session-aware clients only for user-permitted operations. Server routes and server components are responsible for privileged decisions, identity verification, and writes that require trusted environment variables.

## Supabase
Supabase provides database, auth, and storage-adjacent capabilities. Schema changes live in `supabase/migrations/` and must be documented in [DATABASE.md](./DATABASE.md). Row Level Security protects user-owned, relationship-owned, and role-restricted records.

## Role System
Playbook OS models role-specific experiences rather than one generic account surface. Role logic is represented in `lib/role-os/`, `lib/permissions/`, `lib/navigation/`, and route-level dashboards. Supported role families include Scholar, family/guardian, educator, counselor, mentor, coach, district, university, employer, brand partner, and admin.

## Permissions
Permissions are relationship-aware. A user may access a Scholar's record only through ownership, invitation, institutional relationship, support relationship, or administrative authority. Permission logic should be centralized in domain modules and backed by database RLS whenever data crosses the Supabase boundary.

## Starting Five Architecture
The Starting Five is a core architectural subsystem for trusted Scholar support. It creates the relationship graph that powers:

- Invitations
- Permissions
- Collaboration
- Messaging
- Recommendations
- Support Networks

Relationship validation is enforced through both application logic and Supabase Row Level Security. This ensures that support roles can collaborate with Scholars without weakening privacy, ownership, or trust boundaries.

## Role-Based Operating Systems
Playbook OS provides independent operating systems built on one shared platform. Current operating systems include:

- Scholar OS
- Scholar-Athlete OS
- Parent / Guardian OS
- Teacher / Educator OS
- Counselor OS
- Mentor OS
- Coach OS
- College Recruiter OS
- College Admissions OS
- Employer OS
- Brand Partner OS
- Founder OS
- Athlete Abroad Hub
- Transition-Aged Youth OS
- District / School Administrator OS
- Community Partner OS
- Platform Administration OS

The executable registry declares exactly 17 unique OS identifiers and routes.
Operating systems may share platform components, but they do not share route
identity. Route presence is only implementation evidence; each OS still needs
role-specific workflows, permissions, durable data, recovery, and acceptance
evidence before certification.

## Role Dashboard Architecture
Dashboards are route-level experiences under `app/` that compose shared navigation, domain engines, and reusable components. Role dashboards should expose next actions, evidence status, opportunity status, messages, notifications, and trust/safety states relevant to that role.

## Shared Components
Reusable components live in `components/` and should follow [UI_DESIGN_SYSTEM.md](./UI_DESIGN_SYSTEM.md). Components should be accessible, responsive, token-driven, and free of hidden database side effects. Feature components may remain domain-specific until reuse justifies extraction.

## Domain Engine Architecture
Business logic belongs inside reusable domain engines rather than page components. Domain engines transform raw data into reusable business models consumed by dashboards, APIs, and user interfaces.

Major engines currently used or planned include:

- Scholar Record Engine
- Portfolio Engine
- Academic Intelligence Engine
- Opportunity Engine
- Event Engine
- Community Engine
- Learning Engine
- Compass AI
- Document Intelligence
- Gamification Engine
- Notification Engine
- Messaging Engine
- Trust Engine

Engines should expose stable interfaces, avoid route-specific assumptions, and keep platform rules testable outside of page rendering. Pages compose these engines; they should not become the permanent home for scoring, eligibility, recommendation, permission, or achievement logic.

## Gamification Architecture
Playbook OS uses gamification to reinforce authentic achievement rather than maximize engagement metrics. Reward systems include:

- XP
- Coins
- Badges
- Certificates
- Milestones
- Streaks
- Progress Tracking

Gamification should be connected to meaningful learning, verified progress, portfolio completion, community contribution, and opportunity readiness. Reward events should be traceable and resistant to abuse.

## Learning Architecture
The education platform supports:

- Courses
- Modules
- Assessments
- Reflections
- Certificates
- XP Rewards
- Coin Rewards

Meaningful course completion should update the Scholar Record automatically whenever appropriate. Learning workflows should connect instruction, reflection, evidence, completion, rewards, and portfolio growth rather than functioning as isolated content consumption.

## Opportunity Platform
Verified Scholar Record data powers recommendations for:

- Colleges
- Scholarships
- Employment
- Internships
- Mentorship
- NIL
- Athletics
- Study Abroad
- Events
- Brand Partnerships

Opportunity recommendations are generated through platform intelligence rather than static listings. The Opportunity Platform should consider readiness, evidence, role context, goals, relationships, and trust signals before surfacing actions.

## Trust Layer
The Trust Layer evaluates the quality and reliability of the Scholar Record using signals such as:

- Activity
- Evidence
- Verification
- Achievement
- Outcomes
- Community

Trust powers recommendations, opportunity readiness, verification workflows, moderation decisions, and future AI capabilities. Trust signals should be explainable enough for Scholars and support roles to understand what improves readiness.

## Playbook Event Bus
Domain engines communicate through an event-driven architecture rather than direct coupling. Example event flow:

Achievement Created

↓

Scholar Record Updated

↓

Trust Engine

↓

Portfolio Engine

↓

Opportunity Engine

↓

Notifications

↓

Compass AI

↓

Role Dashboards

The Event Bus enables scalable platform evolution while minimizing coupling between systems. New events should define actor, subject, payload, permissions, lifecycle, and downstream consumers.

## Data Flow
1. Users authenticate through Supabase.
2. Routes load permitted records through server-aware clients or route handlers.
3. Domain engines in `lib/` transform database rows into product-ready models.
4. UI components render role-specific experiences and actions.
5. User actions call route handlers or server-safe functions.
6. Writes update Supabase, emit events, and refresh downstream views.
7. Intelligence engines may consume Scholar Record data and produce reviewed recommendations.

## API Strategy
API route handlers in `app/api/` own server-side integrations, trusted writes, and workflows that must not expose secrets to browsers. API responses should use predictable status codes and stable JSON shapes. New APIs must document data ownership, permissions, validation, errors, and test coverage.

## State Management
Prefer server-rendered data and local React state for route-level interactions. Use domain engines for computed state and avoid introducing global state unless multiple independent routes require the same client-side source of truth. Persist durable state in Supabase rather than browser-only stores.

## Deployment
Deployments should follow [RELEASE_PROCESS.md](./RELEASE_PROCESS.md). Production deployment requires passing build, lint, migration review, environment variable verification, observability readiness, and rollback planning.

## Architecture Change Control
Material architecture decisions must be recorded in [DECISIONS.md](./DECISIONS.md). Examples include changing auth providers, introducing new global state, adding third-party data processors, changing role boundaries, or adopting a new deployment architecture.
