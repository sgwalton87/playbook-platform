# Playbook Human Development Operating System (HDOS)
# Platform Cartography
Version: 1.0

Status: Living Document

Owner: Platform Architecture

Last Updated: July 2026

---

# Purpose

Platform Cartography is the canonical migration blueprint for the Playbook Human Development Operating System (HDOS).

Unlike the Architecture documents, which define **what the system should be**, this document defines **where every existing piece of the current platform belongs**.

Every route.

Every component.

Every library.

Every service.

Every database table.

Every worker.

Every API.

Every feature.

Every future feature.

must have exactly **one canonical owner**.

The purpose of Platform Cartography is to eliminate ambiguity, prevent duplicate implementations, and guide the platform through continuous evolution without requiring rewrites.

---

# Philosophy

Playbook is no longer an application.

It is no longer simply a learning management system.

It is no longer a social network.

It is no longer a scholarship platform.

It is no longer a recruiting platform.

Playbook is a Human Development Operating System.

Every feature exists to support one of the canonical engines or domains.

Nothing exists independently.

---

# Guiding Principles

## Single Ownership

Every artifact has exactly one owner.

Never multiple.

Never shared.

---

## Domain Driven

Technology does not own functionality.

Domains own functionality.

---

## Event Driven

Features communicate through events.

Never direct dependencies whenever avoidable.

---

## Engine Driven

Business logic belongs inside engines.

User interfaces consume engine outputs.

---

## Projection Driven

User interfaces consume projections.

Never transactional state.

---

## Incremental Evolution

The current repository will evolve into HDOS.

Nothing is rewritten unless necessary.

Everything is migrated intentionally.

---

# Canonical Architecture

```
Experience Layer

    Web
    Mobile
    AI
    APIs
    Notifications

            │

            ▼

Compass

            │

            ▼

Planning Engine

            │

            ▼

Opportunity Engine

            │

            ▼

Participant Record Engine

            │

            ▼

Evidence Engine

            │

            ▼

Knowledge Graph

            │

            ▼

Platform Kernel

            │

            ▼

Infrastructure
```

---

# Engine Ownership

| Engine | Responsibility |
|---------|----------------|
| Kernel | Shared contracts, events, identities, permissions |
| Evidence | Canonical facts |
| Participant Record | Living participant profile |
| Opportunity | Opportunity discovery and ranking |
| Planning | Goals, milestones, plans, execution |
| Compass | Participant experience orchestration |

---

# Domain Ownership

| Domain | Responsibility |
|----------|---------------|
| Learning | Courses, education, academics |
| Athletics | Recruiting, athletics, performance |
| Entrepreneurship | Founder development |
| Community | Social graph, feed, messaging |
| Financial Capability | Financial literacy and planning |
| Career | Employment pathways |
| Wellness | Future |
| Leadership | Future |

---

# Service Ownership

| Service | Responsibility |
|----------|---------------|
| Identity | Authentication and authorization |
| Organizations | Schools, nonprofits, employers |
| Relationships | Mentor graph |
| Notifications | Delivery |
| AI | Language intelligence |
| Search | Discovery |
| Storage | Files |
| Analytics | Metrics |

---

# Repository Mapping

---

## app/

Purpose

User experience routes.

No business logic.

| Route | Canonical Owner | Status |
|--------|----------------|--------|
| dashboard | Compass | 🔄 |
| profile | Participant Record | 🔄 |
| transcript | Participant Record | 🔄 |
| onboarding | Evidence + Planning | 🔄 |
| opportunities | Opportunity | 🔄 |
| courses | Learning | 🔄 |
| feed | Community | 🔄 |
| connections | Relationships | 🔄 |
| mentorship | Relationships | 🔄 |
| notifications | Notifications | 🔄 |
| events | Community | 🔄 |
| leaderboard | Community | 🔄 |
| badges | Evidence | 🔄 |
| certificates | Evidence | 🔄 |
| store | Commerce (Future) | 🆕 |
| admin | Platform Administration | 🔄 |

---

## components/

Purpose

Presentation.

Never business rules.

| Component Group | Owner |
|----------------|------|
| profile | Participant Record |
| transcript | Participant Record |
| onboarding | Evidence |
| courses | Learning |
| scholar-athlete | Athletics |
| notifications | Notifications |
| network | Relationships |
| dashboard | Compass |
| opportunities | Opportunity |
| economy | Financial Capability |
| ui | Shared |
| shell | Compass |

---

## lib/

Purpose

Business logic.

This directory will gradually evolve into Platform packages.

| Current Library | Future Owner |
|----------------|--------------|
| auth | Identity |
| scholar-record | Participant Record |
| profile | Participant Record |
| opportunities | Opportunity |
| onboarding | Evidence + Planning |
| events | Evidence |
| notifications-v2 | Notifications |
| network | Relationships |
| permissions | Identity |
| portfolio | Financial Capability |
| athletics | Athletics |
| courses | Learning |
| playbook-record | Participant Record |
| intelligence | Compass |
| role-os | Identity |
| support-network | Relationships |

---

## scripts/

Purpose

Automation.

| Script Group | Owner |
|--------------|------|
| backup | Infrastructure |
| ledger | Infrastructure |
| documentation | Documentation |
| founder | Administration |
| doctor | Infrastructure |
| build | Infrastructure |
| tests | Infrastructure |

---

## workers/

Purpose

Background processing.

Owner:

Infrastructure

Eventually contains:

Evidence Workers

Planning Workers

Notification Workers

Opportunity Workers

Projection Workers

AI Workers

---

## infrastructure/

Purpose

Platform runtime.

Owns:

Database

Queues

Storage

Caching

Monitoring

Deployment

Secrets

Networking

---

## tests/

Purpose

System validation.

Structure

Unit

Integration

Contract

Event

End-to-End

Performance

Security

Accessibility

---

# Database Ownership

Every table has one owner.

| Table | Owner |
|--------|------|
| profiles | Participant Record |
| evidence | Evidence |
| evidence_verification | Evidence |
| badges | Evidence |
| certificates | Evidence |
| participant_records | Participant Record |
| competencies | Participant Record |
| opportunities | Opportunity |
| recommendations | Opportunity |
| plans | Planning |
| milestones | Planning |
| actions | Planning |
| notifications | Notifications |
| organizations | Organizations |
| relationships | Relationships |

---

# Event Ownership

Examples

Transcript Uploaded

↓

EvidencePublished

↓

ParticipantRecordUpdated

↓

OpportunityRecomputed

↓

PlanningAdjusted

↓

CompassContextUpdated

↓

DashboardRefreshed

---

Course Completed

↓

EvidencePublished

↓

ParticipantRecordUpdated

↓

BadgeAwarded

↓

OpportunityRecomputed

↓

PlanningAdjusted

↓

CompassUpdated

---

Mentor Connected

↓

RelationshipCreated

↓

ParticipantRecordUpdated

↓

CompassUpdated

---

# Dependency Graph

```
Kernel

↓

Identity

↓

Organizations

↓

Relationships

↓

Evidence

↓

Knowledge Graph

↓

Participant Record

↓

Opportunity

↓

Planning

↓

Compass

↓

Experience Layer
```

Rules

Dependencies only move downward.

Never upward.

Never circular.

---

# Migration Strategy

Migration occurs in layers.

## Phase 1

Map ownership.

No code changes.

---

## Phase 2

Move business logic into canonical owners.

No feature changes.

---

## Phase 3

Replace duplicate implementations.

---

## Phase 4

Introduce event communication.

---

## Phase 5

Retire legacy structures.

---

# Definition of Done

Platform Cartography is complete when:

✓ Every route has an owner.

✓ Every component has an owner.

✓ Every library has an owner.

✓ Every worker has an owner.

✓ Every database table has an owner.

✓ Every API has an owner.

✓ Every event has an owner.

✓ No orphan functionality exists.

✓ No duplicate business logic exists.

✓ Every future feature has an obvious architectural home.

---

# Long-Term Vision

This document is the bridge between today's Playbook repository and the Human Development Operating System.

It allows the platform to grow continuously without rewrites.

Architecture becomes implementation.

Implementation reinforces architecture.

Every feature strengthens the system instead of increasing complexity.

The result is a platform capable of supporting millions of participants while remaining understandable, maintainable, explainable, and extensible for decades.