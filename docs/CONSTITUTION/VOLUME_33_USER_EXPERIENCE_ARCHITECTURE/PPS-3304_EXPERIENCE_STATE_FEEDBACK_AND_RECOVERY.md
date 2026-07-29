---
id: PPS-3304
title: Experience State Feedback and Recovery
version: 1.0.0
status: Canonical
classification: Constitutional
owners:
  - Playbook Platform
layer: User Experience State
parent: PPS-3300
depends_on:
  - PPS-003
  - PPS-008
  - PPS-009
  - PPS-010
  - PPS-012
  - PPS-013
  - PPS-014
  - PPS-1300
  - PPS-3100
  - PPS-3200
  - PPS-3300
  - PPS-3302
required_by:
  []
consumes:
  - PPS-003
  - PPS-008
  - PPS-009
  - PPS-010
  - PPS-012
  - PPS-013
  - PPS-014
  - PPS-1300
  - PPS-3100
  - PPS-3200
  - PPS-3300
  - PPS-3302
provides:
  - PPS-3304
integrates_with:
  - PPS-003
  - PPS-3296
supports:
  []
references:
  - PPS-003
  - PPS-008
  - PPS-009
  - PPS-010
  - PPS-012
  - PPS-013
  - PPS-014
  - PPS-1300
  - PPS-3100
  - PPS-3200
  - PPS-3300
  - PPS-3302
  - PPS-3296
related:
  - PPS-003
  - PPS-3296
children:
  []
constitutional_authority:
  - PPS-003
  - PPS-3300
last_updated: 2026-07-28
machine_version: 1
release_blocking: true
validation_required: true
---

# Purpose

Define user-visible state, feedback, errors, and recovery for every workflow.

# Required Experience States

| State | Constitutional Requirement |
| --- | --- |
| Initial | Purpose, prerequisites, and available action are clear |
| Loading | Work is acknowledged; scope and expected continuation are clear |
| Empty | Absence is distinguished from loading, error, denial, or filtering |
| Ready | Current authoritative state and available actions are visible |
| Editing | Unsaved changes and validation state are explicit |
| Submitting | Duplicate action is prevented and cancellation rules are clear |
| Success | Confirmed outcome, affected object, and next action are stated |
| Partial success | Completed and incomplete effects are distinguished |
| Error | Failure is honest, contextual, accessible, and actionable |
| Forbidden | Access denial reveals no protected resource detail |
| Unavailable | Dependency or maintenance state is distinguished from denial |
| Offline | Stale and pending state are explicit; unsafe writes are blocked |

# Feedback Timing

Local interaction feedback is immediate. Server-confirmed outcomes wait for authoritative confirmation. Asynchronous work exposes persistent status and eventual outcome without requiring users to remain on one page.

# Error Language

Errors explain what happened, what remains preserved, what the user can do, and where help exists. They do not expose secrets, blame the user, claim success, or collapse validation, authorization, dependency, and system failures into one message.

# Recovery

Recovery preserves valid input, focuses the first actionable problem, supports retry only when safe, uses idempotency for commands, and allows correction, resume, cancellation, compensation, or support escalation as the domain permits.

# Repository Finding

Shared state components exist, but App Router coverage includes one loading.tsx and no route-level error.tsx or not-found.tsx. Repository certification therefore fails complete state coverage until screen-level evidence proves equivalent handling.

# Validation

PBOS shall inspect every workflow and screen specification for the state matrix, authoritative success, preserved work, accessible feedback, error classification, and tested recovery.
