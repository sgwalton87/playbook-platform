# Canonical Platform Data Architecture

## Purpose

Establish the stable conceptual data boundaries used to reconcile physical Supabase tables without destructive schema renames or fabricated migration certification.

## Ownership

Data Architecture and Security owns this contract. Domain engineering owns explicit mappings. Database Operations owns migration, backup, restore, and production evidence.

## Last Updated

August 1, 2026

## Canonical Entities

| Entity | Current physical anchors | Required relationship |
|---|---|---|
| Person | `auth.users`, `profiles` | One authenticated identity may hold separately governed roles |
| Role | `profiles.role`, `role_profiles` | Assignments reference Person and retain assignment authority |
| Scholar Record | `scholar_records`, achievements, evidence, journey data | Owned by Person; supporter access requires active relationship |
| Athlete Record | `athlete_profiles` and athlete/NIL tables | Extends a Person and Scholar Record; never creates a second identity |
| Opportunity | `opportunities`, applications, recruiting and NIL pipelines | Publisher/organization and applicant relationships are explicit |
| Relationship Graph | `support_relationships`, institutional and athlete relationships | Actor, subject, scope, consent, status, and expiry are explicit |
| Evidence | `evidence_items`, verification requests and audit | Provenance and verification decisions are append-audited |
| Portfolio | portfolio records, packets, shares, snapshots | Scholar-owned source; external access is allowlisted, expiring, and revocable |

## Integrity Rules

Physical tables may implement a canonical entity across multiple bounded tables. New work must map rows intentionally rather than spread untyped Supabase shapes. Every exposed table requires RLS or an explicit deny-all disposition, indexed relationship/status lookups, foreign-key integrity, retention ownership, and positive and negative authorization tests. Structural SQL inspection is not live RLS certification.

Schema consolidation is reversible and migration-driven. A duplicate model may not be deleted until reads, writes, ownership, retention, and rollback have been traced and production data has been reconciled.

## Related Documents

- [Database Handbook](../DATABASE.md)
- [Platform Registry Architecture](./PLATFORM_REGISTRY_ARCHITECTURE.md)
- [Authorization Architecture](./AUTHORIZATION_ARCHITECTURE.md)
