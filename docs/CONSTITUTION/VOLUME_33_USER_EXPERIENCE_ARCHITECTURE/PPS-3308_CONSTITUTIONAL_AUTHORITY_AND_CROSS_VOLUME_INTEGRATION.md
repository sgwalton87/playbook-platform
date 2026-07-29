---
id: PPS-3308
title: Constitutional Authority and Cross-Volume Integration
version: 1.0.0
status: Canonical
classification: Constitutional
owners:
  - Playbook Platform
layer: User Experience Governance
parent: PPS-3300
depends_on:
  - PPS-003
  - PPS-008
  - PPS-009
  - PPS-010
  - PPS-012
  - PPS-013
  - PPS-014
  - PPS-1300
  - PPS-3000
  - PPS-3100
  - PPS-3200
  - PPS-3297
  - PPS-3300
required_by:
  []
consumes:
  - PPS-003
  - PPS-008
  - PPS-009
  - PPS-010
  - PPS-012
  - PPS-013
  - PPS-014
  - PPS-1300
  - PPS-3100
  - PPS-3200
  - PPS-3300
provides:
  - PPS-3308
integrates_with:
  - PPS-3100
  - PPS-3200
  - PPS-3300
supports:
  []
references:
  - PPS-003
  - PPS-008
  - PPS-009
  - PPS-010
  - PPS-012
  - PPS-013
  - PPS-014
  - PPS-1300
  - PPS-3100
  - PPS-3200
  - PPS-3300
  - PPS-3100
  - PPS-3200
related:
  - PPS-3100
  - PPS-3200
planned_relationships:
  - id: VOLUME-34
    status: unresolved
  - id: VOLUME-35
    status: repository-present-without-volume-index
  - id: VOLUME-36
    status: unresolved
  - id: VOLUME-37
    status: unresolved
  - id: VOLUME-38
    status: unresolved
  - id: VOLUME-39
    status: unresolved
children:
  []
constitutional_authority:
  - PPS-003
  - PPS-3300
last_updated: 2026-07-28
machine_version: 1
release_blocking: true
validation_required: true
---

# Purpose

Define exclusive authority boundaries, inheritance direction, cross-volume contracts, and conflict resolution.

# Constitutional Authority Matrix

| Domain | Governing Volume | Excluded Authority | Inheritance Direction | Conflict Resolution |
| --- | --- | --- | --- | --- |
| Product scope and registries | Volume 30 | UX behavior, role authority | V30 → V33 consumers | Volume 30 governs product identity |
| Role responsibilities and permissions | Volume 31 | Shared application and UX law | V31 + V33 → role experiences | Volume 31 governs role authority; V33 governs interaction |
| Platform Applications | Volume 32 | Role authority, IA, visual design | V32 + V33 → application experiences | Volume 32 governs application responsibility |
| Human experience | Volume 33 | IA, tokens, screen/component/API/data specs | V33 → Volumes 34-39 | PPS-3300 governs interaction outcome |
| Information Architecture | Volume 34 | UX philosophy and visual design | V33 → V34 | V34 organizes; V33 governs comprehensibility |
| Design System | Volume 35 | Product, workflow, role, API, data | V33 → V35 | V35 realizes; V33 governs human outcome |
| Screen Specifications | Volume 36 | Application ownership and UX constitution | V32 + V33-35 → V36 | Upstream volume by domain |
| Component Specifications | Volume 37 | Screen purpose and application workflow | V33 + V35-36 → V37 | V37 implements inherited behavior |
| API Specifications | Volume 38 | Human interaction and data ownership | V32-33 + security/data → V38 | API cannot weaken UX state truth |
| Database Specifications | Volume 39 | UX behavior and application ownership | Data governance + V32-33 → V39 | Canonical data authority governs storage |

# Cross-Volume Relationship Contract

| Volume | Volume 33 Consumes | Volume 33 Produces | Depends On | Inherited By | Governed By | Referenced By |
| --- | --- | --- | --- | --- | --- | --- |
| 30 | Product identities and registries | UX obligations for products | PPS-3000 | Product implementation | Product governance | 34-39 |
| 31 | Roles, responsibilities, permissions | Role-aware interaction laws | PPS-3100 | Role experiences | Role OS governance | 36, 38 |
| 32 | Applications and handoffs | Application UX invariants | PPS-3200 | Application experiences | Application governance | 34-39 |
| 34 | Future IA identities | Comprehension and continuity rules | Canonical creation pending | Navigation structures | Volume 34 | 35-37 |
| 35 | Design/accessibility realization | Human outcome requirements | Existing PDS corpus | Screens/components | Volume 35 | 36-37 |
| 36 | Screen evidence | State and workflow obligations | Canonical creation pending | Screen specs | Volume 36 | PBOS |
| 37 | Component evidence | Interaction and feedback obligations | Canonical creation pending | Components | Volume 37 | PBOS |
| 38 | API state/error contracts | Truth and recovery requirements | Canonical creation pending | APIs | Volume 38 | PBOS |
| 39 | Data lifecycle/state | Comprehension, correction, continuity | Canonical creation pending | Database specs | Volume 39 | PBOS |

# Conflict Rules

The most specific document governs only within its assigned authority. A downstream document cannot override an upstream invariant. Cross-domain conflicts require joint review and PPS-015 amendment; implementation cannot choose an authority opportunistically.

# Existing Authority Reconciliation

PPS-003 remains the foundational experience principle source. PPS-400-409 remain experience-domain evidence. PPS-1300-1310 become inherited domain standards subordinate to Volume 33's exclusive constitutional UX authority. Volume 32 navigation standards govern application handoff contracts; Volume 33 governs human continuity and comprehension; Volume 35 governs design realization.

# Canonical Navigation Authority

The canonical constitutional authority chain for navigation is:

PPS-003 foundational experience principles → PPS-3300 human experience invariants → PPS-3308 authority boundaries and PPS-3305 continuity requirements → PPS-3297 cross-application navigation contracts → future Volume 34 information architecture.

Until Volume 34 is canonical, `lib/navigation/index.ts`, through `lib/navigation/roleNavigation.ts`, is the repository runtime source of truth for role-aware primary shell destinations. Playbook Platform Experience Architecture owns this registry. `components/shell/UnifiedAppShell.tsx` composes and renders the registry but does not own navigation policy.

`lib/core-journey/navigation.ts` is a legacy navigation implementation. Its founder links remain observed repository behavior, but it has no independent authority to define primary navigation. Shell and layout components outside `components/shell/UnifiedAppShell.tsx` are consumers, presentation variants, or migration artifacts; their existence does not confer policy ownership.

Navigation definitions inherit upstream authority and may narrow presentation by role, permission, application, channel, or viewport. They shall not rename, remove, or redirect a governed destination in a way that breaks workflow continuity. Application-local navigation inherits PPS-3297 and the canonical role registry. Future Volume 34 may supersede the repository source only through an explicit migration that preserves PPS-003 and Volume 33 invariants.

The governed migration from duplicate navigation systems is:

1. Inventory every destination and consumer in the canonical and legacy registries.
2. Reconcile founder-only destinations into the canonical role registry without changing authorization.
3. Update shell consumers to read only the canonical registry.
4. Validate route existence, role visibility, deep links, mobile parity, and continuity.
5. Deprecate and then remove legacy navigation exports after consumer equality is proven.
6. Record the replacement identity and evidence in PBOS certification.

Until those steps complete, duplicate runtime implementations are implementation debt and produce a repository-consistency failure. They do not create a second constitutional authority.

# Volume 30 Registry Reconciliation

The canonical Volume 30 location is `docs/PPS/30_PRODUCT_ARCHITECTURE/`. The repository contains every expected registry filename, but every file is zero bytes. Filenames establish discoverable identifiers only; they are not readable constitutional content and cannot satisfy a substantive dependency.

| Identifier | Canonical File | Repository State |
| --- | --- | --- |
| PPS-3000 | `PPS-3000_PRODUCT_ARCHITECTURE_OVERVIEW.md` | Zero-byte placeholder |
| PPS-3001 | `PPS-3001_FEATURE_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3002 | `PPS-3002_EXPERIENCE_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3003 | `PPS-3003_PAGE_AND_SCREEN_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3004 | `PPS-3004_WORKFLOW_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3005 | `PPS-3005_DASHBOARD_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3006 | `PPS-3006_NAVIGATION_ARCHITECTURE_STANDARD.md` | Zero-byte placeholder |
| PPS-3007 | `PPS-3007_COMPONENT_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3008 | `PPS-3008_API_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3009 | `PPS-3009_DATABASE_OBJECT_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3010 | `PPS-3010_EVENT_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3011 | `PPS-3011_NOTIFICATION_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3012 | `PPS-3012_AI_CAPABILITY_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3013 | `PPS-3013_INTEGRATION_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3014 | `PPS-3014_RELEASE_AND_BUILD_REGISTRY_STANDARD.md` | Zero-byte placeholder |
| PPS-3015 | `PPS-3015_PRODUCT_GOVERNANCE_ARCHITECTURE.md` | Zero-byte placeholder |
| Volume index | `VOLUME_30_INDEX.md` | Zero-byte placeholder |

Volume 33 references the Volume 30 product overview and the feature, experience, screen, workflow, dashboard, navigation, component, event, notification, intelligence, release, and governance registry domains. API, database-object, and integration registries are also required by downstream screen, application, and workflow traceability. PBOS shall report all of these as incomplete upstream dependencies and shall not infer their contents.

# Volume 31 Parent-Child Relationship

PPS-3100 is the canonical parent contract for every Role Operating System. Volume 33 may use PPS-3100 to define universal role-aware experience invariants. Concrete role journeys, navigation, permissions, and handoffs additionally depend on the applicable future child Role Operating System specification.

A future child specification shall declare PPS-3100 as its parent, inherit its lifecycle and validation rules, and provide the role-specific responsibilities, permissions, application composition, workflows, data visibility, cross-role relationships, accessibility obligations, and evidence required by PPS-3100. A child may narrow the parent contract but cannot weaken it or Volume 33.

The current absence of child role specifications means role-specific certification is dependency-incomplete. It is not evidence that PPS-3100 or Volume 33 is architecturally invalid, and PBOS shall not invent child identifiers or role contracts to close the dependency.

# PBOS Drift Detection

PBOS shall identify duplicate claims of exclusive authority, reversed dependencies, downstream weakening, unregistered identifiers, missing cross-references, and implementation artifacts that claim authority belonging to another volume.
