# Playbook Product Feature Registry

## Purpose

This registry identifies production features, their canonical authority, implementation layers, and evidence state. A feature marked Testing has executable foundations but is not production-certified until its named runtime and release evidence passes.

## Ownership

Owned by Playbook Product and Playbook OS Engineering under [PPS-3001](../PPS/30_PRODUCT_ARCHITECTURE/PPS-3001_FEATURE_REGISTRY_STANDARD.md).

## Last Updated

August 1, 2026

## Related Documents

- [Scholar-Athlete Operating System](../PPS/05_OPERATING_SYSTEMS/PPS-502_SCHOLAR_ATHLETE_OPERATING_SYSTEM.md)
- [NIL Operating System](../PPS/06_JOURNEY_OPERATING_SYSTEMS/PPS-607_NIL_OPERATING_SYSTEM.md)
- [Athlete Profile Application](../CONSTITUTION/VOLUME_32_PLATFORM_APPLICATION_ARCHITECTURE/ATHLETICS/PPS-3251_ATHLETE_PROFILE_APPLICATION.md)
- [Recruiting Application](../CONSTITUTION/VOLUME_32_PLATFORM_APPLICATION_ARCHITECTURE/ATHLETICS/PPS-3250_RECRUITING_APPLICATION.md)
- [NIL Application](../CONSTITUTION/VOLUME_32_PLATFORM_APPLICATION_ARCHITECTURE/ATHLETICS/PPS-3253_NIL_APPLICATION.md)
- [Master checklist](../MASTER_CHECKLIST.md)

## Registered Athlete Network Features

| Feature ID | Canonical outcome | Frontend | Backend | Database | Permissions | Tests | Evidence state |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ATH-PROFILE-001 | Athlete owns a complete athletic identity, audience decision, readiness gaps, and provenance without self-verifying facts. | `/scholar-athlete-os` Profile | `PUT /api/athlete/profile` | `athlete_profiles` | Scholar-Athlete role + owner RLS | Contract, UI, migration | Testing |
| ATH-RECRUITING-001 | Athlete records programs, contacts, stages, next actions, and relationship-direction activity without guaranteed outcomes. | `/scholar-athlete-os` Recruiting | `POST /api/athlete/recruiting` | `recruiting_targets`, `athlete_recruiting_activities` | Scholar-Athlete role + owner RLS + idempotency | Contract, UI, migration | Testing |
| ATH-NIL-PROFILE-001 | Athlete controls brand identity, partnership interests, discovery visibility, and explicit marketplace consent. | `/scholar-athlete-os` NIL | `PUT /api/athlete/nil-profile` | `athlete_nil_profiles` | Scholar-Athlete role + owner RLS + minor safeguard | Contract, UI, migration | Testing |
| ATH-NIL-PIPELINE-001 | Athlete records NIL leads and advances only through a deterministic, audited lifecycle. | `/scholar-athlete-os` NIL pipeline | `POST/PATCH /api/athlete/nil` | `nil_deals`, `athlete_command_receipts` | Owner RLS + governed RPC + idempotency | Contract, lifecycle, migration | Testing |
| ATH-NIL-COMPLIANCE-001 | Athlete submits agreement/disclosure evidence and an authorized human issues a reasoned compliance decision. | Athlete submission UI; `/admin/nil-compliance` review queue | `submit_nil_compliance`, `review_nil_compliance` | `nil_compliance_audit`, `admin_audit_log` | Owner submission + administrator decision | API, UI, migration contract | Testing |
| ATH-NIL-DISCOVERY-001 | Registered brands receive only a consented, allowlisted athlete projection; restricted demographics remain private. | Brand discovery UI pending | `GET /api/athlete/discovery` | Security-definer projection over athlete/NIL profiles | Active registered brand partner + marketplace consent + minor guardian consent | API/migration contract | Partial |
| ATH-NIL-DELIVERABLES-001 | Athlete and authorized partners track bounded deliverables with evidence and lifecycle state. | UI pending | Command boundary pending | `nil_deal_deliverables` | Owner RLS foundation | Migration contract | Partial |

## Registration Rule

New Athlete Network features must extend this registry rather than create a shadow feature list. “Testing” and “Partial” are not release certification: live migrations, cross-user RLS negatives, authenticated browser journeys, accessibility, privacy approval, monitoring, and rollback evidence remain mandatory.
