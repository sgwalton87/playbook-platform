# PBOS Observability Architecture 001

## Purpose

Define and audit the privacy-safe operational telemetry foundation required to detect, correlate, diagnose, and respond to Playbook Platform failures without treating repository implementation as deployed certification.

## Ownership

Platform Reliability owns runtime telemetry. Security and Privacy Engineering own redaction and access. Domain teams own feature signals. Release Engineering owns retained validation evidence.

## Last Updated

August 1, 2026

## Current State Audit

Before this mission, the application had a shallow readiness endpoint, four route error boundaries, isolated `console.error` calls, PBOS-internal execution telemetry, product analytics, and a Studio event monitor. These did not form an operational application telemetry system: there was no common event schema, request correlation, redaction contract, Next.js request-error hook, client exception capture, platform metric registry, alert catalog, operational ownership, or governed synthetic journey.

Failure surfaces identified during discovery include Supabase authentication and authorization, RLS and RPC operations, AI guidance, Resend delivery, inbound mail, transcript parsing, evidence verification, onboarding, portfolio sharing, Athlete/NIL commands, client rendering, navigation, and static/demo-backed user journeys. Ad hoc console messages sometimes include provider or database messages and are not certification-quality telemetry.

## Implemented Foundation

The canonical event contract emits JSON with schema version, timestamp, deployment environment, application version, severity, service, component, route, feature, operation, request and correlation identifiers, privacy-minimized actor classification, outcome, duration, error classification, dependency, retry count, and bounded metadata.

The foundation now includes:

- deterministic sensitive-key and token/email value redaction;
- query-free route normalization and dynamic identifier suppression;
- proxy-issued request and correlation identifiers propagated to application requests and responses;
- `AsyncLocalStorage` context support for server work;
- Next.js `onRequestError`, early client error/rejection instrumentation, and a global render-error boundary;
- same-origin, bounded client error ingestion that accepts classification rather than messages or stacks;
- API authentication, origin, quota, AI provider, communication provider, onboarding, and RPC telemetry;
- an allowlisted in-process health metric contract and secret-protected metrics snapshot;
- liveness and readiness endpoints carrying release identity and correlation;
- validated critical, high, and medium alert definitions;
- public and authenticated Scholar synthetic journey contracts.

## Target Architecture

```text
Browser and Synthetic Probe
  -> Edge correlation boundary
  -> Next.js render / route / action
  -> domain service
  -> Supabase query, RLS, or RPC
  -> external provider
  -> structured stdout / platform collector
  -> durable logs, metrics, and traces
  -> SLO dashboard and alert evaluator
  -> named responder and runbook
  -> retained incident and release evidence
```

The repository implements the collection contract and local validation boundary. A deployment platform must collect structured stdout, retain it under an approved policy, restrict operator access, derive rates/percentiles from counters and durations, and bind the declared alerts to the selected monitoring provider. The in-process metric snapshot is diagnostic per runtime instance and is not a durable cross-instance metrics backend.

## Security and Privacy

Telemetry must never include passwords, passcodes, bearer tokens, cookies, API or service-role keys, raw user identifiers, email/phone/address, private messages, AI prompts or responses, transcript content, student-protected data, financial records, or provider credentials. Error messages and stacks are not emitted by the canonical error capture path; only bounded classifications and non-sensitive digests are permitted. The metrics route returns 404 unless a distinct server-only observability secret is configured and supplied.

Correlation identifiers are operational random identifiers, not user identifiers. Route query strings are removed. Actor context is limited to role/type and authentication state when justified.

## Health and Alert Model

Liveness proves the process can answer. Readiness proves required public configuration and telemetry initialization; it does not claim database or provider availability. Synthetic probes and dependency metrics supply those external signals. Alert contracts cover application and database availability, authentication and security outages, error surges, API degradation, communication failures, onboarding failures, abnormal usage, workflow failures, and Web Vitals degradation.

## Implementation and Certification Plan

1. Validate the event, redaction, correlation, trace, metric, alert, and synthetic contracts locally.
2. Execute public browser synthetic monitoring and retain trace/results.
3. Configure a production telemetry collector, release identity, retention, access controls, and redaction review.
4. Bind alert definitions to provider queries and destinations; execute test alerts for each severity.
5. Seed a non-production Scholar and execute the authenticated Dashboard → Record → Portfolio synthetic.
6. Exercise database/provider failures and prove correlation from browser through dependency outcome.
7. Retain dashboard exports, alert receipts, synthetic traces, incident ownership acknowledgment, and privacy/security approval.

## Remaining Risks

- No deployed collector, durable metric backend, trace backend, dashboard, paging integration, or retention proof is available in the repository environment.
- No authenticated Scholar synthetic was executed without seeded credentials.
- Alert definitions are validated but not bound to a hosted evaluator and no production test alert has fired.
- Some legacy client and API surfaces still use ad hoc console logging and require migration to the canonical boundary.
- Database query instrumentation is present only at selected shared/RPC boundaries, not every Supabase operation.
- Operational privacy, on-call acknowledgment, and provider access review require accountable human approval.

Therefore `CONTROL:OBSERVABILITY` advances from **BLOCKED** to **PARTIAL**. It must not be marked `IMPLEMENTED` or production-certified until deployed evidence closes these risks.

## Related Documents

- [Operational Ownership](./PBOS_OPERATIONAL_OWNERSHIP_001.md)
- [Recovery Runbook](./RECOVERY_RUNBOOK.md)
- [Public Beta Dependency Audit](../GOVERNANCE/AUDITS/PUBLIC_BETA_DEPENDENCY_AUDIT.md)
- [Evidence Package](../../pbos/evidence/observability/README.md)
