# Functional Wiring Backlog

## Purpose

Tracks canonical product workflows whose remaining work is functional, operational, or certification-related. Reconciled 2026-08-16 against `main` revision `2f87a0732532aace3902b363d0290bd7716427f1`, hosted Supabase reconciliation, and PRs #123–#137.

## Status rule

A route or visual shell is not functionally complete until persistence, permissions/RLS, integrations, recovery, accessibility, and exact-revision browser evidence are proven. Conversely, durable governed workflows that now exist must not remain mislabeled as “unwired” simply because final browser/release certification is still open.

## Current backlog

| Area | Status | Current truth / next connection |
| --- | --- | --- |
| Canonical 15-role registry and OS destinations | IMPLEMENTED / BROWSER CERT OPEN | All 15 onboarding roles derive from the canonical registry and have distinct destinations. `/university-os` is redirect-only compatibility to `/admissions-os`. Complete exact-revision role journey browser certification. |
| Profile identity / public disclosure | IMPLEMENTED / BROWSER CERT OPEN | `profiles` remains owner-only for direct reads; public Scholar/member identity uses bounded projections. Complete privacy/accessibility/browser acceptance. |
| Role verification review | IMPLEMENTED / BROWSER CERT OPEN | Governed Founder/Admin review exists for Coach, Educator, Counselor, District, Recruiting, Admissions, Employer, Brand Partner, Community Partner and Athlete Abroad readiness. Prove role-by-role request/review/denial/recovery journeys in browser. |
| Support invitations / relationships | IMPLEMENTED CORE / CERTIFICATION OPEN | Invitation creation/claim, verification-bound activation, revocation, security observability, and relationship identity are governed. Prove expiration/revocation/removal across downstream UI and complete remaining meaningful support actions. |
| Active Scholar Context | IMPLEMENTED / BROWSER CERT OPEN | Support-side users can select only Scholars linked by an active relationship; selection does not grant authority. Prove context switching and immediate revocation behavior end-to-end. |
| Network / Newsfeed | IMPLEMENTED CORE / CERTIFICATION OPEN | Bounded member directory/identity, durable post categories, media, reactions, comments and public news projection are wired. Complete pagination/moderation/share/safety and browser matrix. |
| Opportunity → Application | IMPLEMENTED CORE / CERTIFICATION OPEN | Explainable matches hand directly to the learner-owned Application Workspace. Complete documents/support/submission/outcome browser E2E. |
| Learning → Credentials / Badges / Rewards | IMPLEMENTED CORE / CERTIFICATION OPEN | Courses/modules/progress, reflection/acknowledgement completion, idempotent XP/coins, credentials, badges and transcript projection are durable. Complete browser/recovery and downstream intelligence refresh evidence. |
| Store / Reward Ledger | IMPLEMENTED CORE / OPERATIONS OPEN | Store reuses the canonical coin ledger and atomic idempotent redemption authority. Complete fulfillment, abuse controls, operational recovery and browser acceptance. |
| Events | IMPLEMENTED CORE / EXTENSIONS OPEN | Durable events, capacity-safe RSVP and verified attendance rewards are wired. Calendar/reminder/check-in/networking/outcome extensions remain open. |
| Mentorship Circles | IMPLEMENTED CORE / CERTIFICATION OPEN | Durable Mentor-owned circles, active/waitlist/leave lifecycle and bounded projections are wired. Complete browser/recovery and deeper session/outcome workflow. |
| Notifications / Attention Center | IMPLEMENTED CORE / CERTIFICATION OPEN | Trusted notification producers, outbox, acknowledgement, preferences, retry/finalization and Attention Center are wired. Complete delivery/recovery browser evidence and additional trusted producers only when upstream authority is trustworthy. |
| Messaging | PARTIAL / P0 CONNECTED JOURNEY | Governed messaging foundations exist; complete participant-scoped attachments, read state, safety/block/report, relationship-removal semantics, notification acknowledgement, recovery and browser E2E. |
| Academic | PARTIAL / P0 CONNECTED JOURNEY | Complete and prove Transcript → A-G/readiness/FAFSA/application → Compass guidance → human decision → durable outcome as one canonical pathway. |
| Recruiting | PARTIAL / P0 CONNECTED JOURNEY | Verified recruiting authority exists; complete and prove Scholar-Athlete Record → eligibility → targets/visits/offers → durable outcome. |
| Brand Partner / Employer workflows | IMPLEMENTED AUTHORITY / JOURNEY CERT OPEN | Verification and partner/employer authority foundations exist; prove campaign/opportunity/application lifecycle, compliance boundaries and browser outcomes. |
| District / Educator / Counselor / Coach workflows | IMPLEMENTED AUTHORITY / JOURNEY CERT OPEN | Verification, relationship identity and active Scholar context foundations exist. Complete role-specific meaningful actions and exact-revision browser denial/revocation evidence. |
| Athlete Abroad / Community Partner | IMPLEMENTED AUTHORITY / JOURNEY CERT OPEN | Readiness/service-scope review and governed identity foundations exist. Complete meaningful downstream action and browser evidence. |
| Compass / Intelligence | PARTIAL | Canonical Scholar AI/Experience projections exist. Complete measured explainability, provenance, confidence, human decision, lifecycle and outcome tracking across permission-scoped domains. |
| Auth leaked-password protection | EXTERNAL CONFIG GATE | Supabase advisor reports leaked-password protection disabled. Enable/verify through supported Auth settings; do not emulate this in SQL. |
| Supabase performance advisor debt | TECHNICAL DEBT / RELEASE REVIEW | Canonical-layer privilege/index/RLS issues discovered during production promotion were repaired. Older unindexed-FK, auth-initplan, duplicate-policy/index and unused-index warnings remain for deliberate triage without broadening access. |
| Outbound email | EXTERNAL GATE | Legacy Hostinger PR #88 is closed unmerged. Production SMTP/provider/template/delivery evidence remains unresolved and needs a fresh current-main implementation/certification path if required for launch. |
| Browser / accessibility / device certification | RELEASE BLOCKER | Exact-revision browser harness evidence for all 15 roles and connected workflows remains unproven in the current execution environment. Complete desktop/mobile/accessibility/recovery matrix before launch. |
| Observability / Analytics | RELEASE BLOCKER | Complete monitoring, error ownership, privacy-respecting analytics taxonomy, health signals and AI outcome observability before launch. |
| Compliance / privacy / launch operations | EXTERNAL / HUMAN RELEASE GATE | Data retention, legal/compliance, incident response, rollback, soft launch, release notes and independent human launch approval remain required. |

## Resolved historical wiring items

- Legacy deployed landing UI — resolved by PR #76.
- Canonical shell/route convergence — resolved across #77/#89 and later frontend-quality work.
- Unsafe public/cross-user profile reads — bounded by public/member projection work in #123/#127; direct `profiles` remains owner-only.
- Missing verification reviewer bridge — resolved by #125.
- Network/Feed hard-coded or unsafe identity behavior — converged by #127.
- Hard-coded Courses / fake reward minting / profile badge arrays — replaced by #128.
- Opportunity Marketplace lacking Apply handoff — resolved by #129.
- Static Events and Mentorship prototypes — replaced by #130.
- Browser-authored trusted notifications — closed by #133.
- Missing support-side selected Scholar authority model — resolved by #135 through relationship-bound Active Scholar Context.
- Hosted Learning/foundation privilege drift — reconciled and recorded by #136.
- 14-role/University-OS preview drift — resolved by #137; Product Review Center now derives from the 15-role registry.
