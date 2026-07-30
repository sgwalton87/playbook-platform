# PBOS Scholar OS Application Architecture

**Purpose:** Define the complete implementation-ready composition of Scholar OS without implementing application UI or activating production capabilities.  
**Owner:** Playbook OS Engineering  
**Last Updated:** July 30, 2026  
**Related:** [Scholar OS Architecture](./PBOS_SCHOLAR_OS_ARCHITECTURE.md), [Screen Specifications](./PBOS_SCHOLAR_OS_SCREEN_SPECIFICATIONS.md)

## Application Authority

Scholar OS composes experiences from governed capability decisions. It does not create facts, permissions, entitlements, capability availability, engine admission, or execution authority.

## Core Composition

| Module | Purpose | User Value | Capability | Data Source | Permission |
|---|---|---|---|---|---|
| Home | Orient the Scholar | Understand current state and next action | Scholar Record read | Scholar Record references | `scholar.home.read` |
| Profile | Present governed identity and story | Understand and maintain owned information | Scholar Record read/write | Scholar Record | `scholar.profile.read` |
| Journey | Show growth over time | Recognize progress and continuity | Journey read | Evidence-backed milestones | `scholar.journey.read` |
| Goals | Govern intended outcomes | Create and track human-owned goals | Goal read/write | Scholar Record goals | `scholar.goals.read` |
| Opportunities | Surface eligible options | Discover and act on opportunities | Opportunity discovery | Governed opportunity sources | `scholar.opportunities.read` |
| Connections | Govern support relationships | Request appropriate help | Connection read/request | Permissioned relationships | `scholar.connections.read` |
| Growth | Organize development evidence | Understand skills and development areas | Growth read | Scholar Record evidence | `scholar.growth.read` |
| Notifications | Present governed changes | Notice relevant, authorized events | Notification read | Governed events | `scholar.notifications.read` |
| Settings | Manage preferences and consent | Control privacy and experience behavior | Preference and consent management | Scholar-owned preferences | `scholar.settings.read` |

Every module defines all loading, empty, first-time, success, error, locked, permission-required, and unavailable states.

## Navigation

Primary navigation order:

```text
Home -> Profile -> Journey -> Goals -> Opportunities
     -> Connections -> Growth -> Notifications -> Settings
```

Navigation is filtered by role, permission, and `AVAILABLE` capability decisions. Hidden navigation never substitutes for authorization; route and data boundaries must independently enforce the same decision.

## Capability Mapping

Each module binds capability, optional engine dependency, permission, availability state, and Kernel decision reference. `AVAILABLE` without Kernel evidence is invalid.

The application may reduce availability:

```text
AVAILABLE -> REQUIRES_PERMISSION | LOCKED | UNAVAILABLE
PENDING -> LOADING
```

It cannot promote locked, pending, permission-required, or unavailable capability state.

## Data Ownership

Scholar Record data remains Scholar-owned. Organization and platform sources retain their own ownership but may be displayed only through authorized, provenance-preserving references. Display state never becomes canonical data.

## Future Engines

Compass, Opportunity, Resume, Mentorship, and Career Journey engines connect through capability decisions and evidence-linked recommendations. Their absence must produce honest locked, pending, or unavailable states.

## Multi-Role Boundary

Future parent, mentor, coach, counselor, and institution applications may reuse module contracts. They require separate navigation, permission, consent, and visibility mappings and cannot inherit Scholar authority.

