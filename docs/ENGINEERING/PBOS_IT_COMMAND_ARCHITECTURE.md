# PBOS It Command Architecture

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [Founder Operating Model](./PBOS_FOUNDER_OPERATING_MODEL.md)

## Purpose

`npm run it` is the canonical founder-facing router for PBOS. It presents mission state, evaluates readiness, identifies the next governed play, routes risk, and explains the next authority boundary.

## Authority

The command owns presentation and coordination only. Repository context, planning, manifest interpretation, agents, authorization, execution, validation, evidence, and lifecycle advancement remain owned by their existing PBOS subsystems.

## Flow

Founder command -> repository observation -> trusted-context readiness -> mission alignment -> constitutional planning -> manifest risk routing -> authority check -> execution admission.

The command stops at the first unmet predicate. It does not infer approval, manufacture evidence, repair runtime state, or create an alternate execution path.

## Outcomes

- `READY`: every prerequisite including execution authority is available.
- `NOT_READY`: expected prerequisites are incomplete and actionable guidance is available.
- `BLOCKED`: identity, mission, security, architecture, or governance evidence is invalid.

Current implementation remains `NOT_READY` when an execution package exists but no canonical authority record can be presented.

