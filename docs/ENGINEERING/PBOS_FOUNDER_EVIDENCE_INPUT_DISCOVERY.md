# PBOS Founder Evidence Input Discovery

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [Launch Authority Evidence Discovery](./PBOS_LAUNCH_AUTHORITY_EVIDENCE_DISCOVERY.md)

## Purpose

This discovery identifies how human launch evidence enters the existing PBOS authority chain. It confirms that the missing capability was command input, not governance ownership.

## Existing Ownership

| Responsibility | Canonical owner | Existing implementation |
|---|---|---|
| Repository change observation | Git-backed change inventory | `pbos/context/change-boundary/inventory.ts` |
| Scope declaration construction and validation | Change Boundary Authority | `pbos/context/change-boundary/authority.ts` |
| Scope history persistence | Change Boundary Authority | `pbos/context/change-boundary/store.ts` |
| Human decision construction and validation | Launch Approval Authority | `pbos/authority/launch/authority.ts` |
| Decision evidence | Authority Ledger | `pbos/authority/ledger.ts` |
| Approval history persistence | Authority Ledger | `pbos/authority/launch/store.ts` |
| Trusted context admission | Context Activation Authority | `pbos/context/activation/service.ts` |
| Operational presentation | Mission Control | `pbos/commands/it` |

The command bus previously read environment variables directly. `kernel-cli.ts` accepted a command name but discarded all remaining command-line arguments and provided no interactive input path. The builders and stores were therefore reachable only through preconfigured process environment state.

## Architectural Finding

The correct boundary is a stateless CLI adapter before command dispatch. It may collect, normalize, and confirm human input. It may not build authority artifacts, approve evidence, persist records, or activate context.

The command bus remains responsible for passing normalized input to the existing builders. Change Boundary and Launch Approval remain the sole validators and persistence authorities.

## Validation Rules Preserved

- Every changed path must be classified exactly once.
- Scope is bound to repository, commit, branch, inventory identity, and digest.
- Requester and reviewer must be distinct.
- Approval is bound to the exact boundary identifier and digest.
- Missing, malformed, expired, or unconfirmed evidence is rejected.
- No artifact is written before canonical validation succeeds.
- Trusted context still requires separately governed activation.

## Input Modes

Interactive mode is available only when both standard input and output are terminals. It prompts for missing values and requires the operator to type `yes` before submission.

Explicit mode accepts named arguments after the npm argument separator. File arguments accept comma-separated values or repeated flags:

```text
npm run pbos:change-boundary -- \
  --requester-identity <identity> \
  --business-purpose <purpose> \
  --technical-purpose <purpose> \
  --approved-files <path,path> \
  --excluded-files <path,path> \
  --risk-acknowledgment <acknowledgment> \
  --expiration <ISO-8601>
```

```text
npm run pbos:approve-boundary -- \
  --requester-identity <identity> \
  --reviewer-identity <independent-identity> \
  --decision APPROVED \
  --reason <reason> \
  --risk-acknowledgment <acknowledgment> \
  --expiration <ISO-8601>
```

Environment-variable input remains supported for automation compatibility. Explicit command input takes precedence.

## Discovery Decision

No new authority, approval, context, lifecycle, or persistence system is required. The founder evidence input adapter is a transport boundary only.
