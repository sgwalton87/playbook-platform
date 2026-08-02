# Playbook OS UI Design System

## Purpose
This document defines the Playbook OS visual, interaction, accessibility, and component standards for a production SaaS platform.

## Ownership
Owned by Design and Engineering. Design owns visual direction and usability; Engineering owns implementation quality and component reuse.

## Last Updated
July 23, 2026

## Related Documents
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Agent rules: [../AGENTS.md](../AGENTS.md)
- Roadmap: [ROADMAP.md](./ROADMAP.md)
- Release process: [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)

## Theme
Playbook OS should feel trustworthy, empowering, modern, and student-centered. Interfaces should highlight next actions, progress, verified evidence, and opportunity readiness without overwhelming Scholars or support roles.

## Philosophy
Playbook is not a school portal. Playbook is a Learner Operating System.

Every interface should help the learner answer four questions:

- Who am I becoming?
- What have I proven?
- What opportunities are opening?
- What should I do next?

This philosophy should guide every screen, workflow, dashboard, and interaction. Design decisions should make identity, evidence, opportunity, and next action more visible without making the product feel transactional or institutional.

## Signature Playbook Experiences
The following product concepts define the platform experience and should be treated as design systems, not isolated features:

- Living Dashboard: a role-aware home surface that adapts to progress, priorities, and current opportunities.
- Academic DNA: an academic identity model that translates transcripts, readiness, strengths, and recommendations into understandable guidance.
- Opportunity Galaxy: an opportunity discovery model that makes colleges, scholarships, careers, mentorship, athletics, events, and partnerships feel connected.
- Compass Home: the guidance center that helps users understand what matters now and what action should happen next.
- Growth Journey: the visible path from onboarding through evidence, learning, recognition, opportunity, and outcomes.
- Achievement Showcase: the presentation layer for verified accomplishments, certificates, milestones, media, and artifacts.
- Scholar Genome: the deeper model of strengths, interests, evidence, readiness, and growth patterns that informs intelligent guidance.
- Evidence Packs: bundled proof of achievement that can support portfolios, recommendations, applications, and opportunity workflows.
- Trust Layer: the visual and interaction language for verified, reliable, and high-confidence records.
- Starting Five: the trusted relationship graph of supporters who help a Scholar move forward.

## Dashboard Hierarchy
Every dashboard should prioritize information in this order:

1. Next Action
2. Progress
3. Scholar Record
4. Opportunities
5. Community
6. Messages
7. Recognition

Dashboards may adapt this hierarchy for role-specific needs, but they should not bury the next meaningful action beneath secondary analytics or decorative content.

## Celebration Design Language
Playbook celebrates achievement through:

- XP
- Coins
- Badges
- Certificates
- Milestones
- Streaks
- Opportunity Unlocks

Celebration exists to reinforce authentic achievement rather than maximize engagement metrics. Rewards should feel earned, specific, and connected to growth, evidence, community contribution, learning, or opportunity readiness.

## Role-Based Design Principles
Every operating system shares one Playbook design language while exposing role-specific workflows. Supported role experiences include:

- Scholar
- Scholar Athlete
- Parent
- Mentor
- Teacher
- Coach
- Founder
- Employer
- Brand Partner
- Admissions
- District

Role experiences should feel consistent in layout, hierarchy, tone, accessibility, and component behavior. Differences should come from workflow, permissions, intelligence, and domain emphasis rather than disconnected visual systems.

## Empty State Philosophy
Empty states should:

- Educate users about what belongs in the space.
- Inspire confidence that progress is possible.
- Explain why the area is currently empty.
- Provide a clear next step.

Avoid dead ends. Empty states should help Scholars and support roles understand how to create evidence, invite support, unlock recommendations, or return to the next meaningful action.

## Component Taxonomy
Shared components should be organized into durable categories:

- Foundation: tokens, typography, surfaces, buttons, forms, cards, badges, and layout primitives.
- Navigation: shells, sidebars, tabs, breadcrumbs, role switchers, and mobile navigation.
- Scholar Record: profile cards, evidence cards, achievement timelines, record summaries, verification states, and portfolio modules.
- Learning: course cards, module progress, assessments, reflections, certificates, and completion states.
- Gamification: XP, coins, badge awards, streaks, milestones, progress meters, and unlock moments.
- Messaging: inbox, threads, message composer, read states, safety actions, and notifications.
- Opportunities: opportunity cards, match reasons, readiness indicators, application actions, and saved lists.
- Administration: moderation queues, user management, verification review, feature flags, and system health surfaces.
- Analytics: metric cards, charts, trend summaries, readiness reports, and cohort views.
- Feedback: empty states, loading states, success states, error states, warnings, toasts, and permission-denied states.

## Colors
Use design tokens from the application styling layer and `lib/design-system/` when available. Color usage should follow these semantic roles:

- Primary: main calls to action and active navigation.
- Surface: page backgrounds, cards, panels, and dashboards.
- Accent: achievement, opportunity, and celebratory moments.
- Success: completed actions, verified evidence, and release-ready states.
- Warning: blocked, at-risk, or attention-needed states.
- Danger: destructive actions, trust/safety issues, and irreversible operations.
- Muted: secondary text, metadata, and inactive states.

Never rely on color alone to communicate meaning.

## Typography
- Use clear hierarchy: page title, section heading, card heading, body, metadata, and label.
- Keep copy concise and action-oriented.
- Prefer sentence case for headings and buttons.
- Use numeric summaries for progress, completion, readiness, and counts when they aid decision-making.

## Spacing
- Use consistent spacing tokens rather than ad hoc pixel values.
- Group related information inside cards or sections.
- Preserve enough whitespace for mobile readability.
- Avoid dense dashboards that hide the next action.

## Components
Shared components should provide predictable variants for:

- Buttons and links.
- Cards and panels.
- Empty states.
- Loading skeletons or loading messages.
- Error and permission-denied states.
- Progress indicators.
- Role badges and status badges.
- Forms, field groups, validation messages, and helper text.
- Navigation and dashboard shells.

## Motion
Motion should clarify state changes, celebrate meaningful achievements, and never block task completion. Motion should communicate progress, achievement, trust, and workflow transitions rather than decorative animation. Use motion sparingly, respect reduced-motion preferences, and avoid animation for critical safety or error messaging.

## Accessibility
- Use semantic HTML first.
- Support keyboard navigation and visible focus states.
- Maintain readable contrast across light and dark surfaces.
- Associate labels with inputs and provide helpful validation text.
- Announce important async state changes when necessary.
- Design all core workflows for desktop, tablet, and mobile.

## Responsive Design
Playbook OS is mobile-first but dashboard-capable. Pages should preserve core task completion on narrow screens and progressively enhance multi-column layouts for larger screens. Avoid desktop-only controls for required workflows.

## Tokens
Tokens should represent semantic meaning rather than one-off visual choices. Preferred token groups include color, typography, spacing, radius, shadow, motion, z-index, and breakpoint tokens. Token changes are platform changes and should be reviewed with [ARCHITECTURE.md](./ARCHITECTURE.md) in mind.

## Shared UI Components
Before adding UI, search existing `components/`, `app/`, and `lib/design-system/` patterns. Reuse components when the behavior and semantics match. Extract shared components after repeated use across routes or roles.

## Design Rules
- Every page needs a clear primary action or explicit read-only purpose.
- Every dashboard should show progress, next actions, and relevant alerts.
- Every role-specific view should make permissions understandable.
- Forms must explain why sensitive data is requested.
- Empty states should educate and offer a next step.
- Error states should be recoverable when possible.

## Launch Surface State Contract (August 1, 2026)

Launch-facing workflows use `PlaybookSurfaceState` for explicit loading, empty, error, and permission-restricted states. Error states use alert semantics; loading states expose `aria-busy`; restricted states explain the authorization recovery action without implying missing data. Accessible reference implementations for buttons, cards, badges, metrics, forms, and workflow states live at `/design-system/examples`.
