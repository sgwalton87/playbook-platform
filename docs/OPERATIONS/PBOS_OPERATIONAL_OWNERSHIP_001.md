# PBOS Operational Ownership 001

## Purpose

Define accountable ownership, escalation, severity, and response expectations for Playbook Platform operational signals and incidents.

## Ownership

The designated Release Manager maintains this contract. Named team functions remain provisional until accountable people acknowledge the production on-call schedule.

## Last Updated

August 1, 2026

## System Ownership

| System | Primary owner | Escalation owner |
|---|---|---|
| Web runtime, API, deployment | Platform Reliability | Engineering Incident Commander |
| Supabase schema, RLS, recovery | Database Operations | Security Incident Response |
| Authentication and roles | Identity and Access | Security Incident Response |
| Scholar and Role OS journeys | Domain Operations | Product Incident Lead |
| Email and notifications | Communications Operations | Platform Reliability |
| AI providers and provenance | AI Operations | AI Governance and Privacy |
| Athlete/NIL compliance | Athlete Platform Operations | Compliance and Security |
| Privacy and youth safety | Privacy Operations | Legal and Security |

## Critical SEV-1

Examples include application or database unavailability, authentication outage, confirmed unauthorized access, privilege escalation, material youth-data exposure, or extreme platform-wide error increase.

- Acknowledge within 10 minutes during an operated beta window.
- Assign one incident commander and one communications owner.
- Contain unsafe writes or exposure immediately through governed controls.
- Provide status updates at least every 30 minutes.
- Preserve logs, traces, deployment identity, database state, and decision evidence.
- Require Security/Privacy participation for access or data incidents.

## High SEV-2

Examples include sustained API degradation, critical journey failure, significant email/notification failure, or onboarding failure spikes without confirmed data exposure.

- Acknowledge within 30 minutes during an operated beta window.
- Assign an operational owner and publish an internal status.
- Update at least hourly until mitigation.
- Open a reviewed corrective action before closure.

## Medium SEV-3

Examples include abnormal usage, isolated workflow failures, non-critical provider degradation, or performance-budget violations.

- Triage within one business day.
- Assign a domain owner and target milestone.
- Escalate immediately if scope, safety, or data impact increases.

## Escalation Path

Signal owner → Platform Reliability → Incident Commander → Security/Privacy/Legal or Product lead as impact requires → Release authority. The incident commander, not automation, decides user communication, restoration, rollback, and closure. A confirmed safety or privacy risk overrides ordinary feature availability.

## Operational Responsibilities

- Platform Reliability maintains collection, dashboards, alerts, synthetics, and release correlation.
- Database Operations maintains backup/restore evidence and query/RPC health.
- Security validates redaction, access, secrets, authorization alerts, and incident preservation.
- Domain Operations define meaningful success/failure metrics and investigate workflow regressions.
- Release Engineering archives validation, alert tests, synthetic traces, and go/no-go evidence.
- Product/Support operate cohort communication, feedback, and affected-user follow-up.

## Certification Limitation

This document establishes functional ownership but is not an on-call acknowledgment. Production certification requires named responders, contact paths stored outside the public repository, a scheduled coverage record, and an executed alert/escalation exercise.

## Related Documents

- [Observability Architecture](./PBOS_OBSERVABILITY_ARCHITECTURE_001.md)
- [Recovery Runbook](./RECOVERY_RUNBOOK.md)
- [Release Process](../RELEASE_PROCESS.md)
