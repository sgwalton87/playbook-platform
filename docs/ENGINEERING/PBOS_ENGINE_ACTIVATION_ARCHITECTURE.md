# PBOS Engine Activation Architecture

**Purpose:** Define the sole governed mechanism through which a registered domain engine may become active.

**Owner:** Playbook OS Engineering

**Last Updated:** July 30, 2026

**Related Documents:** [PBOS Engine Admission Architecture](./PBOS_ENGINE_ADMISSION_ARCHITECTURE.md), [PBOS Capability Execution Lifecycle Binding](./PBOS_CAPABILITY_EXECUTION_LIFECYCLE_BINDING.md)

## Decision

The Kernel owns engine activation. Registration, entitlement, capability admission, engine admission, and execution eligibility are necessary but none independently activates an engine.

## Activation Flow

```text
Engine Registration
-> Current Issuer and Entitlement Trust
-> Capability Admission
-> Engine Admission
-> Execution Lifecycle Binding
-> Production Certification
-> Dependency, Security, and Evidence Validation
-> Kernel Activation Decision
```

## Contract

`EngineActivationRequest` binds engine, capability, owner, version, dependencies, security, evidence, Kernel admission, lifecycle, organization, tenant, production certification, timestamp, and digest.

## Authority

`KernelEngineActivationAuthority` is the only activation decision owner. Engines cannot self-invoke, self-authorize, or self-certify. A decision contains evidence and findings but does not dispatch code.

## Fail-Closed Rules

Activation is blocked by stale or invalid trust, invalid entitlement, missing production certification, mismatched capability or engine identity, ineligible execution binding, unavailable dependency, missing security control, or absent evidence.

## Current State

The framework is operational. Production activation is withheld because PBOS Capability Production Certification 001 is blocked.

