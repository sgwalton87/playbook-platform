---
id: PPS-009
title: Identifier Registry
version: 1.0.0
status: Canonical
classification: Constitution
owner: Playbook Platform
dependencies:
  - PPS-000
  - PPS-001
  - PPS-002
  - PPS-003
  - PPS-004
  - PPS-005
  - PPS-006
  - PPS-007
  - PPS-008
machine_version: 1
release_blocking: true
validation_required: true
---

Purpose

This document establishes the constitutional identifier standards used throughout the Playbook Platform.

Every canonical object shall have one globally unique identifier.

Objectives

Identifiers shall provide:

- Global uniqueness
- Human readability
- Machine readability
- Traceability
- Stable references
- Version independence

General Rules

Identifiers shall:

- Be globally unique.
- Never be reused.
- Remain stable throughout the object's lifetime.
- Continue to exist after deprecation.
- Never be reassigned.

Identifier Prefixes

Platform Specifications

PPS-000

Example

PPS-104

------------------------------------------------------------

Operating Systems

OS-001

Example

OS-014

------------------------------------------------------------

Intelligence Engines

ENGINE-001

Example

ENGINE-012

------------------------------------------------------------

Applications

APP-001

Example

APP-021

------------------------------------------------------------

Features

FEATURE-001

Example

FEATURE-304

------------------------------------------------------------

Screens

SCREEN-001

Example

SCREEN-058

------------------------------------------------------------

Components

COMP-001

Example

COMP-422

------------------------------------------------------------

API Endpoints

API-001

Example

API-147

------------------------------------------------------------

Database Tables

TABLE-001

Example

TABLE-083

------------------------------------------------------------

Database Fields

FIELD-001

Example

FIELD-905

------------------------------------------------------------

Permissions

PERMISSION-001

Example

PERMISSION-027

------------------------------------------------------------

Events

EVENT-001

Example

EVENT-144

------------------------------------------------------------

Workflows

FLOW-001

Example

FLOW-032

------------------------------------------------------------

Migrations

MIGRATION-001

Example

MIGRATION-078

------------------------------------------------------------

Tests

TEST-001

Example

TEST-654

Naming Standards

Identifiers shall:

- Use uppercase prefixes.
- Use sequential numeric values.
- Avoid semantic meaning inside the identifier.
- Reference descriptive names elsewhere.

Example

Correct

PPS-104

Incorrect

PPS-AUTHENTICATION

The identifier remains stable even if the title changes.

Lifecycle

Identifiers remain valid through every lifecycle stage:

- Draft
- Review
- Approved
- Canonical
- Deprecated
- Archived

Deprecation shall never free an identifier for reuse.

PBOS Responsibilities

PBOS shall:

- Prevent duplicate identifiers.
- Validate identifier formatting.
- Maintain identifier history.
- Preserve traceability.
- Detect missing references.
- Verify dependency references.

Constitutional Rules

Every canonical object shall possess one identifier.

Identifiers shall never change ownership.

Identifiers shall never be recycled.

Definition of Done

Identifier system established.

Naming conventions documented.

Uniqueness guaranteed.

Repository traceability supported.

