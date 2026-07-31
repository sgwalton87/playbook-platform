# PBOS Execution Identity Architecture

## Purpose

This architecture defines the canonical identity boundary between human execution authority, certified providers, registered agents, task assignment, admission, and dispatch. The kernel remains the sole execution authority. Providers cannot authorize themselves or substitute an executable identity.

## Provider Identity Model

Every `ProviderContract` declares a unique `provider_contract_id`, `provider_id`, `executable_agent_id`, version, certified trust state, capabilities, and evidence contract. Registration rejects incomplete, uncertified, or duplicate provider identities.

Provider identity and agent identity are intentionally distinct concepts. A provider supplies controlled execution; an agent is the registered identity allowed to receive a task. Their relationship is explicit in the certified provider contract and never inferred from a partial name.

## Agent Identity Model

The agent registry owns executable identities, versions, capabilities, permissions, registration state, and trust level. Provider resolution permits exactly one registered agent matching the contract's `executable_agent_id`. Zero matches fail closed. Multiple matches are prohibited by registry uniqueness and fail resolution if encountered at an external boundary.

`ExecutionIdentityResolution` binds:

- provider and provider-contract identities;
- agent identity and version;
- certified capability set;
- evidence contract;
- creation time and artifact digest.

Temporal registration metadata is evidence about a registry snapshot, not the durable identity key. Authority therefore compares the stable agent identifier while admission validates the complete current provider resolution.

## Certification Model

Only a provider contract with `trust_level: CERTIFIED` and `execution_method: CONTROLLED_DELEGATE` can register or resolve. Certification does not grant execution authority. It proves provider eligibility; package-bound human authorization grants authority.

## Assignment Binding

Every execution task records the execution authorization ID, provider ID, provider-contract ID, agent ID, package ID and digest-derived package relationship, approved scope, and evidence requirements. Assignment fails when any supplied identity differs from the resolved chain.

## Execution Admission

Admission validates trusted context, package certification, human approval, execution authority, provider resolution, agent registration, assignment, capabilities, scope, expiration, and all identity correlations. The runner repeats authorization, provider-contract, and agent checks before dispatch.

## Security Boundaries

- Providers never issue authorization or certification.
- Agent selection cannot use partial names or implicit fallback.
- Unknown, uncertified, missing, duplicated, stale, or mismatched identities block execution.
- Authorization and assignments are digest-bound and package-bound.
- Provider replacement requires a new contract, resolution, authorization, and assignment.
- Runtime artifacts remain owned by their existing canonical stores.

## Failure Behavior

Identity ambiguity produces `BLOCKED`; PBOS creates no assignment and dispatches no provider. A stale authorization created under an earlier provider contract must be replaced through governed human approval. Runtime JSON must never be manually repaired.
