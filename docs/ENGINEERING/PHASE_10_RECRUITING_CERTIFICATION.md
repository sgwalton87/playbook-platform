# Phase 10 Recruiting Certification

## Purpose

Certify the Phase 10 Recruiting tracker against current implementation truth while preserving Playbook's constitutional requirements for shared services, canonical ownership, living evidence, security, and human decision authority.

## Canonical capability map

| Tracker capability | Canonical experience | Canonical authority |
| --- | --- | --- |
| Athlete Profile | `/recruiting/profile` | `athlete_profiles` |
| Film | `/recruiting/profile` | athlete profile `highlight_url` plus evidence where applicable |
| Measurements | `/recruiting/evidence` | `athlete_evidence` category `measurement` |
| Statistics | `/recruiting/evidence` | `athlete_evidence` category `statistic` |
| Eligibility | `/recruiting/eligibility` | source-backed eligibility rulesets + Scholar evidence |
| Coach Connections | `/recruiting/connections` | verified support directory + governed invitations/relationships |
| Recruiter Search | `/recruiting/connections` | same verified recruiting directory |
| College Targets | `/recruiting` | `recruiting_targets` pipeline |
| Visits | `/recruiting/visits` | `recruiting_visits` linked to targets |
| Offers | `/recruiting/offers` | `recruiting_offers` linked to target/evidence history |
| Recruiting Timeline | `/recruiting/timeline` | `recruiting_target_events` |
| NIL Readiness | `/recruiting/nil` | governed `nil_deals` lifecycle + readiness engine |

## Non-duplication decisions

Athlete Profile and Film share the athlete profile because the primary highlight link is part of the athlete's recruiting identity. Additional film may remain evidence rather than creating a separate canonical athlete identity record.

Measurements and Statistics are evidence categories in the same athlete-evidence service. This preserves provenance and verification state rather than creating separate measurement and statistics databases.

Coach Connections and Recruiter Search share the verified recruiting directory. Verification establishes identity; it does not grant Scholar-record access. Relationship creation remains explicit and permission-safe.

College Targets are the Recruiting Command Center pipeline at `/recruiting`; no second target-list implementation is required.

Advertised `/recruiting/targets` and `/recruiting/people` paths are compatibility aliases that redirect to the canonical implementations. They contain no parallel data or UI authority.

Visits, Offers, and Timeline reference the canonical recruiting target lineage so the recruiting journey remains traceable.

NIL Readiness tracks deal lifecycle, contract/disclosure/payment state, and readiness without implying legal, school, association, or financial approval.

## Release gate

Phase 10 is certifiable only when:

- dependency audit passes;
- lint passes without application-owned warnings;
- PBOS audit passes;
- all unit/regression tests pass;
- production TypeScript/build passes;
- all advertised Recruiting routes resolve;
- the Phase 10 convergence suite proves every tracker capability maps to a canonical implementation rather than a duplicate service.
