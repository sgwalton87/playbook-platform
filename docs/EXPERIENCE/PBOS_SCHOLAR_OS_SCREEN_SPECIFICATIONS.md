# PBOS Scholar OS Screen Specifications

**Purpose:** Define implementation-ready contracts for the seven primary Scholar OS screens.  
**Owner:** Playbook OS Engineering  
**Last Updated:** July 30, 2026  
**Related:** [Application Architecture](./PBOS_SCHOLAR_OS_APPLICATION_ARCHITECTURE.md), [User Flows](./PBOS_SCHOLAR_OS_USER_FLOW_ARCHITECTURE.md)

## Canonical States

Every screen implements:

| State | Required Behavior |
|---|---|
| Loading | Preserve layout while governed data and decisions resolve |
| Empty | State that no authorized records exist; never invent examples as facts |
| First-time | Present consent-aware setup appropriate to the Scholar |
| Success | Display authorized, provenance-preserving content |
| Error | Explain failure and provide a reversible recovery action |
| Locked | Explain the governed capability boundary without implying purchase grants authority |
| Permission required | Identify required permission or consent and the authorized request path |
| Unavailable | Do not expose unsupported actions or fabricated content |

## Scholar Home

- **Purpose:** Orient the Scholar around identity, progress, goals, actions, and opportunities.
- **Audience:** Scholar.
- **Primary action:** Review the next governed action.
- **Secondary actions:** Review goals, progress, and opportunity details.
- **Hierarchy:** Welcome, Scholar snapshot, goals, progress, next actions, opportunity highlights.
- **Components:** Identity summary, goal summary, progress indicators, recommendation list, opportunity highlights.
- **Data:** Scholar Record references, evidence-backed milestones, capability decisions.
- **Ownership:** Scholar.
- **Permissions:** Home and Scholar Record read.
- **Capabilities:** Scholar Record; future Compass and Opportunity connections.

## Scholar Profile

- **Purpose:** Present and maintain the Scholar-owned identity and development story.
- **Audience:** Scholar; separately authorized supporting roles.
- **Primary action:** Review or propose a profile update.
- **Secondary actions:** Attach evidence, inspect source, review revision history.
- **Hierarchy:** Identity, education, athletics, interests, achievements, skills, activities.
- **Components:** Profile sections, provenance detail, evidence attachment, revision history.
- **Data:** Human-confirmed Scholar facts with owner, source, timestamp, evidence, and revision.
- **Ownership:** Scholar.
- **Permissions:** Profile read; governed write for changes; sensitive-read for protected fields.
- **Capabilities:** Scholar Record read/write.

## Scholar Journey

- **Purpose:** Represent growth across academic, athletic, career, and personal development.
- **Audience:** Scholar.
- **Primary action:** Review progress over time.
- **Secondary actions:** Inspect milestones, evidence, and growth areas.
- **Hierarchy:** Journey selector, timeline, milestones, progress, growth areas.
- **Components:** Timeline, milestone detail, evidence links, progress summary.
- **Data:** Deterministically ordered evidence-backed journey events.
- **Ownership:** Scholar.
- **Permissions:** Journey and referenced evidence read.
- **Capabilities:** Scholar Journey; future Career Journey engine.

## Goals

- **Purpose:** Govern Scholar-created academic, athletic, career, and personal goals.
- **Audience:** Scholar.
- **Primary action:** Create or update a goal through governed confirmation.
- **Secondary actions:** Track progress, add milestone, complete goal.
- **Hierarchy:** Active goals, progress, milestones, completed goals.
- **Components:** Goal list, goal editor, progress history, milestone confirmation.
- **Data:** Scholar-owned goals and evidence-backed progress.
- **Ownership:** Scholar.
- **Permissions:** Goal read/write.
- **Capabilities:** Scholar Record goal management; future Compass assistance.

## Opportunities

- **Purpose:** Surface opportunities the Scholar is authorized to discover and evaluate.
- **Audience:** Scholar.
- **Primary action:** Review requirements and choose a human action.
- **Secondary actions:** Save, dismiss, request guidance.
- **Hierarchy:** Eligibility context, opportunity summary, requirements, evidence, actions.
- **Components:** Opportunity list, filters, requirement detail, saved state.
- **Data:** Governed opportunity sources and explainable eligibility context.
- **Ownership:** Source organization owns opportunity; Scholar owns saved and action state.
- **Permissions:** Opportunity read/save/action as separately authorized.
- **Capabilities:** Opportunity discovery; future Opportunity Intelligence.

## Connections

- **Purpose:** Govern relationships with mentors, coaches, advisors, and institutions.
- **Audience:** Scholar.
- **Primary action:** Request a connection with explicit permission.
- **Secondary actions:** Review relationship scope, consent, and status.
- **Hierarchy:** Existing relationships, requests, available support, permission scope.
- **Components:** Connection list, request flow, consent detail, status history.
- **Data:** Permissioned relationship records.
- **Ownership:** Each party owns identity; relationship state is jointly governed.
- **Permissions:** Connection read/request and explicit consent.
- **Capabilities:** Connection governance; future Mentorship Intelligence.

## Growth

- **Purpose:** Organize evidence-backed skills, achievements, and development areas.
- **Audience:** Scholar.
- **Primary action:** Review growth evidence.
- **Secondary actions:** Confirm a development area, attach evidence, inspect history.
- **Hierarchy:** Skills, achievements, development areas, evidence, history.
- **Components:** Skill summary, achievement list, development areas, evidence detail.
- **Data:** Scholar-owned or institution-verified facts with provenance.
- **Ownership:** Scholar; institutional assertions retain source ownership.
- **Permissions:** Growth and evidence read; governed confirmation for changes.
- **Capabilities:** Scholar Record growth; future Resume and Career Intelligence.

