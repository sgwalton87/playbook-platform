---
id: PGSL-001-ENTITY
parent: PGSL-001
title: Global App Shell Entity Architecture Map
version: 1.0.0
status: Draft
classification: Master Blueprint
owners:
  - PBOS
layer: Domain Architecture
last_updated: 2026-07-28
---

# Global App Shell Entity Architecture Map

## Purpose

The Entity Architecture Map defines the canonical business entities referenced by the Global App Shell.

The App Shell references entities but does not own their business logic.

Entity ownership remains within the appropriate Playbook domain.

---

# Mission

Provide a deterministic domain model that enables the App Shell to render authenticated user experiences while maintaining clear ownership boundaries between platform services.

The App Shell shall remain presentation-oriented and domain-aware without becoming domain-responsible.

---

# Entity Architecture Principles

The App Shell shall:

- reference canonical entities
- avoid duplicating business logic
- consume governed domain models
- preserve entity ownership
- support future domain expansion

Entities shall have a single authoritative owner.

---

# Core Platform Entities

## PB-ENTITY-001 — User

Represents an authenticated individual using the Playbook Platform.

Responsibilities

- Identity
- Authentication context
- User preferences
- Account status

Owned By

Identity Domain

Referenced By

- Global Header
- Avatar Menu
- Session Manager
- Notifications

---

## PB-ENTITY-002 — Profile

Represents the user's public and platform profile.

Examples

- Name
- Photo
- Biography
- Academic information
- Athletics information
- Interests
- Goals

Owned By

Profile Domain

Referenced By

- Profile
- Dashboard
- Recommendations

---

## PB-ENTITY-003 — Session

Represents the authenticated application session.

Responsibilities

- Authentication state
- Expiration
- Refresh
- Device context

Owned By

Identity Domain

Referenced By

Entire App Shell

---

## PB-ENTITY-004 — Role

Represents platform authorization.

Examples

- Scholar
- Scholar Athlete
- Parent
- Mentor
- Coach
- Educator
- Counselor
- Organization
- Employer
- Administrator

Owned By

Authorization Domain

Referenced By

Navigation

Permissions

Workspace Selection

---

## PB-ENTITY-005 — Workspace

Represents the user's active operating environment.

Examples

Scholar OS

Mentor OS

Parent OS

Admin OS

Organization OS

Owned By

Experience Domain

Referenced By

Navigation

Header

Breadcrumbs

---

## PB-ENTITY-006 — Notification

Represents actionable platform communication.

Examples

Messages

Alerts

Reminders

System Notices

Opportunity Updates

Owned By

Notification Domain

Referenced By

Notification Center

Global Header

---

## PB-ENTITY-007 — Organization

Represents institutions interacting with users.

Examples

Schools

Universities

Employers

Nonprofits

Sponsors

Community Organizations

Owned By

Organization Domain

Referenced Throughout

Platform

---

## PB-ENTITY-008 — Opportunity

Represents opportunities available to users.

Examples

Scholarships

Internships

Jobs

Mentorships

Programs

Competitions

Owned By

Opportunity Intelligence Domain

Referenced By

Dashboard

Search

Recommendations

Notifications

---

## PB-ENTITY-009 — Course

Represents educational experiences.

Examples

Courses

Modules

Lessons

Assignments

Certificates

Owned By

Learning Domain

Referenced By

Learning Experience

Transcript

Certificates

---

## PB-ENTITY-010 — Event

Represents scheduled experiences.

Examples

Meetings

Mentorship Sessions

Deadlines

Campus Visits

Career Events

Owned By

Calendar Domain

Referenced By

Calendar

Dashboard

Notifications

---

# Supporting Entities

Additional entities may include:

- Badge
- Achievement
- Transcript
- Document
- Resume
- Recommendation
- Application
- Message
- Conversation
- AI Recommendation
- Task
- Goal
- Progress Record

These entities remain governed by their respective platform domains.

---

# Entity Relationships

User

↓

Profile

↓

Role

↓

Workspace

↓

Experiences

↓

Domain Entities

↓

Notifications

↓

Actions

The App Shell visualizes these relationships but does not own them.

---

# Ownership Boundaries

The App Shell shall:

Reference entities.

Render entities.

Navigate entities.

Never implement business rules belonging to entity owners.

---

# Entity Lifecycle

The App Shell observes entity lifecycle events including:

- Creation
- Update
- Archive
- Deletion
- Authorization Change
- Visibility Change

Rendering shall remain synchronized with canonical domain state.

---

# Privacy

Entities containing protected information shall respect:

- authorization
- privacy preferences
- organizational boundaries
- least privilege

Sensitive information shall only be rendered when explicitly authorized.

---

# PBOS Validation

The PBOS Engine validates:

- canonical entity references
- ownership boundaries
- authorization inheritance
- privacy compliance
- relationship consistency
- domain integrity

---

# Success Criteria

The Global App Shell shall reference a governed, deterministic domain model while preserving clear ownership boundaries between presentation architecture and business domains.

Entity relationships shall remain consistent across every Playbook operating system.

