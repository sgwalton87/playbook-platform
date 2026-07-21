# Foundation Entities

Version: 1.0

Status: Canonical

Owner: Identity Engine

Related Documents

- ../DATA_MODEL.md
- ../../DATABASE_BLUEPRINT.md
- ../../PLAYBOOK_CONSTITUTION.md

---

# Purpose

The Foundation domain defines the canonical entities that establish identity, trust, authorization, and lifecycle management throughout the Playbook ecosystem.

Every other bounded context depends upon these entities.

These entities are globally unique and persist for the lifetime of the platform.

---

# Canonical Entity Index

| Entity | Aggregate Root | Owner Engine |
|---------|----------------|--------------|
| Participant | Participant | Identity Engine |
| Identity | Participant | Identity Engine |
| Participant Record | Participant | Identity Engine |
| Activation | Participant | Activation Engine |
| Verification | Participant | Identity Engine |
| Context | Participant | Context Engine |
| Policy | Platform | Policy Engine |
| Permission | Platform | Permission Engine |
| Consent | Participant | Consent Engine |
| Session | Participant | Identity Engine |

---

# Participant

## Purpose

The canonical person participating within the Playbook ecosystem.

A Participant exists independently of any organization and persists throughout the individual's lifetime.

---

## Aggregate Root

Participant

---

## Owner Engine

Identity Engine

---

## Physical Implementation

Primary Schema

identity

Primary Table

participants

---

## Canonical Relationships

- Identity
- Participant Record
- Relationships
- Organization Memberships
- Roles
- Contexts
- Consents
- Sessions

---

## Lifecycle

```text
Draft
    ↓
Invited
    ↓
Registered
    ↓
Activating
    ↓
Platform Ready
    ↓
Active
    ↓
Dormant
    ↓
Archived
```

---

## Audit

Required

---

## Search

Indexed

---

## Event Source

Yes

Events include:

- Participant Created
- Participant Activated
- Participant Suspended
- Participant Archived

---

## RLS Strategy

Participant scoped.

Administrative access requires Policy evaluation.

---

## AI Access

Authorized through Permission evaluation.

AI agents may never bypass Policy enforcement.

---

## Notes

Participant is the canonical aggregate root of the Playbook platform.

Identity is permanent.

Organizations, Roles, and Contexts evolve over time.