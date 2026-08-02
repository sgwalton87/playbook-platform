# Playbook Platform Registry Architecture

## Purpose

Define one machine-readable reality map through which PBOS can inventory the repository, validate ownership and dependencies, calculate maturity, surface blockers, and recommend the next infrastructure mission.

## Ownership

Playbook Platform Governance owns registry semantics. Playbook OS Engineering owns the deterministic compiler and validator. Domain owners own resource status and evidence.

## Last Updated

August 1, 2026

## Authority and Composition

`pbos/platform-registry` is the canonical operational registry. It compiles actual App Router pages and route handlers from the repository and joins those facts to explicit application, feature, data entity, role, Role OS, engine, and production-control contracts. Milestone lifecycle is not duplicated: `pbos/manifests/playbook-master-manifest.yaml` remains the referenced milestone authority.

Every resource carries an identifier, purpose, owner, dependencies, evidence, status, and definition of done. Database entities additionally carry view/edit/approve/verify/administer decisions. Role OS resources additionally carry users, dashboard, workflows, permissions, data access, notifications, metrics, and dependencies.

## Truth Semantics

- `IMPLEMENTED` means repository implementation exists, but independent certification may still be required.
- `PARTIAL` means one or more required layers or production proofs are missing.
- `BLOCKED` means a named dependency or authority conflict prevents completion.
- `MISSING` means the governed capability has no usable implementation.
- `DEMO_ONLY` means the surface is not an operational product capability and must remain exposure-controlled.

The initial registry intentionally makes no `IMPLEMENTED` claims. Route or API file existence is evidence of inventory, not evidence of end-to-end completion.

## Deterministic Validation and Readiness

`npm run platform:validate` fails on duplicate identifiers, missing ownership, missing evidence paths, empty definitions of done, unknown dependencies, absent data access contracts, or incomplete OS contracts. Readiness uses fixed status weights and emits maturity, infrastructure readiness, production readiness, feature completion, blockers, and the next recommended mission. Scores are diagnostic and never confer certification.

## Related Documents

- [Master Manifest Architecture](./PBOS_MASTER_MANIFEST_ARCHITECTURE.md)
- [Data Architecture](./PLATFORM_DATA_ARCHITECTURE.md)
- [Authorization Architecture](./AUTHORIZATION_ARCHITECTURE.md)
- [System Audit](../REVIEWS/PLAYBOOK_PLATFORM_SYSTEM_AUDIT_001.md)
