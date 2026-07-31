# PBOS Execution Fabric Architecture

## Purpose

Define the governed execution substrate that converts a certified PBOS
execution package into provider-bound assignment, controlled execution,
immutable evidence, and lifecycle advancement eligibility.

## Ownership

PBOS Execution Authority owns permission to execute. Provider Registry owns
provider admission metadata. Task Assignment owns bounded work. Execution
Fabric Runner owns the only provider-dispatch composition root. Execution
Evidence owns immutable outcome history. Lifecycle Governance remains the only
authority permitted to mutate milestone state.

## Last Updated

July 31, 2026

## Related Links

- [Autonomous Operator Wiring Audit](../REVIEWS/PBOS_AUTONOMOUS_OPERATOR_WIRING_AUDIT_001.md)
- [Operator Experience Architecture](../release-evidence/PBOS_OPERATOR_EXPERIENCE_ARCHITECTURE_001.md)
- [Execution Fabric Implementation Evidence](../release-evidence/PBOS_EXECUTION_FABRIC_IMPLEMENTATION_001.md)

## Architecture

```text
Certified execution package
  -> human ApprovalRecord
  -> ExecutionAuthorityRecord
  -> certified ProviderContract
  -> provider-bound ExecutionAuthorization
  -> governed TaskAssignment
  -> Execution Admission
  -> ExecutionFabricRunner
  -> replaceable ExecutionAdapter
  -> ExecutionEvidenceBundle
  -> MilestoneAdvancementAssessment
  -> Lifecycle Governance
```

No layer may infer the authority owned by the layer above it.

## Authority Model

`ExecutionAuthorization` is immutable and binds:

- package ID and digest;
- repository, branch, commit, and trusted-context identity;
- provider ID and provider-contract digest;
- allowed and prohibited actions;
- expiration;
- evidence requirements.

Issuance fails closed when the package, context, provider, capability,
evidence, authority, or expiry relationship is invalid. The runner revalidates
authorization immediately before provider dispatch.

## Provider Model

`ExecutionProviderRegistry` is the canonical provider marketplace. A provider
must declare a unique identity, type, capabilities, version, certified trust
level, controlled execution method, and evidence contract.

Supported classifications are code, test, documentation, and design agents.
The registry stores the provider contract alongside its adapter. Registration
does not grant execution authority.

## Codex Adapter

Codex is represented by `CodexExecutionAdapter` and registered through
`registerCodexProvider`. The adapter accepts only an injected controlled
delegate. PBOS does not shell directly to a local Codex binary because doing so
would bypass provider certification, environment isolation, command capture,
and operator authorization.

The controlled production delegate:

- invokes the approved provider in an isolated workspace;
- enforces task scope before and after execution;
- captures commands and changed files;
- returns validation and timestamp evidence;
- supports termination and bounded runtime.

## Assignment Model

Task Assignment binds the package, milestone, trusted context, approval, agent,
allowed and prohibited scope, capabilities, validations, and evidence. The
existing permission policy rejects unknown capabilities, prohibited
permissions, and scope intersection.

## Execution Model

`ExecutionFabricRunner` is the sole composition root. It verifies:

- admission is approved;
- provider exists and matches authority;
- authorization is valid and current;
- provider capabilities cover authority requirements;
- provider evidence contract covers required evidence;
- adapter result matches task and agent;
- every changed artifact remains inside allowed scope.

The runner then builds a digest-bound evidence bundle.

## Evidence Model

The durable `pbos/runtime/execution-evidence.json` artifact is owned by
`execution-evidence`. It preserves the latest bundle and deduplicated history.
Loading fails closed on bundle or history digest corruption.

Evidence records package, context, approval, provider/agent, artifacts,
validation results, evidence references, status, completion time, and digests.

## Lifecycle Integration

`assessMilestoneAdvancement` produces eligibility, not a lifecycle mutation.
Eligibility requires successful execution, complete evidence, advancement
approval, and exact package identity. Lifecycle Governance must independently
consume that assessment before changing canonical milestone state.

## Security Boundaries

- Providers cannot self-register, self-authorize, or self-certify.
- Local binaries are not trusted by discovery alone.
- Runtime truth is written only through canonical stores.
- Provider results cannot escape assignment scope.
- Expired or mismatched authorization blocks before dispatch.
- Evidence incompleteness blocks lifecycle advancement.

## Activation Boundary

Production Codex execution is disabled by default and requires
`PBOS_CODEX_EXECUTION_ENABLED=true`. Enabling the delegate does not bypass
package approval, provider-bound authorization, assignment, admission, scope
validation, evidence, or lifecycle validation.

## Operator Continuation

`npm run it` now owns the continuation sequence:

1. recover trusted context when required;
2. select one canonical objective and package;
3. request `npm run pbos:approve` when package authority is absent;
4. create assignment and admission automatically after approval;
5. pause when the production delegate is disabled;
6. dispatch the controlled provider when enabled;
7. persist execution evidence;
8. assess and persist milestone completion;
9. return control to planning for the next objective.

The approval command collects requester, independent reviewer, decision,
reason, risk acknowledgement, and expiration. Rejected approval is durable and
does not issue execution authority.
