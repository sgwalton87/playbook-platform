# Database Blueprint

Version: 2.0

Status: Canonical

Owner: Platform Architecture

Related Documents

- FOUNDATION.md
- DATA_MODEL.md
- PLAYBOOK_STACK.md
- ENGINE_CONTRACT.md
- EVENT_CONTRACT.md
- COMPUTATION_MODEL.md
- STATE_MODEL.md
- SECURITY_MODEL.md

---

# Purpose

The Database Blueprint defines the canonical persistence architecture for the Playbook platform.

It maps canonical entities and Domain Engines to persistent storage while preserving the platform's architectural principles.

Persistence exists to support the business model.

The database never defines the business model.

---

# Philosophy

Architecture drives persistence.

Persistence never drives architecture.

The database stores facts.

Domain Engines compute truth.

Compass consumes truth.

---

# Design Principles

Participant First

Append-Only History

Immutable Evidence

Normalized Core Data

Computed Permissions

Deterministic State

Audit Everywhere

Replaceable Infrastructure

Engine Ownership

Schema Isolation

---

# Persistence Architecture

```
Application

↓

Operating Systems

↓

Compass

↓

Planning Engine

↓

Opportunity Engine

↓

Participant Record Engine

↓

Evidence Engine

↓

Domain Engines

↓

Canonical Database

↓

PostgreSQL
```

The database is an implementation of canonical architecture.

---

# Schema Strategy

Schemas represent bounded contexts.

Each Domain Engine owns one or more schemas.

Schemas communicate through canonical identifiers and Events.

---

# Canonical Schemas

identity

participant

organization

relationship

learning

community

athletics

entrepreneurship

financial

career

wellness

opportunity

planning

platform

analytics

audit

search

notification

integration

---

# Schema Ownership

| Schema | Primary Engine |
|----------|----------------|
| identity | Identity Engine |
| participant | Participant Record Engine |
| relationship | Relationship Engine |
| organization | Organization Engine |
| learning | Learning Engine |
| athletics | Athletics Engine |
| entrepreneurship | Entrepreneurship Engine |
| community | Community Engine |
| financial | Financial Capability Engine |
| opportunity | Opportunity Engine |
| planning | Planning Engine |
| analytics | Analytics Engine |
| audit | Audit Engine |
| platform | Platform Engine |

Every table has exactly one owning Engine.

---

# Aggregate Mapping

## Identity

Aggregate Root

Identity

Tables

identities

authentication_methods

credentials

verification_status

sessions

---

## Participant

Aggregate Root

Participant

Tables

participants

participant_profiles

participant_preferences

participant_contexts

participant_settings

participant_record_summary

---

## Relationships

Aggregate Root

Relationship

Tables

relationships

relationship_types

relationship_members

relationship_history

relationship_trust

---

## Organizations

Aggregate Root

Organization

Tables

organizations

organization_types

organization_memberships

organization_units

organization_policies

organization_settings

---

## Learning

Aggregate Root

Learning Path

Tables

learning_paths

programs

courses

modules

lessons

assignments

assessments

enrollments

---

## Evidence

Aggregate Root

Evidence

Tables

evidence

evidence_versions

evidence_sources

evidence_artifacts

evidence_verifications

evidence_confidence

evidence_links

---

## Participant Record

Aggregate Root

Participant Record

Tables

participant_records

record_entries

transcripts

certificates

badges

achievement_history

---

## Opportunity

Aggregate Root

Opportunity

Tables

opportunities

eligibility_rules

opportunity_matches

applications

application_reviews

awards

deadlines

---

## Planning

Aggregate Root

Plan

Tables

plans

plan_items

plan_progress

goals

goal_progress

milestones

tasks

---

## Community

Aggregate Root

Community

Tables

communities

community_members

posts

comments

reactions

messages

events

announcements

---

## Athletics

Aggregate Root

Athlete Profile

Tables

athlete_profiles

sports

teams

rosters

competitions

performances

statistics

highlights

eligibility_records

---

## Entrepreneurship

Aggregate Root

Venture

Tables

ventures

venture_members

business_artifacts

pitches

milestones

investments

accelerators

---

## Financial

Aggregate Root

Financial Profile

Tables

financial_profiles

budgets

accounts

financial_goals

scholarships

aid_packages

---

## Audit

Tables

audit_log

policy_decisions

permission_decisions

state_history

event_history

---

## Analytics

Tables

analytics_events

participant_metrics

organization_metrics

system_metrics

---

# Cross-Schema Rules

Schemas communicate only through:

Canonical IDs

Read models

Events

Published APIs

Schemas never directly own another schema's data.

---

# Canonical Identifiers

Every Aggregate Root uses a globally unique identifier.

Examples:

participant_id

identity_id

organization_id

relationship_id

evidence_id

plan_id

opportunity_id

venture_id

IDs never change.

---

# Foreign Keys

Foreign keys should reference Aggregate Roots.

Avoid deep coupling.

Prefer:

participant_id

Instead of:

participant_profile_id

---

# Read Models

Read models support optimized queries.

Examples:

participant_dashboard

organization_dashboard

opportunity_feed

scholar_profile

founder_profile

coach_dashboard

Read models are projections.

They are never sources of truth.

---

# Materialized Views

Materialized views may support:

Leaderboards

Analytics

Recommendations

Dashboards

Reporting

Views are disposable.

Canonical tables remain authoritative.

---

# Search

Dedicated search indexes should support:

Participants

Organizations

Communities

Courses

Ventures

Scholarships

Jobs

Mentors

Events

Search indexes are projections.

---

# Caching

Caches may exist for:

Dashboards

Leaderboards

Opportunity feeds

Community feeds

Analytics

Caches never become canonical.

---

# Row-Level Security

Every canonical table supports RLS.

Policies derive from:

Identity

Relationships

Organizations

Context

Permissions

Consent

No table bypasses platform authorization.

---

# Audit Strategy

Every mutable operation records:

Timestamp

Actor

Engine

Previous State

New State

Correlation ID

Policy

Permission

Reason

Audit history is immutable.

---

# Event Storage

Canonical Events should be persisted.

Recommended tables:

events

event_subscribers

event_failures

event_replay

events remain immutable.

---

# Versioning

Canonical entities support versioning where required.

Examples:

Evidence

Policies

Plans

Relationships

Organization Policies

Versions never overwrite history.

---

# Soft Delete

Canonical entities are never physically deleted.

Preferred lifecycle:

Active

↓

Historical

↓

Archived

Deletion is reserved for legal compliance requirements.

---

# Performance Strategy

Indexes should exist for:

Primary Keys

Foreign Keys

Lookup Fields

Search Fields

Event Processing

Analytics

Permission Evaluation

Performance optimization must not violate canonical architecture.

---

# Backup Strategy

Daily backups

Point-in-time recovery

Immutable audit history

Event retention

Disaster recovery

Database replication

---

# Multi-Tenancy

Organizations define tenancy boundaries.

Participants remain global.

Evidence remains participant-owned.

Cross-organization participation is supported through Policies.

---

# Infrastructure Independence

The canonical model must remain independent of implementation.

Current implementation:

PostgreSQL

Supabase

Future implementations could include:

CockroachDB

Aurora PostgreSQL

Cloud SQL

Self-hosted PostgreSQL

Changing infrastructure must not change architecture.

---

# Future Expansion

Additional schemas may include:

Healthcare

Military

Housing

Transportation

Research

International

Media

Government Services

New schemas must conform to the Engine Contract.

---

# Definition of Done

A database blueprint is complete when:

✓ Every schema has an owner.

✓ Every Aggregate Root is mapped.

✓ Tables are grouped by bounded context.

✓ Cross-schema rules are documented.

✓ Read models are defined.

✓ Search strategy exists.

✓ RLS strategy exists.

✓ Audit strategy exists.

✓ Event persistence exists.

✓ Versioning is documented.

✓ Infrastructure remains replaceable.

Only then may implementation begin.

---

# Closing Principle

The database is a servant of the architecture.

It stores facts.

It preserves history.

It enables deterministic computation.

It never becomes the source of business truth.

Business truth belongs to Domain Engines.