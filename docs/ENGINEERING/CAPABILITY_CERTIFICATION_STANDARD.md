# PBOS capability certification standard — 2026-11-18

Source inventory: `lib/platform/capabilityMap.ts` + `lib/platform/capabilityCatalog.ts`. Source UI: `/explore`.

## Why
The Explore page currently maps 107 non-Founder capabilities: 68 routes available, 13 built-in behaviors, eight in audit and 18 planned. These counts describe discoverability and architectural intent, **not proven functional outcomes**. In particular, a user may be approved, emailed and able to enter a page while its backing RLS/permissions fail.

## Separate ledgers
`lib/platform/capabilityCertification.ts` derives stable IDs and a fail-closed audit inventory from the Canon catalog; it defaults every entry to *not tested*, regardless of route status. No evidence is invented or copied from unrelated CI runs. Founder/operator capabilities are included only when explicitly requested.

## Proof contract
For a test to be certified, require: production or isolated-staging environment; tested commit SHA; auditable evidence URL; owner or authorized role journey; negative denied-user journey; persisted/readback confirmation; reviewer identity; date/time. Tests must also establish network dependency, redirect/login/session, failure feedback, accessibility/mobile behavior and rollback, where applicable. A missing required proof yields blocked, not passed.

## Release work
Issue #314 is the canonical 107-item closure queue. Initially prioritize:
1. Auth/PKCE/role selection, onboarding/autosave, sign out/return and each of 15 role OS routes
2. Postapproval access, partner branding, applicant consent and outbound messages
3. Scholar record, academic/transcript, recruiting/NIL and opportunity/application lifecycle
4. Feed, connections, support, messaging, notification, course/events/reward persistence
5. Planned features with explicit user stories, proper backing services and authorized testers

For each capability, PBOS V2 selects one issue, reproduces failure, proposes scoped patch in branch, tests role-negative and persistence paths, opens PR, returns preview, records operator sign-off and only then promotes to Production. PPS-005, PPS-006, PPS-011, PPS-012 and PPS-014 apply. A passing unit test of route existence is never sufficient for operational certification.

## Current status
Ledger framework implemented but not a proof that all 107 capabilities function. Do not mark capabilities green automatically or activate unattended production changes.
