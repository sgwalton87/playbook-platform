# PBOS Autonomous Operator Loop Architecture

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [Autonomous Readiness Gate](./PBOS_AUTONOMOUS_READINESS_GATE_ARCHITECTURE.md)

## Loop

Observe -> Understand -> Plan -> Assess -> Act -> Verify -> Learn -> Advance.

Each phase delegates to an existing authority. Observation consumes repository context. Understanding consumes system intelligence. Planning consumes the constitutional planner. Assessment consumes mission alignment and manifest risk. Acting requires execution admission. Verification consumes validators. Learning consumes evidence and history. Advancement requires lifecycle authority.

## Determinism

Identical context, manifest, planner, lifecycle, authority, and time inputs produce the same recommendation and risk route. Every result includes correlated evidence digests.

## Failure Behavior

The loop fails closed on invalid context, mission conflict, missing package, unavailable agent, absent authority, failed validation, or missing evidence. A failed phase prevents later phases and cannot mutate lifecycle state.

