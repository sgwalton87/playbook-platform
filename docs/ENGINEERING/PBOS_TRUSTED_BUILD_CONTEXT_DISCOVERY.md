# PBOS Trusted Build Context Discovery

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [Trusted Build Context Architecture](./PBOS_TRUSTED_BUILD_CONTEXT_ARCHITECTURE.md)

## Purpose

This discovery records the authority paths that govern repository truth before autonomous planning or execution admission.

## Existing Authorities

| Concern | Canonical owner | Evidence |
|---|---|---|
| Repository observation | `pbos/context/loader.ts` | `RepositoryContextSnapshot` |
| Stored repository identity | repository context lifecycle | `pbos/runtime/repository-context.json` |
| Difference analysis | context reconciliation | `ContextReconciliationReport` |
| Refresh mutation | `ContextRefreshAuthority` | reconciliation-bound approval |
| Build manifest | master manifest loader | validated manifest digest |
| Context admission | context activation authority | human decision and activation evidence |
| Runtime persistence | PBOS Runtime ownership registry | trusted context history |
| Execution admission | execution admission bridge | current trusted context |

No parallel context authority is required. Trusted build context is a downstream admission artifact; it cannot replace repository observation or refresh repository context.

## Current Reality

The stored repository context predates the current HEAD and working-tree content. The repository contains expected development changes, but those changes are not equivalent to approval. Reconciliation therefore requires human review, while activation remains blocked until repository context, artifact inventory, and the clean content identity are aligned.

## Constitutional Finding

The prior activation contract accepted an approval reference without representing the human decision, reviewer, reason, evidence, risk acknowledgment, or expiration. It also had no canonical runtime ownership or command surface. The trusted-context boundary has been extended to close those gaps while retaining fail-closed behavior.
