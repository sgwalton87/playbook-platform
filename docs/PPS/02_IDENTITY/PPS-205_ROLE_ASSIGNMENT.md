---
id: PPS-205
title: Role Assignment
version: 1.0.0
status: Canonical
classification: Domain
owner: Playbook Platform
dependencies:
  - PPS-200
  - PPS-201
  - PPS-202
  - PPS-203
  - PPS-204
machine_version: 1
release_blocking: true
validation_required: true
---

Purpose

This specification establishes the canonical role model governing every Playbook identity.

Roles determine platform capabilities, Operating System access, workflows, and permissions.

Objectives

The role framework shall provide:

- Consistent authorization
- Operating System selection
- Workflow routing
- Permission inheritance
- Future extensibility

Canonical Principles

Every identity shall have one Primary Role.

An identity may possess one or more Secondary Roles.

Permissions inherit from assigned roles.

Operating Systems inherit from roles rather than redefining permissions.

Canonical Roles

The platform initially recognizes:

- Scholar
- Scholar Athlete
- Parent
- Mentor
- Coach
- Teacher
- Counselor
- School Administrator
- College Representative
- Employer
- Financial Professional
- Community Partner
- Nonprofit Administrator
- Platform Administrator

Future roles may be added through constitutional amendment.

Primary Role

The Primary Role determines:

- Default dashboard
- Operating System
- Navigation
- Initial workflows
- Default permissions

Secondary Roles

Secondary roles may grant additional capabilities without replacing the Primary Role.

Role Assignment Workflow

Identity Created

↓

Primary Role Assigned

↓

Permissions Generated

↓

Operating System Selected

↓

Platform Activated

Role Changes

Role changes shall:

- Preserve historical audit records
- Recalculate permissions
- Preserve identity ownership

PBOS Responsibilities

PBOS shall:

- Validate role definitions.
- Detect conflicting roles.
- Verify permission inheritance.
- Prevent unauthorized role escalation.

Definition of Done

Canonical role model established.

Role hierarchy documented.

Permission inheritance standardized.

