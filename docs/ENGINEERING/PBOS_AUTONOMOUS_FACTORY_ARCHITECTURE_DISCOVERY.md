# PBOS Autonomous Factory Architecture Discovery

## Purpose

Reconcile autonomous factory activation with existing PBOS roadmap, planning, execution, and governance authorities.

## Ownership

Playbook OS Engineering.

## Last Updated

July 30, 2026

## Discovery Decision

The repository already contains authoritative gate planning, a Constitutional Execution Kernel, development orchestration, Product Factory compilation, authorization, execution admission, runtime execution, validation, certification, lifecycle governance, documentation discovery, and architecture registries.

The activation extends these systems through a complete manifest adapter and a read-only build-cycle coordinator. It does not create another selector, approval writer, executor, or completion authority.

## Canonical Systems

| Capability | Authority |
|---|---|
| Roadmap declaration | `pbos/manifests/playbook-master-manifest.yaml` |
| Gate constitution | `pbos/gates/**` |
| Repository truth | `pbos/context/**` |
| Objective selection | `pbos/kernel/execution/**` |
| Intelligence and recommendation | `pbos/orchestration/**` |
| Screen compilation | `pbos/product-factory/**` |
| Human decisions | `pbos/orchestration/authorization/**` |
| Execution admission | `pbos/orchestration/execution-runtime/**` |
| Execution | `pbos/runtime/kernel-runtime.ts` |
| Lifecycle mutation | `pbos/lifecycle/**` |
| Documentation indexes | `docs/DOCUMENTATION/**` |

## Reconciliation

`pbos/build-intelligence` is a projection over the existing system assessment and master manifest. It does not independently observe or select. `pbos:cycle` calls the existing development orchestration composition root and stops before any transition that lacks trusted context or authorization.

## Current Trust Boundary

The stored repository context predates current repository changes. PBOS correctly rejects recommendation certification. Any cycle claiming execution or completion in this state would violate context authority and evidence integrity.

## Related Documents

- [Autonomous Build Orchestrator Discovery](./PBOS_AUTONOMOUS_BUILD_ORCHESTRATOR_DISCOVERY.md)
- [Master Manifest Architecture](./PBOS_MASTER_MANIFEST_ARCHITECTURE.md)
