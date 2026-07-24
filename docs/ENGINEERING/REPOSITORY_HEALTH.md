# Repository Health Report

## Executive summary

The available local snapshot is structurally rich and has substantial automated unit coverage, but it is not operationally ready: lint, TypeScript, build, aggregate test, and dependency-tree checks fail. Remote governance, full history, deployment/environment policy, database consistency, security advisories, and dedicated static-topology checks remain unavailable. This gate made no repairs.

## Repository health score

**NOT SCORED.** A numeric score would be fabricated because the canonical scoring rubric, validation weights, complete remote topology, security result, deployment contract, and database target are unavailable. PBOS records evidence-backed status (`HEALTHY`, `DEGRADED`, `BLOCKED`, or `UNKNOWN`) instead. A human-approved rubric is required before a numeric score can be canonical.

| Area | Status | Written justification |
|---|---|---|
| Documentation health | DEGRADED | Canonical map exists, but Git policy and canonical architecture are missing; 49/191 docs are empty and 60/191 are under ten lines; roadmap duplicates conflict. |
| Architecture health | UNKNOWN | Canonical architecture files named by the authority map are absent. Lower-authority code/docs cannot certify architecture. |
| Code health | DEGRADED | ESLint reports 311 errors and 91 warnings. Dedicated dead-code/unused-export/cycle analysis is not configured. |
| TypeScript health | BLOCKED | `tsc --noEmit` fails on four non-module UI indexes and unavailable E2E packages/types. |
| Testing health | DEGRADED | 97 Vitest files and 431 tests pass, but one E2E suite fails at import, causing the command to fail. Jest is not configured. |
| Build health | BLOCKED | Next compilation succeeds, then type checking fails at `components/ui/index.ts`; no production artifact completes. |
| Dependency health | DEGRADED | Manifest/lock dry-run is consistent, but `npm ls --all` reports two missing declared test packages and extraneous transitive packages in the installed tree. |
| Database health | UNKNOWN | Twenty migrations exist; no Supabase config, local reset/lint result, project identity, or remote drift evidence exists. |
| Security health | UNKNOWN | `npm audit` was attempted but the registry advisory endpoint returned HTTP 403. No canonical SAST/secret-scan workflow exists. |
| Performance health | UNKNOWN | 43 image lint warnings are signals, not a performance measurement; no Lighthouse/bundle/runtime baseline exists. |
| Maintainability | DEGRADED | Lint debt, exact duplicate groups, backups among linted/tracked sources, and missing static topology validation increase maintenance risk. |
| Technical debt | DEGRADED | Work packages are cataloged in Engineering Defect Classification; repair is intentionally deferred. |
| Operational readiness | BLOCKED | Identity/governance is partial and mandatory validation gates fail or remain unknown. |

## Validation baseline

| Validation | Result |
|---|---|
| ESLint | FAIL — 402 findings (311 errors, 91 warnings). |
| TypeScript | FAIL — UI barrel non-modules; missing E2E package types. |
| Production build | FAIL — compilation completes; type check stops build. |
| Vitest | FAIL overall — 97 files / 431 tests pass; one suite fails during import. |
| Jest | NOT AVAILABLE — no configuration/script/dependency. |
| Playwright | BLOCKED — declared dependencies absent from installed tree; build prerequisite also fails. |
| Dependencies | FAIL — `npm ls --all` reports missing and extraneous packages. |
| Package integrity | PASS (limited) — `npm install --package-lock-only --ignore-scripts --dry-run` reports up to date; it does not prove a clean install. |
| Dead code / unused exports / cycles | NOT AVAILABLE — no dedicated configured validator. |
| Broken imports | FAIL (partial) — TypeScript and Vitest identify broken/unavailable modules. |
| Duplicate files | DEGRADED — SHA-256 scan finds multiple exact-content groups; semantic duplication was not inferred. |
| Database/Supabase | UNKNOWN — migrations inventoried only. |
| Documentation | DEGRADED — static inventory performed; no non-mutating validator configured. |
| Git integrity | PASS (limited) — fsck completes with one dangling commit; repository is shallow. |
| Environment | BLOCKED — no environment contract/examples or deployment target. |
| Security advisories | BLOCKED BY ENVIRONMENT — audit endpoint HTTP 403. |

## Remaining risks

1. The repository may not be connected to its intended host or full history.
2. A clean dependency install may change test/type results.
3. No deployable production build is currently demonstrated.
4. Database migrations and RLS have not been executed against an identified target.
5. Security and performance posture are unmeasured.
6. Missing canonical architecture makes ownership and boundary validation non-deterministic.

## Recommended next gate

Proceed to **PBOS-GATE-002 — Governance, Dependency Reproducibility & Build Baseline**, only after the minimal human identity/governance decisions in `REMAINING_HUMAN_DECISIONS.md` are supplied. The gate definition is in `PBOS_GATE_002.md`.
