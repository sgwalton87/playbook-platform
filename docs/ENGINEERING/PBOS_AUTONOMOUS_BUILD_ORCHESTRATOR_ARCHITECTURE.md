# PBOS Autonomous Build Orchestrator Architecture

## Purpose

Define the central governed loop that connects Playbook mission, roadmap, architecture, Product Factory, execution, and validation.

## Ownership

Playbook OS Engineering owns orchestration composition. Existing PBOS authorities retain context, planning, authorization, execution, validation, certification, and lifecycle ownership.

## Last Updated

July 30, 2026

## Architecture

```text
OBSERVE -> UNDERSTAND -> SELECT -> PREPARE
        -> REQUEST HUMAN APPROVAL -> ADMIT -> EXECUTE
        -> VALIDATE -> CERTIFY -> GOVERNED STATE UPDATE
```

The current implementation operationalizes observation through package preparation. Approval, admission, execution, and evidence systems already exist and remain separate. No unrestricted loop is enabled.

## Product Factory Connection

The master manifest identifies a screen-package validation milestone. Kernel selection creates an execution plan. The orchestration package generator converts that plan into governed engineering instructions. A screen implementation package may additionally be compiled by `ProductBuildPackageGenerator`; its specification digest must be retained as evidence.

## Trust Boundaries

- Mission and roadmap changes require human authority.
- The manifest cannot self-update.
- The recommendation engine cannot select independently.
- The package generator cannot approve.
- The authorization gateway cannot execute.
- The runtime cannot admit untrusted or changed packages.
- Execution cannot self-certify.

## Recovery

Interrupted work remains represented by immutable package, authorization, lifecycle, and execution identities. Recovery must reload those artifacts and revalidate context and digests. It may not recreate approval or infer completion.

## Current Limitation

The repository context snapshot is stale relative to current work. The correct result is a blocked recommendation until governed context reconciliation occurs. This is a trust control, not an orchestration defect.

## Related Documents

- [Discovery](./PBOS_AUTONOMOUS_BUILD_ORCHESTRATOR_DISCOVERY.md)
- [Master Build Manifest](./PBOS_MASTER_BUILD_MANIFEST_ARCHITECTURE.md)
- [Next Engine](./PBOS_NEXT_ENGINE_ARCHITECTURE.md)
