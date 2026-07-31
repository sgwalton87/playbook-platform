# PBOS Execution Identity Resolution Implementation 001

## Root Cause

Execution authority captured both the stable Codex agent ID and a registry-record digest. The default agent registry was reconstructed with the current command timestamp, so the record digest changed between approval and assignment. Admission compared the new temporal digest with the approved digest and rejected an otherwise identical agent.

The provider contract also used the agent ID as its provider ID without explicitly declaring the provider-to-agent relationship. This made the intended relationship conventional rather than enforceable.

## Identity Chain Before

Human approval -> execution authority containing temporal agent digest -> provider identified by convention -> newly reconstructed agent record -> digest mismatch -> assignment blocked.

## Architecture Correction

The provider contract now declares a unique contract ID and executable agent ID. The canonical resolver produces a digest-bound `ExecutionIdentityResolution` only when exactly one registered, version-compatible agent satisfies a certified provider contract.

Authorization now binds provider, provider contract, and agent identities. Assignment records those identities plus the authorization ID, package scope, and evidence requirements. Admission validates the resolution and complete assignment chain. The runner repeats the critical bindings before dispatch.

## Security Result

No validation was bypassed. Temporal metadata was removed as an identity key and replaced by stronger compound identity validation. Unknown, uncertified, unresolved, duplicate, changed, or mismatched identities remain fail-closed.

## Files Changed

- `pbos/execution/providers/**`
- `pbos/execution/authority/**`
- `pbos/execution/tasks/**`
- `pbos/execution/admission/**`
- `pbos/execution/runner/**`
- `pbos/commands/kernel-command-bus.ts`
- execution identity architecture and this evidence report

## Tests Added

Coverage verifies certified resolution, unknown and uncertified rejection, absent identity rejection, provider duplication rejection, assignment identity correlation, changed authorization rejection, admitted dispatch, and denied dispatch.

## Execution Result

The implementation removes the deterministic assignment failure caused by temporal agent digests. Live provider dispatch remains subject to repository context, current package-bound human approval, provider activation configuration, and the external Codex execution environment.
