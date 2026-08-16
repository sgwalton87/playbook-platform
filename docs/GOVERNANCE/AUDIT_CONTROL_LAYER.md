# PBOS Audit Control Layer

## Purpose

The PBOS Audit Control Layer is a local engineering-control surface for the current Playbook audit, repair, and build process.

It reuses existing Playbook/PBOS systems instead of duplicating them:

- **Sentinel** — platform health and integrity signals.
- **Cartographer** — architecture/system mapping.
- **PBOS Status / Next** — engine health and governed execution sequencing.
- **Ledger / Archivist** — preserved engineering and release history.
- **Database Certification** — isolated local Supabase migration/security certification.
- **Vitest / Playwright / Next build** — implementation verification and acceptance evidence.

The Audit Control Layer does **not** become a canonical product database, role authority, or constitutional specification. It references the canonical artifacts and blocks engineering drift.

## Governing principles

The implementation follows the Playbook constitutional rules of:

- One Platform.
- Shared Services First.
- Single Source of Truth.
- Explicit dependencies.
- Security by Default and Least Privilege.
- Observability and auditability.
- Historical preservation and traceability.

## Command

```bash
npm run pbos:audit
```

The command evaluates the current repository against the audit manifest and writes a human-readable report to:

```text
docs/GOVERNANCE/AUDITS/PBOS_AUDIT_CONTROL_REPORT.md
```

CI runs the same command after lint and before the normal test/build gates.

## Current enforced invariants

The manifest currently blocks regressions in:

1. Free/local-only Supabase database certification.
2. Relationship, invitation, and profile authority SQL preflights.
3. Profile identity/onboarding RPC governance.
4. Brand Partner OS verification gating.
5. Canonical Admissions OS routing.
6. Ambiguous role alias escalation.
7. Sentinel availability.
8. Cartographer availability.
9. PBOS engine health/status availability.

The manifest is intentionally implementation-level. New checks may be added as the audit discovers new concrete failure modes, but checks must reference existing canonical ownership rather than invent a second source of truth.

## Evidence model

Audit Control produces derived engineering evidence. It does not overwrite canonical records.

The evidence flow is:

```text
Canonical specifications / source code / migrations
                    ↓
        PBOS Audit Control checks
                    ↓
        CI + Database Certification
                    ↓
         Human-readable audit evidence
                    ↓
       Human promotion / release decision
```

## Release boundary

A green Audit Control run is necessary but not sufficient for production promotion.

Production release remains separately gated by:

- exact-head application CI;
- isolated database certification;
- SQL security preflights;
- role-specific acceptance evidence;
- browser/accessibility verification where applicable;
- production schema/history reconciliation;
- explicit human release approval.

## Production safety

Audit Control must never require production credentials, link the Supabase production project, or perform production mutations.
