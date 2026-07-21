# Database Blueprint

Version: 1.0

Status: Canonical

Owner: Platform Architecture

Related Documents

- PLAYBOOK_CONSTITUTION.md
- PLAYBOOK_OS.md
- architecture/DATA_MODEL.md
- PRODUCT/ENGINE_REGISTRY.md
- PRODUCT/FEATURE_REGISTRY.md

---

# Purpose

This document defines the physical implementation of the canonical Playbook architecture within PostgreSQL and Supabase.

Where the DATA_MODEL defines *what* the platform is, the Database Blueprint defines *how* those concepts are persisted.

Every migration, schema change, table, view, index, trigger, function, storage bucket, and Row Level Security policy must align with this blueprint.

The blueprint exists to ensure that implementation remains consistent with the canonical architecture over the lifetime of the platform.

---

# Design Principles

The Playbook database shall prioritize:

- canonical ownership
- normalization where appropriate
- append-only historical records
- deterministic authorization
- auditability
- scalability
- tenant safety
- privacy by design
- AI readiness
- long-term maintainability

The database is designed to support lifelong participant records rather than institution-specific accounts.

---

# Canonical Database Philosophy

The database models Participants rather than Users.

Participants accumulate:

- identities
- organizations
- relationships
- roles
- evidence
- achievements
- opportunities
- experiences

throughout their lifetime.

Institutional data should be attached to Participants rather than replacing or fragmenting participant history.

The Participant remains the primary aggregate root of the platform.

---

# Architectural Layers

The physical database is organized into logical layers.

```text
Identity Layer

↓

Relationship Layer

↓

Organization Layer

↓

Governance Layer

↓

Experience Layer

↓

Evidence Layer

↓

Intelligence Layer

↓

Infrastructure Layer
```

Each layer owns a distinct responsibility and minimizes cross-layer coupling.

---

# Aggregate Roots

The following entities are considered aggregate roots.

- Participant
- Organization
- Program
- Opportunity
- Course
- Event
- Conversation
- Certificate
- Participant Record

All other entities should reference one of these roots.

Aggregate roots own lifecycle state and transactional consistency.

---

# PostgreSQL Strategy

Playbook uses PostgreSQL as the canonical system of record.

Supabase provides:

- authentication
- PostgreSQL
- Row Level Security
- storage
- realtime
- edge functions
- scheduled jobs

Business logic should remain independent of Supabase-specific implementation whenever practical.

---

# Schema Organization

The database should be organized into bounded schemas rather than a single large public schema.

Example:

```text
identity

participant

organization

relationship

learning

community

opportunity

athletics

financial

gamification

analytics

audit

storage

platform
```

Each schema owns a cohesive domain.

Cross-schema dependencies should be minimized.

---

# Canonical Entity Mapping