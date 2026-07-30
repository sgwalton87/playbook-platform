# PBOS Founder Evidence Input Architecture

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [Founder Evidence Input Discovery](./PBOS_FOUNDER_EVIDENCE_INPUT_DISCOVERY.md), [Founder Launch Authority Model](./PBOS_FOUNDER_LAUNCH_AUTHORITY_MODEL.md)

## Purpose

This architecture defines how an accountable human supplies evidence to the existing PBOS launch authorities without transferring authority to the CLI.

## Control Flow

```text
Human operator
  -> founder evidence input adapter
  -> kernel command bus
  -> Change Boundary or Launch Approval validator
  -> canonical artifact store
  -> Context Reconciliation
  -> Context Activation
  -> Mission Control
```

## Input Contract

The adapter accepts explicit named arguments and TTY prompts. Inputs are normalized into strings and sorted, deduplicated file lists. Unknown positional arguments, missing flag values, and unconfirmed interactive submissions fail before command dispatch.

Interactive collection fills only missing fields. This permits a human to provide some values explicitly and complete the remainder through prompts. Every interactive submission requires an affirmative `yes`.

## Authority Boundary

The adapter has no artifact API and no runtime ownership. It cannot:

- decide which files belong in a boundary;
- approve risk;
- verify a human identity provider;
- create authority ledger decisions;
- persist boundary or approval history;
- activate trusted context;
- cause Mission Control to report `GO`.

Its output is untrusted input until the canonical authority validates it.

## Persistence and Immutability

Validated declarations remain owned by `change-boundary-authority`. Validated approval history remains owned by `authority-ledger`. Trusted context remains owned by `context-activation-authority`.

Each artifact binds to immutable upstream digests. A repository or scope change invalidates downstream evidence and requires a new governed sequence. Stores preserve prior latest records in deduplicated history rather than overwriting them.

## Failure Behavior

PBOS creates no artifact when:

- any required evidence field is absent;
- the changed-file classification is incomplete or overlapping;
- an identity is absent or requester and reviewer match;
- a decision is unsupported;
- a timestamp is malformed or expired;
- boundary identity or digest does not match;
- the operator declines interactive confirmation;
- trusted context prerequisites do not validate.

All failures remain visible as `BLOCKED` or `HOLD`.

## Mission Control

Mission Control presents human evidence separately from execution authority:

- `Human Evidence: COMPLETE | MISSING`
- `Change boundary: APPROVED | MISSING | INVALID`
- `Launch approval: ACTIVE | REJECTED | MISSING | INVALID`
- `Trusted context: ACTIVE | MISSING | INVALID`

Presentation does not alter state. `GO` remains derived from the complete governed readiness model.

## Security Considerations

CLI identity values are claims presented for authority validation; this adapter does not establish cryptographic identity assurance. Production identity-provider binding remains a separate operational prerequisite. Logs and command history may expose argument values, so interactive mode is preferred where shell-history disclosure is a concern.
