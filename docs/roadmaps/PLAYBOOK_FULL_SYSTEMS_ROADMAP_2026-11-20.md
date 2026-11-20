# Playbook Platform — Full Systems Roadmap (v1.0, 2026-11-20)

**Authority:** Canonical PPS-000–015; project capability catalog and role registry; current-source audit; PBOS-RCC-001.
**Source-of-record PDF:** [Full 15-page roadmap on Google Drive](https://drive.google.com/file/d/1oOy-6TVPt10bCMmNjAiCdE5e394EteD4/view?usp=drivesdk).
**Status:** DRAFT / NOT RELEASE CERTIFIED. This repository companion maintains executable mapping and roadmap links; the PDF is the original formatted document. No new production authority is granted.

## 1. Vision and classifications
One connected platform, fifteen distinct constituency experiences, one authoritative identity/record/relationship graph. SOURCE means route/component exists, not necessarily working; DESIGN means proposed organization; OPEN means release certification outstanding. Never count a button, page, or route as a completed feature without governed read/write, readback, negative access test, recovery and evidence.

## 2. Architecture
Experience (responsive pages) → fifteen role OS interfaces → shared Identity, Record, Opportunity, Learning, Events, Messaging, Network, Rewards, Media and Notification services; intelligence derives explainable guidance from permitted canonical records; Supabase RLS, PBOS signed authority, GitHub change history, Vercel deployment and PPS governance guard the whole system. Verification alone grants no Scholar access.

## 3. Universal navigation contract
Desktop primary destinations: Home (registered role OS), Work (owned or permitted task/record queue), Explore (catalogs and discovery), Inbox (messages and attention), Me (identity, privacy and preferences). Role-specific modules are contextual sub-navigation; on mobile retain five primary destinations with an accessible expanded menu. Breadcrumb → contextual current task → authorized state → primary transaction → persistence receipt → next action. Preserve redirects from legacy routes without changing permissions.

## 4. All fifteen constituency home destinations

| # | Role | Existing destination | Proposed first-class modules | First meaningful persistent action |
|---|---|---|---|---|
| 1 | Scholar | `/dashboard` | Record; Academics; Compass; Applications; Learning; Support | Achievement/evidence → application |
| 2 | Scholar-Athlete | `/scholar-athlete-os` | Athlete Record; Eligibility; Recruiting; NIL; Academics; Support | Target → Visit → Timeline |
| 3 | Transition-Aged Youth | `/transition-youth-os` | My Plan; Education; Career; Life Skills; Opportunities; Trusted Support | Goal → Milestone → Outcome |
| 4 | Parent / Guardian | `/family-os` | My Scholars; Consent; Academic Progress; Support Tasks; Messages; Resources | Claim consented relationship → act → revoke |
| 5 | Mentor | `/mentor-os` | My Mentees; Check-ins; Circles; Shared Goals; Resources; Messages | Validated relationship → check-in |
| 6 | Teacher / Educator | `/educator-os` | My Students; Academic Support; Interventions; Assignments; Courses; Messages | Authorized student intervention |
| 7 | High School Counselor | `/counselor-os` | Caseload; Graduation; Readiness; Applications; Recommendations; Messages | Read academic gap → saved counseling action |
| 8 | High School Coach | `/coach-os` | My Athletes; Eligibility; Development; Recruiting; Recommendations; Team Messages | Roster-scoped athlete action |
| 9 | College Coach / Recruiter | `/recruiting-os` | Program; Discovery; Prospects; Pipeline; Visits; Communication | Verified permitted contact intent |
| 10 | College Admissions | `/admissions-os` | Institution; Programs; Applications; Review; Decisions; Communication | Consented application review |
| 11 | Brand Partner | `/brand-partner-os` | Organization; Campaigns; Opportunities; Applicants; Compliance; Insights | Draft → independent publication review |
| 12 | Employer / Workforce | `/employer-os` | Organization; Listings; Applicants; Internships; Pipeline; Messages | Approved opportunity → consented applicant |
| 13 | District / School Admin | `/district-os` | Institutions; School Overview; Programs; Cohorts; Outcomes; Governance | Institution-scoped program action |
| 14 | Athlete Abroad | `/athlete-abroad-os` | Global Profile; Readiness; Destinations; Contracts; Living Abroad; Alumni; Events | Destination milestone → application |
| 15 | Community Partner | `/community-partner-os` | Organization; Programs; Resources; Referrals; Events; Impact; Communication | Verified-scope referral/program |

Separately provisioned Founder `/founder` and Platform Admin `/admin` are **not** public onboarding roles. Repository registry has 17 OS destinations total. PPS-004 taxonomy extension mapping remains an explicit governance task.

## 5. Canonical page hierarchy

| Owner | Existing routes | Page-to-page behavior |
|---|---|---|
| Entry/identity | `/`, `/login`, `/role-select`, `/start`, `/check-email`, `/auth/callback`, `/reset-password` | Public discovery → verified identity → role and setup → authorized OS |
| Role home | All fifteen OS routes above | Real alerts, data, next task and durable active work—not link-only menus |
| Private Record | `/profile`, `/record`, `/profile/privacy`, `/transcript`, `/albums` | Owner-only editing, evidence and consent |
| Public projections | `/u/[username]`, `/portfolio/[shareId]` | Revocable, scoped, no raw cross-profile reads |
| Academic/Compass | `/academic-readiness`, `/compass`, `/journey` | Source evidence → explanation → human decision → saved outcome |
| Opportunity/Application | `/opportunities`, `/opportunity-toolkit`, `/application-workspaces` | Marketplace → private application → consented submission |
| Recruiting/NIL | `/recruiting/targets`, `/recruiting/visits`, `/recruiting/offers`, `/recruiting/nil` | Athlete-owned evidence and relationship-scoped decisions |
| Community | `/feed`, `/connections`, `/support-network`, `/mentor-connect`, `/messages` | Discovery → consent → relationship → communication |
| Learning | `/courses`, `/courses/[slug]`, `/certificates`, `/badges` | Module → progress → verification → rewards |
| Events | `/events`, `/events/replays`, `/events/reminders` | RSVP → check-in → verified attendance → follow-up |
| Rewards | `/reward-economy`, `/store`, `/leaderboard` | Authorized earned ledger → consent-safe display/redemption; **no fictional rankings** |
| Operators | `/admin`, `/founder`, `/studio` | Human review → audit → monitoring → gated release |

## 6. Connected cross-role journeys
1. **Scholar evidence → opportunity:** sign up → Record → achievement → readiness → Compass → opportunity → application → permitted supporter → submission/outcome.
2. **Athlete recruiting:** profile → eligibility → targets → verified recruiter discovery → visit/offer → timeline; NIL disclosure independently approved.
3. **Family and supporters:** invitation → consent → relationship → scoped Scholar Context → action/message → outcome → revocation and immediate denial.
4. **Institution/partner:** business evidence → independent review → approved scope → draft → publication review → consented applicant → receipt.
5. **Learning/events:** catalog → module or RSVP → verified completion/attendance → credential or reward → updated Record.
6. **Athlete Abroad:** jurisdiction readiness → destination → course → application → docs/contract human review → travel milestone → alumni.
7. **TAY:** learner-owned goals → education/career/housing/life skills → permitted support → milestones → outcome.

## 7. Canonical 107-capability catalog

| Group | Count | Features |
|---|---:|---|
| Account & Getting Started | 11 | Sign in & account access; Email verification; CAPTCHA protection; PKCE callback security; Remember Me; Session timeout; Password recovery; Role selection; Onboarding; Onboarding autosave; Dynamic user agreement |
| My Playbook Record | 9 | Private profile; Profile privacy; Playbook Record; Transcript; Albums & media; Badges; Certificates; Public timeline; Cover photo & gallery |
| Academics & College Readiness | 8 | Academic readiness; Transcript intelligence; Application workspace; A-G tracker; FAFSA tracker; College search; Dream & top schools; Application deadlines |
| Opportunities & Applications | 7 | Opportunity marketplace; Application workspace; Scholarships; Internships & jobs; Mentorship opportunities; Opportunity tracking; Applicant consent sharing |
| Recruiting & NIL | 12 | Scholar-Athlete OS; Athlete profile & film; Athletic evidence; Eligibility; College targets; Visits; Offers; Recruiting timeline; Coach & recruiter discovery; NIL readiness; NIL media kit; NIL deals |
| Community & Relationships | 8 | Community feed; Connections; Support network; Mentor Connect; Messaging; Notifications; Mutual connections; Group messaging |
| Learning & Growth | 7 | Course library; Course detail & modules; Community Safety course; Athletes Abroad course; Progress tracking; Reflections; Quizzes & assessments |
| Events & Experiences | 9 | Browse events; Event detail; RSVP; Calendar integration; QR check-in; Event networking; Replay library; Event reminders; Summit events |
| Rewards & Recognition | 5 | Reward economy; Badges; Certificates; XP; Coins |
| Athletes Abroad | 8 | Athlete Abroad OS; Global readiness course; Go Abroad pathway; Living Abroad; Life After Sport; Country & sport channels; Global locker room; Summit & meetups |
| Role Operating Systems | 14 | Scholar OS; Scholar-Athlete OS; Family OS; Mentor OS; Educator OS; Counselor OS; Coach OS; Recruiting OS; Admissions OS; Brand Partner OS; Employer OS; District OS; Community Partner OS; Transition Youth OS |
| Platform Foundations | 9 | Authentication & PKCE; Remember Me & session lifecycle; Session timeout; Role authorization; Privacy & least privilege; Shared messaging; Shared notifications; Shared Events; Shared Courses |

Counts: **11+9+8+7+12+8+7+9+5+8+14+9 = 107**. Catalog statuses: **68 route-available, 13 built-in, 8 in-audit, 18 planned**; none proves release certification. The Founder/Operator catalog of 14 entries is separate from 107.

## 8. Role workspace anatomy
Each of the fifteen role rows in Section 4 must have: canonical home, role-specific navigation; verified key metrics; priority work queue; source-backed detail page; editable action surface; audit/readback receipt; restricted/no-data/error states; explanatory cross-role handoff; logout/recovery. Build scope-specific views over canonical services, not duplicated data stores.

## 9. Shared engine boundaries
Canonical ownership: Identity/roles/verification; Scholar Record and bounded public projections; invitation/relationship and Active Scholar Context; Opportunities/Application; Recruiting/NIL; Learning/credentials; Events/attendance; Messaging/Notifications; Rewards/Store; Compass evidence and human outcomes. A page must record `sourceOwner`, source identity, authorization predicate, persistent mutation and readback route. Shared dependencies are not permissions.

## 10. Intelligence, trust, experience and governance
Every prediction/recommendation shows evidence, freshness, uncertainty and human control. Personal information remains owner/consent/scope-bound. Each page handles loading, pending, approved, declined, restricted, empty, error, retry and real success states. Keyboard/mobile navigation, WCAG, audit and privacy tests are release requirements. PBOS may prepare PRs and evidence but never mint live permissions or self-authorize production deployment.

## 11. Dependency-ordered delivery waves

| Wave | Priority | Work | Proof gate |
|---|---|---|---|
| 0 | P0 | Eliminate fictional leaderboard; simulated support message state; demo recommender approvals | No false identities, phantom sends or approvals |
| 1 | P0 | Canonical role navigation, shell, identity, onboarding and authorized redirects | 15 role routing and accessible navigation |
| 2 | P0/P1 | Real role dashboards, verified counts, work queues, one durable role action | 15 task lifecycle paths and readback |
| 3 | P1 | Scholar Record → Compass → applications and consented support | Cross-role positive/negative/revocation tests |
| 4 | P1 | Recruiting, institutions, Brand/Employer and applicant consent | Two-sided governed lifecycle receipts |
| 5 | P1/P2 | Learning, messaging, community, events, rewards, safe leaderboard | Idempotent rewards, RLS, no invented results |
| 6 | P1/P2 | Global athlete, TAY transition, scoped referrals, evidence-backed intelligence | Real durable specialized outcomes |
| 7 | Release | 107 exact-SHA capability certifications, signed PBOS, hosted E2E, security, rollback and human decision | 107 statuses with evidence, launch-critical blockers resolved |

PBOS Core historical Genesis recovery is **separate**: verified offline copy only until explicit approval for original Mac changes.

## 12. Per-capability proof and release gates
Capture ID, exact route/component, source owner, commit/schema revision, authenticated owner action, denied other-role or expired authority case, authoritative mutation/receipt, refreshed readback, accessible/mobile/error/retry evidence, audit trace, rollback and independent reviewer. Classify PASS / FAIL / BLOCKED / NOT_TESTED; no silent PASS for link-only or green CI. Keep production release HOLD until separately authorized.

## 13. Confirmed repair tickets
- **DYN-001 P0:** fabricated leaderboard; remove invented standings; build consent-safe genuine ranking.
- **DYN-002 P2 (corrected after route trace):** `/support-messages` already redirects to the governed `/messages` inbox. Old demo-only support component remains dormant; retire after import verification. Preserve canonical inbox and certify actual message/RLS journeys separately.
- **DYN-003 P0:** recommender URL ignored, local approve/revise; authenticated durable decision.
- **DYN-004 P1:** shared dashboards Not connected; real authorized aggregates and tasks.
- **DYN-005 P1:** Athlete Abroad link directory; real readiness/destination progress.
- **DYN-006 P1:** Role Intelligence illustrative role-only; evidence/provenance/decisions.
- **DYN-007 P1:** verified OS generic shells; role-specific persistent work.
- **DYN-008 P1:** Compass fixed trustScore=0; governed explanation/decision.
- **DYN-009 P2:** historical audit wrongly labels repaired InboxV2, Scholar-Athlete and portfolio sharing as static.
- **CERT-107 P0:** all 107 individual full journey proof records.
- **PBOS-GENESIS-003:** separately authorized original-host history recovery, offline read-only diagnostics first.

## 14. Canonical sources and command-center comparison
PPS-000 through PPS-015; `lib/roles/registry.ts`; `lib/role-os/canonicalOperatingSystems.ts`; `lib/platform/capabilityCatalog.ts`; `lib/platform/capabilityMap.ts`; `lib/navigation/roleNavigation.ts`; `docs/USER_JOURNEYS.md`; `docs/MASTER_CHECKLIST.md`; `docs/ENGINEERING/CAPABILITY_CERTIFICATION_STANDARD.md`; `docs/design/CANONICAL_ROUTE_MAP.md`; static-to-functional source audit in this branch. Recovery source: [PBOS-RCC-001](https://docs.google.com/spreadsheets/d/12ALDMBbQOPIT9lGSzT-RfqY5S_TMdtPO4Wwi00Xo0kI/edit).

**Command-center reconciliation:** aligns on 15 roles, 107 entry inventory, unverified live PBOS and production HOLD. Needs explicit Wave 0–7 crosswalk to RCC recovery items; role-specific meaningful task evidence for every OS beyond onboarding tests; DYN-001 and DYN-003 first; DYN-002 is dormant technical debt; actual navigation owner and 107 capability route-to-workflow mappings; updated exact-commit CI and hosted readiness. Source audits are not full deployed systems audit.

**Scope limits:** This roadmap neither merges a PR, applies migrations, modifies original Mac history, provisions production credentials/authority, nor certifies live constituent functions. The PDF is preserved on Drive; this textual companion is versioned in GitHub for implementation review.

### Audit correction to source PDF v1.0 (2026-11-20)
The printed PDF describes DYN-002 as an active `/support-messages` production defect. Exact main/branch source inspection establishes that `app/support-messages/page.tsx` redirects to `/messages`; the demo component is no longer routed. Treat PDF DYN-002 wording as historical and superseded by this record and the dated source audit. No user-facing messaging rewrite should proceed from that stale diagnosis.
