---
id: PBOS-COMPILER-003
title: Typed Intermediate Representation (TIR) Architecture
version: 1.0.0
status: Canonical
classification: Engineering Architecture
owners:
  - PBOS Architecture Review Board
layer: Compiler
authority:
  - PBOS-COMPILER-000
last_updated: 2026-07-28
---

# Purpose

The Typed Intermediate Representation (TIR) is the canonical engineering model used internally by the PBOS Compiler.

All compiler phases SHALL operate on the TIR rather than directly manipulating source documents.

---

# Mission

Provide a deterministic, normalized representation of engineering intent independent of source format.

---

# Responsibilities

The TIR SHALL:

- Normalize source artifacts.
- Preserve semantic meaning.
- Support compiler analysis.
- Enable deterministic planning.
- Serve as the single internal compiler model.
- Preserve provenance.
- Support explainability.

---

# Compiler Flow

Source

↓

Parser

↓

TIR

↓

Semantic Analysis

↓

Planning

↓

Generation

↓

Verification

↓

Certification

---

# TIR Components

The representation SHALL include:

- Artifact Identity
- Types
- Relationships
- Dependencies
- Constraints
- Policies
- Metadata
- Provenance
- Version
- Diagnostics

---

# Properties

The TIR SHALL be:

- Immutable during analysis
- Deterministic
- Versioned
- Serializable
- Machine Readable
- Human Explainable

---

# Architectural Principles

Every compiler phase SHALL consume and produce validated TIR structures.

Compiler phases SHALL NOT communicate through raw source artifacts.

---

# Success Criteria

Every compiler operation is performed against a deterministic Typed Intermediate Representation that preserves engineering intent while enabling analysis, planning, verification, and generation.

