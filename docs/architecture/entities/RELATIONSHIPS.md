# Relationship Entities

Version: 1.0

Status: Canonical

Owner: Relationship Engine

Related Documents

- ../DATA_MODEL.md
- ../../DATABASE_BLUEPRINT.md
- FOUNDATION.md

---

# Purpose

The Relationship domain defines how Participants establish trust, authority, collaboration, mentorship, governance, and communication throughout the Playbook ecosystem.

Relationships are first-class canonical entities.

Relationships determine trust.

Roles determine capability.

Policies determine authorization.

Permissions are computed from all four.

---

# Canonical Entity Index

| Entity | Aggregate Root | Owner Engine |
|----------|----------------|--------------|
| Relationship | Participant | Relationship Engine |
| Relationship Type | Platform | Relationship Engine |
| Invitation | Relationship | Relationship Engine |
| Membership | Organization | Organization Engine |
| Guardian Relationship | Participant | Relationship Engine |
| Mentorship | Participant | Mentorship Engine |
| Connection | Participant | Community Engine |

---

# Relationship

## Purpose

Represents a verified association between two or more Participants.

Relationships establish trust boundaries throughout the platform.

Every authorization decision may reference one or more Relationships.

Relationships never define capabilities.

Relationships define scope.

---

## Aggregate Root

Participant

---

## Owner Engine

Relationship Engine

---

## Physical Implementation

Primary Schema

relationship

Primary Table

relationships

---

## Canonical Relationships

Participant A

Participant B

Relationship Type

Status

Verification

Organizations

Policies

Permissions

---

## Lifecycle

```text
Proposed
    ↓
Invited
    ↓
Pending
    ↓
Verified
    ↓
Active
    ↓
Suspended
    ↓
Ended
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

Examples

Relationship Proposed

Relationship Accepted

Relationship Verified

Relationship Suspended

Relationship Ended

---

## RLS Strategy

Visible only through applicable Policies.

---

## AI Access

AI may reference Relationships only through evaluated Permissions.

---

## Notes

Relationships are immutable history.

Status changes do not erase historical associations.

RELATIONSHIP TYPES
Parent

Guardian

Scholar

Scholar-Athlete

Sibling

Coach

Assistant Coach

Teacher

Professor

Counselor

Mentor

Advisor

Recruiter

Employer

Employee

Founder

Co-Founder

Investor

Board Member

Organization Admin

Volunteer

Case Manager

Social Worker

Probation Officer

Attorney

Financial Advisor

Peer

Alumni

Community Member

INVITATION
Draft

↓

Sent

↓

Viewed

↓

Accepted

↓

Rejected

↓

Expired

RELATIONSHIP STRENGTH
Verified

Trusted

Temporary

Pending

Institutional

Legal

Emergency

Inactive

RELATIONSHIP CARDINALITY

Participant

↓

0..N Relationships

↓

Each Relationship

↓

Exactly One Relationship Type

↓

0..N Organizations

↓

0..N Policies

↓

0..N Permissions