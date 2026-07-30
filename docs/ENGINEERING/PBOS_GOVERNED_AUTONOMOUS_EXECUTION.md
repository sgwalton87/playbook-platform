# PBOS Governed Autonomous Execution

## Purpose

Provide a narrow execution admission boundary while retaining the Kernel as sole execution authority.

## Admission

Execution requires trusted context, a digest-valid package, approved unexpired authorization, matching request and package identities, satisfied dependencies, and passing validation.

## Lifecycle And Evidence

States are `PROPOSED`, `APPROVED`, `EXECUTING`, `VALIDATING`, `COMPLETED`, and `AUDITED`; terminal failure states are `BLOCKED`, `FAILED`, and `ROLLED_BACK`. Evidence records execution identity, changes, files, validation, failures, rollback, completion, timestamp, and digest.

## Safety Boundary

The engine has no shell, network, deployment, or certification capability. It delegates to an injected canonical executor only after every admission proof passes.
