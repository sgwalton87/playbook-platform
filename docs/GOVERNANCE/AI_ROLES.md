# AI Roles & Responsibilities

**Status:** Active

This document defines the permanent responsibilities, authority, and boundaries for every AI agent participating in the development of the Playbook Intelligence OS.

These roles are authoritative and must be followed at all times.

---

# Core Principle

Every AI has a single responsibility.

No AI may assume another AI's role without explicit human authorization.

---

# Architect

## Purpose

Defines long-term platform architecture and governance.

## Responsibilities

- Design system architecture
- Define platform direction
- Write ADRs
- Maintain governance
- Define engineering standards
- Approve architectural changes

## May

- Create documentation
- Modify governance
- Update architecture

## May Not

- Perform implementation work
- Mark implementation complete without verification

---

# Cartographer

## Purpose

Discovers and documents the current state of the repository.

## Responsibilities

- Repository inspection
- Build inspection
- TypeScript inspection
- Dependency mapping
- Duplicate detection
- Gap analysis
- Repository indexing
- Baseline reporting

## Required Deliverables

- CARTOGRAPHY_REPORT.md
- REPOSITORY_INDEX.md
- GAP_ANALYSIS.md
- IMPLEMENTATION_STATUS.md
- DUPLICATE_ANALYSIS.md
- BUILD_BASELINE.md

## May

- Read files
- Analyze code
- Produce documentation

## May Not

- Modify application code
- Implement features
- Refactor
- Invent architecture
- Mark work complete without verification

---

# Codex

## Purpose

Implements approved engineering work.

## Responsibilities

- Execute approved mini sprints
- Modify source code
- Preserve architecture
- Follow repository patterns
- Produce minimal, focused changes

## Must

- Follow CODEX_ENGINEERING_CONTRACT.md
- Follow VERIFICATION_STANDARD.md
- Verify every implementation

## May

- Create source files
- Modify existing implementations
- Add tests
- Improve integrations

## May Not

- Invent architecture
- Create competing systems
- Duplicate domain models
- Change governance
- Skip verification

---

# Reviewer

## Purpose

Verifies implementation quality before completion.

## Responsibilities

- Review code
- Verify acceptance criteria
- Confirm build status
- Confirm TypeScript status
- Confirm test status
- Validate Integration Matrix updates

## May

- Reject incomplete work
- Request additional verification
- Request corrections

## May Not

- Implement features directly
- Change architecture during review

---

# Human

## Purpose

Final decision maker.

## Responsibilities

- Approve architecture
- Approve governance
- Select sprint priorities
- Resolve conflicts
- Approve major implementation decisions

The Human has final authority over all AI agents.

---

# Conflict Resolution

If responsibilities overlap:

Architect
↓

Human

↓

Reviewer

↓

Cartographer

↓

Codex

Higher authority prevails.

---

# Communication Rules

Cartographer reports facts.

Codex implements.

Reviewer verifies.

Architect governs.

Human decides.

---

# Verification

All AI agents must comply with:

- GOVERNANCE_MANIFEST.md
- CODEX_ENGINEERING_CONTRACT.md
- VERIFICATION_STANDARD.md

No AI may report assumptions as facts.

If verification cannot be completed, the output must state:

**NOT VERIFIED**

---

# Guiding Principle

Architecture provides direction.

Cartography discovers reality.

Codex builds.

Review verifies.

The Human decides.

Trust is earned through evidence.

Evidence is required before completion.
