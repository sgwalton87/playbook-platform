---
id: PPS-803
title: Command System
version: 1.0.0
status: Canonical
classification: Constitutional
owners:
  - PBOS
layer: Engine
parent: Volume 08
depends_on:
  - PPS-800
related:
  - PPS-801
  - PPS-802
  - PPS-804
last_updated: 2026-07-25
---

# Purpose

The Command System defines the constitutional interface through which humans and authorized systems interact with PBOS.

---

# Scope

Applies to every PBOS command, automation, administrative operation, validation request, planning request, and engineering action.

---

# Authority

All command execution shall comply with constitutional governance.

---

# Definitions

## Command

A structured request submitted to PBOS.

## Command Handler

The component responsible for executing a command.

## Command Registry

The canonical catalog of supported PBOS commands.

---

# Constitutional Principles

- Commands are deterministic.
- Commands are authenticated.
- Commands are authorized.
- Commands are observable.
- Commands are auditable.

---

# Architecture

The Command System consists of:

- Command Registry
- Command Parser
- Authorization Layer
- Dispatcher
- Result Formatter

---

# Canonical Commands

PBOS shall support commands including:

- pbos plan
- pbos context
- pbos next
- pbos execute
- pbos validate
- pbos audit
- pbos certify
- pbos doctor
- pbos release
- pbos status
- pbos bootstrap

Additional commands may be introduced through constitutional amendment.

## Repository Context Command

`npm run pbos:context` is the sole public repository context refresh authority. It observes repository and runtime reality, builds a content-sensitive snapshot, validates the complete candidate, preserves prior refresh evidence, and publishes the new context only after validation passes.

The command requires known repository identity, configured remote alignment, complete required runtime artifacts, canonical artifact ownership, consistent gate relationships, and a passing runtime validation artifact. It rejects partial refreshes and never repairs planning, validation, authorization, certification, or lifecycle state.

`pbos:next` consumes the resulting context through the canonical constitutional planner. Missing, stale, or mismatched context prevents gate selection.

## Artifact Reconciliation Command

`npm run pbos:reconcile-artifacts` is the governed recovery path for inconsistent PBOS runtime artifacts. It classifies validation, execution, planning, repository context, and engine state as valid, stale, superseded, invalid, or recoverable.

Before regeneration, the command archives each prior artifact body and digest in durable reconciliation history. It then delegates planning to `constitutional-planner`, validation to `runtime-validator`, and execution state to `execution-engine`. Repository context is regenerated separately through `pbos:context`; engine state is never synthesized by reconciliation.

Unknown ownership, invalid engine-state authority, failed owner regeneration, or remaining cross-artifact conflicts deny reconciliation.

---

# Command Lifecycle

1. Receive Command
2. Authenticate
3. Authorize
4. Validate
5. Dispatch
6. Execute
7. Record
8. Return Result

---

# Responsibilities

The Command System shall:

- Parse commands.
- Validate syntax.
- Authenticate callers.
- Dispatch execution.
- Record command history.
- Produce explainable results.

---

# Interfaces

Coordinates with every PBOS Engine module.

---

# Validation Rules

The Command System shall:

- Reject invalid commands.
- Reject unauthorized commands.
- Preserve execution history.
- Produce deterministic results.

---

# Compliance Requirements

Every command shall remain constitutional, auditable, and explainable.

---

# Implementation Guidance

Commands should remain stable, versioned, and backward compatible whenever practical.

---

# Definition of Done

The Command System consistently provides a secure, deterministic interface to every PBOS capability.

---

# Future Amendments

Future versions may introduce graphical command interfaces, conversational execution, remote orchestration, and programmable command pipelines.

---

# References

- PPS-800 PBOS Engine Architecture
- PPS-801 Planning Engine
- PPS-802 Execution Engine
