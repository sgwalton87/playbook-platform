# Organization Entities

Version: 1.0

Status: Canonical

Owner: Organization Engine

Related Documents

- ../DATA_MODEL.md
- ../../DATABASE_BLUEPRINT.md
- FOUNDATION.md
- RELATIONSHIPS.md

---

# Purpose

The Organization domain defines every institution, business, nonprofit, educational institution, athletic club, employer, government agency, community organization, and affiliated entity participating within the Playbook ecosystem.

Organizations are first-class canonical entities.

Participants belong to Organizations.

Organizations never own Participants.

Organizations provide context for participation.

---

# Canonical Entity Index

| Entity | Aggregate Root | Owner Engine |
|---------|----------------|--------------|
| Organization | Organization | Organization Engine |
| Organization Type | Platform | Organization Engine |
| Organization Membership | Organization | Organization Engine |
| Organization Role | Organization | Organization Engine |
| Workspace | Organization | Organization Engine |
| Department | Organization | Organization Engine |
| Team | Organization | Organization Engine |
| Cohort | Organization | Program Engine |
| Partnership | Organization | Organization Engine |

---

# Organization

## Purpose

Represents a legal, educational, athletic, governmental, nonprofit, business, or community institution participating within the Playbook ecosystem.

Organizations provide operational context.

Organizations do not own Participant identity.

---

## Aggregate Root

Organization

---

## Owner Engine

Organization Engine

---

## Physical Implementation

Primary Schema

organization

Primary Table

organizations

---

## Canonical Relationships

Organization Type

Memberships

Departments

Teams

Programs

Events

Workspaces

Policies

Partnerships

---

## Lifecycle

```text
Draft
    ↓
Pending Verification
    ↓
Verified
    ↓
Active
    ↓
Suspended
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

Organization Created

Organization Verified

Organization Activated

Organization Suspended

Organization Archived

---

## RLS Strategy

Organization scoped.

Administrative access determined through Policy evaluation.

---

## AI Access

Authorized through evaluated Permissions.

AI may summarize organization-level information but must not expose restricted participant data.

---

## Notes

Organizations are reusable environments.

Participants may simultaneously belong to multiple Organizations.

Organizations never replace Participant identity.

School

School District

Charter Management Organization

College

University

Employer

Business

Startup

Nonprofit

Foundation

Government

Athletic Club

AAU Organization

Professional Team

Youth Team

Faith Organization

Community Organization

Financial Institution

Healthcare Provider

Research Institution

Trade Association

Media Organization

Training Provider

Other

---

Organization
      │
      ├── Departments
      ├── Teams
      ├── Workspaces
      ├── Programs
      ├── Events
      ├── Cohorts
      ├── Memberships
      └── Partnerships