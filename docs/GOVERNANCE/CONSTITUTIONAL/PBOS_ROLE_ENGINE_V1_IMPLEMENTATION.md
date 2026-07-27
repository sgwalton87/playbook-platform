# PBOS Governed Role Operating System Engine V1

## Purpose

Document PBOS-ENGINE-ROLE-001 and its deterministic, identity-bound, permission-controlled, consent-aware role experience boundary.

## Ownership

Playbook OS Engineering owns this implementation record. People retain identity and consent authority; organizations and designated human approvers retain authority over verification, organization access, elevated permissions, and administration.

## Last Updated

July 26, 2026

## Related Documents

- [Engineering constitution](../../../CODEX.md)
- [Architecture handbook](../../ARCHITECTURE.md)
- [Identity Engine V1](./PBOS_IDENTITY_ENGINE_V1_IMPLEMENTATION.md)
- [Ecosystem Engine V1](./PBOS_ECOSYSTEM_ENGINE_V1_IMPLEMENTATION.md)
- [Compass Engine V1](./PBOS_COMPASS_ENGINE_V1_IMPLEMENTATION.md)

## Architecture Implemented

The `pbos/role` domain defines role assignments, human approvals, explicit permissions, supported experience definitions, role-derived dashboards, workflows, multiple-role profiles, deterministic reports, governance routing, and lifecycle enforcement. Assignments are bound to verified Identity and, where applicable, consented Ecosystem organizations and relationships.

## Supported Roles and Experiences

V1 supports Scholar, Scholar Athlete, Parent/Guardian, Mentor, Coach, Teacher, Counselor, College Representative, Employer, Financial Professional, Community Leader, Founder, and Organization Partner experiences. Each definition independently specifies dashboard components, engines, workflows, permitted actions, and restrictions.

## Permission and Consent Boundary

Permissions are limited to `VIEW`, `CONNECT`, `SHARE`, `MENTOR`, `MANAGE`, `ADMINISTER`, `EXPORT`, and `REVOKE`. Every permission must be allowed by the role definition and included in a matching human approval. Organization access requires organization approval; `MANAGE` requires elevated approval; `ADMINISTER` requires administrative approval. Private access requires active purpose-specific consent and evidence.

## Role Separation and Authority

A person may hold multiple roles, but every role retains its own identifier, consent, approval, permission set, dashboard, and restrictions. Permissions are never merged across roles. Role assignment is explicitly non-permanent and cannot create institutional authority or authorize admissions, employment, recruiting, financial, or other institutional decisions.

## Lifecycle

The lifecycle is `REQUESTED`, `VERIFYING`, `APPROVED`, `ACTIVE`, `SUSPENDED`, `REVOKED`, and `ARCHIVED`. Governed transitions require identified human authority and evidence.
