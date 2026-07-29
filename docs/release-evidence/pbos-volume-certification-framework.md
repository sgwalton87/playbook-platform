---
id: PBOS-VOLUME-CERTIFICATION-FRAMEWORK
title: PBOS Constitutional Volume Certification Framework
version: 1.0.0
status: Canonical
classification: Release Evidence
owner: PBOS
last_updated: 2026-07-28
---

# PBOS Constitutional Volume Certification Framework

## Purpose

This framework defines the reusable PBOS governance boundary that evaluates whether a Playbook Constitutional Volume is eligible to advance toward canonical status. It produces evidence and a promotion recommendation. It never changes constitutional status.

## Authority

The subsystem is implemented under `pbos/constitution/`. Its durable machine-readable evidence is `pbos/runtime/volume-certification.json`, owned exclusively by `volume-certification`. Human-readable run reports are written to `docs/release-evidence/volume-<number>-certification.md`.

## Lifecycle

The governed lifecycle is:

`draft` → `architecture_complete` → `implementation_ready` → `certified` → `canonical`

Any active state may transition to `blocked`. Recovery from `blocked` returns to `draft` for re-evaluation. Skipped or reversed transitions are invalid. Certification only recommends the next transition; an explicit governed promotion action remains mandatory.

## Certification Rules

| Rule | Requirement |
| --- | --- |
| INT-001 | Authority Integrity |
| INT-002 | Architecture Completeness |
| INT-003 | Internal Consistency |
| INT-004 | Ecosystem Compatibility |
| INT-005 | Multi Operating System Compatibility |
| INT-006 | Accessibility Standard |
| INT-007 | Experience State Coverage |
| INT-008 | Enterprise Quality Standard |
| INT-009 | PBOS Governance Integration |
| INT-010 | Canonical Promotion Readiness |

Every rule requires explicit repository evidence. Missing metadata, authority, documents, dependencies, lifecycle state, or quality contracts fails closed.

## Discovery And Identity

PBOS discovers numbered constitutional directories beneath `docs/CONSTITUTION/` and `docs/PPS/`. A requested volume must resolve to exactly one directory. The expected authority identity is `PPS-<volume>00`; its README identity is `VOLUME-<volume>`.

Evidence binds the volume number, directory, authority, lifecycle source, complete content digest, rule outcomes, score, blockers, evaluation time, and run identity.

## Completeness And Dependencies

The authority document must explicitly enumerate its related volume documents. Each declared identity must exist locally, contain substantive content, and inherit from the authority. Every declared dependency must resolve to exactly one repository document identity. PBOS never infers a missing authority or dependency.

## Evidence Persistence

Each invocation appends a certification run to the durable history and updates the `latest` pointer. An invalid existing artifact blocks the write because history preservation cannot be proven. Evidence cleanup requires a governed transition.

## Promotion

INT-001 through INT-009 establish governance readiness. INT-010 additionally requires an explicitly `certified` lifecycle before canonical promotion can be recommended. A recommendation is not authorization and does not mutate front matter, registries, runtime lifecycle state, or constitutional history.

Governed promotion is performed separately:

```text
npm run pbos:promote-volume -- 34 --target architecture_complete
```

The promotion engine requires certification evidence for the current volume content digest and lifecycle, validates only the next adjacent transition, updates every volume document through the single `volume-promotion` owner, and records approved or denied attempts in `pbos/runtime/volume-promotion.json`. The resulting document digest requires a new certification run before another transition.

Later transitions additionally require:

- A content-bound `docs/release-evidence/volume-<number>-implementation-readiness.md` before `implementation_ready`.
- A passing `docs/release-evidence/volume-<number>-implementation-validation.json` before `certified`.
- A content-bound `docs/release-evidence/volume-<number>-canonical-approval.json` and INT-010 PASS before `canonical`.

## Operation

Run:

```text
npm run pbos:certify-volume -- 34
```

The command prints the volume, status, score, passed rules, failed rules, blocking conditions, and promotion recommendation while persisting machine-readable and human-readable evidence.

## Failure And Recovery

PBOS fails closed for unknown lifecycle states, duplicate volume paths or identities, unresolved dependencies, incomplete documentation, missing quality evidence, invalid artifact history, or ineligible promotion state.

Recovery requires correcting the authoritative source or dependency, preserving prior evidence, rerunning certification, and using a separate explicit lifecycle action after review.
