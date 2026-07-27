# PBOS-RLS-001 Current Security State Audit

**Version:** 1.0.0
**Status:** Planning and Validation Audit
**Owner:** Playbook OS Engineering and Security
**Last Updated:** July 27, 2026

## Purpose

Inventory the repository's present authentication, database, RLS, function, service-role, API, frontend permission, role, and relationship state and convert the canonical authorization architecture into an implementation-ready plan. This audit changes no application behavior and creates no migration or SQL policy.

## Constitutional Authority

The command referenced `docs/CONSTITUTION/`, which is not present. The canonical files were found under `docs/PPS/00_CONSTITUTION/` and applied in this order:

1. [PPS-012 Security and Permissions](../PPS/00_CONSTITUTION/PPS-012_SECURITY_AND_PERMISSIONS.md): verified identity, least privilege, defense in depth, secure-by-default behavior, auditability, and permission inheritance.
2. [PPS-011 Data Governance](../PPS/00_CONSTITUTION/PPS-011_DATA_GOVERNANCE.md): one canonical owner, classification, lineage, lifecycle, and derived-data boundaries.
3. [PPS-004 Operating System Framework](../PPS/00_CONSTITUTION/PPS-004_OPERATING_SYSTEM_FRAMEWORK.md): every role OS inherits shared authentication, authorization, messaging, storage, and security rather than replacing them.
4. [PPS-006 Intelligence Architecture](../PPS/00_CONSTITUTION/PPS-006_INTELLIGENCE_ARCHITECTURE.md): intelligence engines inherit caller permissions, use authorized canonical data, and may not overwrite canonical records.
5. [Playbook RLS Authorization Architecture](../SECURITY/PLAYBOOK_RLS_AUTHORIZATION_ARCHITECTURE.md): deny-by-default role, relationship, consent, age, visibility, ownership, backend, and audit contract.

Security requirements override implementation convenience. Where repository evidence does not establish access, this audit records **UNRESOLVED — DENY BY DEFAULT**.

## Inventory Method and Limits

The audit inspected checked-in TypeScript/TSX source and all 18 files under `supabase/migrations/`. It found 44 local `CREATE TABLE` statements, 45 `ENABLE ROW LEVEL SECURITY` statements, 48 named policies, and one locally declared database function. Runtime source references 55 distinct table or storage relation names; 11 of those do not have a checked-in `CREATE TABLE` statement and therefore cannot be fully validated from repository migrations alone.

This is static repository evidence. It does not prove the schema or policies currently deployed in any Supabase environment. Deployed catalog inspection and authenticated positive/negative tests remain required.

# 1. Existing Supabase Authentication Implementation

- Browser access uses shared Supabase browser clients and calls such as `auth.getUser`, `auth.getSession`, sign-in, callback, and session guards.
- Server helpers exist under `lib/supabase/server.ts` and `lib/supabaseServer.ts`; route usage is inconsistent, with many API routes constructing a service-role client directly.
- Authentication-related pages include login, email confirmation, callback, password reset, onboarding, pending review, dashboards, profiles, records, and role surfaces.
- Some service-role routes call `supabase.auth.getUser()` on the privileged client without an explicit access token in the call. Static inspection does not establish that these calls authenticate the request as intended.
- Multiple elevated routes instead accept user, Scholar, organization, or record identifiers from request parameters/body and query with the service role. Those routes require explicit caller authentication and authorization review.
- Public/anonymous access is not centrally enumerated. It must be explicit per route, table, storage bucket, and response field.

**Current assessment:** PARTIAL. Authentication foundations exist, but API authentication and identity propagation are not uniform enough to serve as authorization evidence.

# 2. Database Inventory and Authorization Map

## Interpretation

- The table includes every relation name found in local table creation/alteration or active `.from(...)` runtime calls.
- “Owner/manage own” reflects checked-in RLS policy wording, not a production test result.
- “Enabled; no policy found” means RLS is enabled in migrations but ordinary API access is denied unless another deployed policy exists; service-role routes bypass that protection.
- “No local CREATE” means schema, keys, ownership columns, and policies are not fully governed by this repository snapshot.
- Allowed access that is not proven by a checked-in policy is **UNRESOLVED — DENY BY DEFAULT**.

| Table | Canonical owner | Classification | Primary role | Allowed viewers | Allowed creators | Allowed editors | Allowed administrators | Delegated access | Required audit events | Current RLS status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| achievements | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Users can manage own achievements |
| ag_progress | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | No local CREATE; SELECT: Students can view own ag progress<br>ALL: Students can update own ag progress |
| application_workspaces | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Scholars can manage own application workspaces |
| athlete_eligibility_checks | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; no policy found |
| athlete_financial_entries | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; no policy found |
| athlete_profiles | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; no policy found |
| avatars | Authenticated user | Confidential | All applicable users | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Public/item visibility only where policy exists | Ownership/visibility change; privileged access | No local CREATE; UNRESOLVED — DENY BY DEFAULT |
| brand_partners | Verified organization | Confidential | Brand/organization member | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Verified membership; permission schema unresolved | Membership/publish/update/privileged read | RLS enabled; no policy found |
| certificates | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | No local CREATE; UNRESOLVED — DENY BY DEFAULT |
| coin_ledger | Platform steward; subject user for ledger visibility | Restricted | Platform service / subject user | Policy-named owner/public/participant only | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Read-only subject view where policy exists | Every write, processing transition, admin access | RLS enabled; SELECT: Scholars can view own coin ledger |
| community_event_rsvps | Creator/organization or RSVP/redeeming user | Internal/Confidential | Community participant / organization | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Public event/catalog plus owner action where policy exists | Create/update/RSVP/redemption | RLS enabled; ALL: Users manage own rsvps |
| community_events | Creator/organization or RSVP/redeeming user | Internal/Confidential | Community participant / organization | Policy-named owner/public/participant only | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Public event/catalog plus owner action where policy exists | Create/update/RSVP/redemption | RLS enabled; SELECT: Read public events |
| connection_requests | Relationship participants; canonical steward unresolved | Restricted | Scholar and verified participant | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Active participant/relationship scope only | Invite/create/accept/revoke/expire/read/message/action | No local CREATE; UNRESOLVED — DENY BY DEFAULT |
| content_mutes | Creating user or safety subject as applicable | Confidential/Restricted | Community participant | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Visibility plus age/consent/safety; current broad authenticated reads require review | Create/edit/delete/read where sensitive; moderation/block/mute/report | RLS enabled; ALL: Users manage own content mutes |
| course_progress | Canonical owner unresolved | UNRESOLVED | UNRESOLVED | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | UNRESOLVED — DENY BY DEFAULT | Owner, lifecycle, privileged access events unresolved | No local CREATE; UNRESOLVED — DENY BY DEFAULT |
| evidence | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Users can manage own evidence |
| evidence_packs | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Users can manage own evidence packs |
| feed_post_comments | Creating user or safety subject as applicable | Confidential/Restricted | Community participant | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Visibility plus age/consent/safety; current broad authenticated reads require review | Create/edit/delete/read where sensitive; moderation/block/mute/report | RLS enabled; SELECT: Users can view feed comments<br>INSERT: Users can create own feed comments<br>SELECT: Anyone authenticated can read feed comments<br>ALL: Users can manage own feed comments |
| feed_post_reactions | Creating user or safety subject as applicable | Confidential/Restricted | Community participant | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Visibility plus age/consent/safety; current broad authenticated reads require review | Create/edit/delete/read where sensitive; moderation/block/mute/report | RLS enabled; SELECT: Users can view feed reactions<br>ALL: Users can manage own feed reactions<br>SELECT: Anyone authenticated can read feed reactions<br>ALL: Users can manage own feed reactions |
| feed_posts | Creating user or safety subject as applicable | Confidential/Restricted | Community participant | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Visibility plus age/consent/safety; current broad authenticated reads require review | Create/edit/delete/read where sensitive; moderation/block/mute/report | No local CREATE; UNRESOLVED — DENY BY DEFAULT |
| guided_tour_progress | Authenticated user | Confidential | All applicable users | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Public/item visibility only where policy exists | Ownership/visibility change; privileged access | RLS enabled; no policy found |
| moderation_actions | Platform steward; subject user for ledger visibility | Restricted | Platform service / subject user | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Read-only subject view where policy exists | Every write, processing transition, admin access | RLS enabled; no policy found |
| nil_deals | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; no policy found |
| nil_store_campaigns | Verified organization | Confidential | Brand/organization member | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Verified membership; permission schema unresolved | Membership/publish/update/privileged read | RLS enabled; no policy found |
| notifications | Authenticated user | Confidential | All applicable users | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Public/item visibility only where policy exists | Ownership/visibility change; privileged access | RLS enabled; no policy found |
| onboarding_options | Canonical owner unresolved | UNRESOLVED | UNRESOLVED | Policy-named owner/public/participant only | Policy-named creator/owner only | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | UNRESOLVED — DENY BY DEFAULT | Owner, lifecycle, privileged access events unresolved | RLS enabled; SELECT: Options are viewable by authenticated users<br>INSERT: Authenticated users can add options |
| opportunity_matches | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Users can manage own opportunity matches |
| outcomes | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Users can manage own outcomes |
| photos | Authenticated user | Confidential | All applicable users | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Public/item visibility only where policy exists | Ownership/visibility change; privileged access | No local CREATE; UNRESOLVED — DENY BY DEFAULT |
| playbook_events | Platform steward; subject user for ledger visibility | Restricted | Platform service / subject user | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Read-only subject view where policy exists | Every write, processing transition, admin access | RLS enabled; no policy found |
| playbook_records | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Users can manage own playbook records |
| portfolio_shares | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Scholars can manage own portfolio shares |
| profile_album_photos | Authenticated user | Confidential | All applicable users | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Public/item visibility only where policy exists | Ownership/visibility change; privileged access | RLS enabled; SELECT: Users can read album photos<br>ALL: Users manage own album photos |
| profile_albums | Authenticated user | Confidential | All applicable users | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Public/item visibility only where policy exists | Ownership/visibility change; privileged access | RLS enabled; SELECT: Users can read public albums<br>ALL: Users manage own albums |
| profiles | Authenticated user | Confidential | All applicable users | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Public/item visibility only where policy exists | Ownership/visibility change; privileged access | No local CREATE; UNRESOLVED — DENY BY DEFAULT |
| recommender_requests | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Scholars can manage own recommender requests<br>SELECT: Recommenders can view requests by email |
| recruiting_targets | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; no policy found |
| reflections | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Users can manage own reflections |
| reward_events | Platform steward; subject user for ledger visibility | Restricted | Platform service / subject user | Policy-named owner/public/participant only | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Read-only subject view where policy exists | Every write, processing transition, admin access | RLS enabled; SELECT: Scholars can view own reward events |
| scholar_vault_items | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Users can manage own vault items |
| shared_actions | Relationship participants; canonical steward unresolved | Restricted | Scholar and verified participant | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Active participant/relationship scope only | Invite/create/accept/revoke/expire/read/message/action | RLS enabled; no policy found |
| store_products | Canonical owner unresolved | UNRESOLVED | UNRESOLVED | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | UNRESOLVED — DENY BY DEFAULT | Owner, lifecycle, privileged access events unresolved | RLS enabled; no policy found |
| store_redemptions | Creator/organization or RSVP/redeeming user | Internal/Confidential | Community participant / organization | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Public event/catalog plus owner action where policy exists | Create/update/RSVP/redemption | RLS enabled; no policy found |
| student_activities | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | No local CREATE; UNRESOLVED — DENY BY DEFAULT |
| support_directory_profiles | Canonical owner unresolved | UNRESOLVED | UNRESOLVED | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | UNRESOLVED — DENY BY DEFAULT | Owner, lifecycle, privileged access events unresolved | RLS enabled; SELECT: Read searchable directory<br>ALL: Users manage own directory profile |
| support_invitations | Relationship participants; canonical steward unresolved | Restricted | Scholar and verified participant | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Active participant/relationship scope only | Invite/create/accept/revoke/expire/read/message/action | RLS enabled; INSERT: Users can create support invitations<br>SELECT: Scholars can view their invitations<br>SELECT: Invitees can read invitations by email<br>UPDATE: Invitees can update their invitation status |
| support_messages | Relationship participants; canonical steward unresolved | Restricted | Scholar and verified participant | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Active participant/relationship scope only | Invite/create/accept/revoke/expire/read/message/action | RLS enabled; no policy found |
| support_relationships | Relationship participants; canonical steward unresolved | Restricted | Scholar and verified participant | Policy-named owner/public/participant only | Policy-named creator/owner only | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Active participant/relationship scope only | Invite/create/accept/revoke/expire/read/message/action | RLS enabled; SELECT: Scholars can view their support relationships<br>SELECT: Supporters can view their scholar relationships<br>INSERT: Scholars can create support relationships |
| timeline_events | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Users can manage own timeline events |
| trust_reports | Creating user or safety subject as applicable | Confidential/Restricted | Community participant | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Visibility plus age/consent/safety; current broad authenticated reads require review | Create/edit/delete/read where sensitive; moderation/block/mute/report | RLS enabled; ALL: Users can manage own trust reports<br>INSERT: Users create own reports<br>SELECT: Users view own reports |
| user_badges | Authenticated user | Confidential | All applicable users | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Public/item visibility only where policy exists | Ownership/visibility change; privileged access | No local CREATE; UNRESOLVED — DENY BY DEFAULT |
| user_blocks | Creating user or safety subject as applicable | Confidential/Restricted | Community participant | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Visibility plus age/consent/safety; current broad authenticated reads require review | Create/edit/delete/read where sensitive; moderation/block/mute/report | RLS enabled; ALL: Users manage own blocks |
| user_connections | Relationship participants; canonical steward unresolved | Restricted | Scholar and verified participant | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | UNRESOLVED — DENY BY DEFAULT | Audited server operation only; exact grant unresolved | Active participant/relationship scope only | Invite/create/accept/revoke/expire/read/message/action | No local CREATE; UNRESOLVED — DENY BY DEFAULT |
| user_mutes | Creating user or safety subject as applicable | Confidential/Restricted | Community participant | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Visibility plus age/consent/safety; current broad authenticated reads require review | Create/edit/delete/read where sensitive; moderation/block/mute/report | RLS enabled; ALL: Users manage own mutes |
| verifications | Scholar identified by Scholar/user FK | Restricted | Scholar / Scholar-Athlete | Policy-named owner/public/participant only | Policy-named creator/owner only | Policy-named owner/participant only | Audited server operation only; exact grant unresolved | Only canonical relationship/verified-record scope; table predicate unresolved unless policy proves it | Create/update/delete; delegated read; verification/recruiting access | RLS enabled; ALL: Users can manage own verifications |

# 3. Existing RLS Policy Assessment

The 48 checked-in policies primarily cover owner-managed Playbook Record data, application tools, rewards reads, support invitations/relationships, A–G progress, directory/events, albums, social interactions, trust controls, and onboarding options.

Material findings:

- Several tables have RLS enabled but no checked-in policy. They are inaccessible to ordinary clients but are reachable through service-role code paths; this is not a complete authorization model.
- Many policies use broad `FOR ALL` owner predicates. Operation-specific policies are preferable where create, update, verification, archival, and deletion have different invariants.
- Authenticated-wide reads exist for feed comments and reactions. Age, block/mute, post visibility, moderation state, and parent-record visibility are not evident in those policy names and require predicate inspection/testing.
- Public event, public album, photo, and searchable-directory reads require field-level response review because row visibility does not automatically make every column public.
- Email-address policies for invitations and recommender requests require identity normalization, verified-email, enumeration, expiry, and replay review.
- No checked-in policy evidence was found for several active runtime relations, including `profiles`, `feed_posts`, connection tables, learning/certificate tables, activities, and badges.
- No deployed-catalog evidence is present, so policy drift and out-of-band policies remain unresolved.

# 4. Existing Database Functions

Only one locally declared database function was found:

| Function | Purpose | Security posture | Required action |
| --- | --- | --- | --- |
| `set_updated_at` | Timestamp trigger helper | No business authorization observed; execution/search-path posture still requires catalog review | Verify owner, `SECURITY INVOKER/DEFINER`, execute grants, and fixed `search_path` in deployed database |

No repository evidence establishes the complete deployed function, trigger, view, materialized view, storage policy, or RPC inventory. `PBOS-RLS-001` must query the deployed catalogs before SQL implementation.

# 5. Service-Role Security Review

Static search found 22 API route files referencing `SUPABASE_SERVICE_ROLE_KEY`. All bypass RLS. “Safer alternative” below is a required investigation, not a claim that the route can be changed without functional design.

| File | Purpose / data accessed | Why elevation appears to exist | Safer alternative to validate | Required audit logging |
| --- | --- | --- | --- | --- |
| `app/api/albums/route.ts` | Create/read `profile_albums` and nested photos | Bypass owner/public album policies | User-context client with owner/public RLS | Actor, album, operation, visibility, outcome |
| `app/api/albums/photos/route.ts` | Insert `profile_album_photos`; update album cover | Cross-table write convenience | User-context transaction/RLS or bounded owner service | Actor, album/photo, storage reference, cover change |
| `app/api/application-workspaces/route.ts` | Create/read workspaces; emit events | Multi-table workflow | User-context RLS plus bounded event writer | Scholar, workspace, event, status, outcome |
| `app/api/brand-partners/campaigns/route.ts` | Create/read `nil_store_campaigns` | No complete brand permission policy | Verified organization membership and explicit permission; deny until defined | Actor, organization, campaign, approval basis |
| `app/api/community-events/route.ts` | Public event read and event creation | Creation policy absent | Public/user read through RLS; bounded verified event creator | Actor/organization, event, visibility, mutation |
| `app/api/events/emit/route.ts` | Insert events, read support relationships, insert notifications | Fan-out across subjects | Authenticated bounded event service with recipient derivation | Actor, subject, event type, recipients, correlation ID |
| `app/api/guided-tour/progress/route.ts` | Upsert tour progress | Owner write convenience | User-context owner RLS | User, role/tour, transition, outcome |
| `app/api/invitations/accept/route.ts` | Read/update invitations; create relationships | Invite acceptance spans tables | Verified token/user server transaction with scoped SQL function only if audited | Invite, authenticated user, relationship, state transition |
| `app/api/invitations/send/route.ts` | Create support invitations | Email delivery/workflow | User-context insert policy plus server delivery worker | Inviter, Scholar, invitee hash/reference, role, expiry |
| `app/api/mail-gateway/hostinger/route.ts` | Read relationships; insert support messages | Authenticated webhook ingestion | Signed webhook plus narrowly scoped ingestion function/client | Webhook identity, relationship, message metadata, outcome |
| `app/api/mentor-directory/route.ts` | Search/upsert directory profiles | Search and profile write convenience | Public-safe view plus owner RLS | Actor, filters, profile mutation, verification state |
| `app/api/notifications/route.ts` | Read notifications | Bypass missing/unknown owner policy | User-context recipient RLS | Recipient, query scope, outcome; no content duplication |
| `app/api/parse-transcript/route.ts` | Persist `ag_progress` after transcript parsing | Server AI/parser workflow | Authenticated Scholar context plus bounded server write | Scholar, source artifact, derived rows, model/parser version |
| `app/api/portfolio/shares/route.ts` | Create/read share records | Share lifecycle workflow | User-context owner RLS and token-safe public resolver | Scholar, share, scope, expiry/revocation, access |
| `app/api/recommenders/request/route.ts` | Create requests/events | Email workflow and event insert | User-context owner RLS plus bounded event delivery | Scholar, request, recommender reference, expiry/state |
| `app/api/rewards/balance/route.ts` | Read coin ledger | Subject balance aggregation | User-context read/RPC with owner RLS | Subject, calculation version, outcome |
| `app/api/rewards/emit/route.ts` | Insert reward/ledger; mark processed | Trusted reward issuance | Bounded idempotent reward service with server-authorized event allowlist | Actor/service, subject, reason, amount, idempotency key |
| `app/api/social/comments/route.ts` | Create/update/delete comments; insert rewards | Cross-table social/reward workflow | User-context comment RLS plus bounded reward emitter | Actor, post/comment, operation, moderation state, reward |
| `app/api/store/redemptions/route.ts` | Read balance; insert redemption and ledger debit | Atomic financial-style workflow | Audited transactional function with authenticated subject and invariant checks | Subject, product, balance, debit, idempotency, outcome |
| `app/api/support-network/actions/route.ts` | Read relationships/actions; create/update actions/events | Delegated multi-table workflow | User-context relationship RLS plus bounded event writer | Actor, Scholar, relationship, action/status, permission basis |
| `app/api/support-network/messages/route.ts` | Read relationships/messages; create messages/events | Delegated messaging workflow | Participant/relationship RLS plus bounded event writer | Sender, recipient/Scholar, relationship, message metadata, safety state |
| `app/api/support-network/summary/route.ts` | Read relationships, invitations, messages, actions | Aggregate support dashboard | User-context scoped views/RLS | Actor, Scholar, relationship basis, queried domains, outcome |

## Service-role conclusions

- No occurrence is approved merely because it is server-side.
- Several routes appear to rely on request-supplied identifiers without uniform caller authorization.
- Some elevated reads can likely use user-context RLS; multi-table, webhook, reward, redemption, and parser workflows may require bounded server services or narrowly scoped database functions.
- No common privileged-operation audit layer was found in these routes.
- Every route remains **UNRESOLVED — DENY BY DEFAULT for production approval** until caller authentication, authorization predicate, data minimization, failure behavior, and audit evidence are tested.

# 6. API Routes with Elevated or Sensitive Permissions

All 22 service-role routes above are elevated. Additional sensitive routes use ordinary clients or privileged operational semantics and require authorization evidence:

- `app/api/admin/moderation/route.ts`: moderation queue and action updates; administrator verification must be proven.
- `app/api/community-events/rsvp/route.ts`: RSVP and reward effects; owner identity and idempotency require tests.
- `app/api/social/reactions/route.ts`: reaction and reward effects; actor/post visibility require tests.
- `app/api/trust/block/route.ts`, `mute/route.ts`, and `report/route.ts`: safety mutations; subject ownership, anti-abuse, and audit behavior require tests.
- `app/api/ai/zai/route.ts`: intelligence boundary; must inherit caller authorization and avoid restricted-data leakage.
- notification email routes: recipient selection and sensitive payload minimization require review even when they do not query with service role.

# 7. Frontend Permission Assumptions

- Role destinations and navigation are resolved from role values, but route visibility is not authorization.
- Several pages query Supabase directly. Their security depends on deployed RLS, which is not fully represented for every referenced relation.
- UI components and role OS dashboards may hide or show actions based on role; these checks must be treated as presentation only.
- Public profile, feed, connection, album, course, transcript, record, and dashboard reads assume public or owner-safe database behavior that requires field-by-field RLS/response validation.
- The current `profiles.role`/requested-role flow and fallback normalization can create unsafe assumptions if unknown roles fall back to Scholar.
- Some role OS pages are static or partially data-backed. Their current lack of sensitive queries is not evidence that future data access is authorized.

# 8. Existing Role Definitions

The executable role registry contains Scholar, Scholar-Athlete, Transition-Aged Youth, Parent/Guardian, Mentor, Educator, High School Coach, College Coach/Recruiter, College Admissions, Brand Partner, Employer, District Administrator, and Community Partner. Platform Administrator is constitutionally supported but provisioned outside public onboarding.

## Role authorization validation

| Role | Identity/authentication | Authorization scope and data boundary | Organization relationship | Consent/age | Verification |
| --- | --- | --- | --- | --- | --- |
| Scholar | Supabase authenticated user | Own Scholar Record and eligible community/opportunity actions | Optional school/support context | Age policy and guardian consent where required | Email/contact; role-specific verification partial |
| Scholar-Athlete | Supabase authenticated user | Scholar ownership plus athletics/recruiting visibility | Team/school/recruiting links unresolved | Youth/teen and recruiting consent apply | Athletics/compliance approval partial |
| Parent/Guardian | Authenticated user | `view_progress`, `view_deadlines`, `support_tasks` for verified relationship only | Dependent relationship | Guardian authority and consent rules unresolved | Invite/dependent workflow partial |
| Educator | Authenticated user | `view_progress`, `verify_evidence`, `recommend_actions`, `view_cohort` within scope | Verified school/cohort | Student age/consent and institution purpose | Official contact captured; approval partial |
| Mentor | Authenticated user | `view_progress`, `recommend_actions`, `support_tasks` for connected Scholar | Specific support relationship | Youth contact/consent policy unresolved | Background/eligibility workflow missing |
| High School Coach | Authenticated user | **UNRESOLVED — DENY BY DEFAULT**; no coach permission kind | School/team/roster unresolved | Youth/recruiting consent unresolved | Institutional approval partial |
| College Coach | Authenticated user | University-partner verified-record baseline only; recruiting expansion unresolved | Verified college membership required | Youth recruiting/contact rules unresolved | Institutional/NCAA workflow partial |
| College Admissions | Authenticated user | University-partner verified-record/recommendation baseline only | Verified institution membership required | Student contact/sharing consent unresolved | Official contact captured; approval partial |
| District Administrator | Authenticated, provisioned user | `view_cohort`, `view_equity_metrics`; aggregate-first | Verified district/school scope | Individual youth access unresolved | Provisioning/approval required; flow incomplete |
| Employer Partner | Authenticated, provisioned/approved user | `view_verified_record`, `create_opportunities`, `review_candidates` in candidate/org scope | Verified employer membership | Candidate sharing/age/work policy unresolved | Workflow missing |
| Brand Partner | Authenticated user | **UNRESOLVED — DENY BY DEFAULT**; permission map missing | Verified brand organization required | Youth/NIL/campaign consent unresolved | Compliance acknowledgement only; review partial |
| Community Partner | Authenticated pending user | Public data only; no default delegated permission | Optional organization unresolved | Community age/consent policy applies | Manual classification/review unresolved |
| Platform Administrator | Provisioned authenticated identity | Audited operational/moderation purpose only; never data owner | Platform operational assignment | Cannot override consent without approved lawful/operational basis | Strong admin verification and authorization required; current completeness unverified |

# 9. Existing Relationship Models

- `support_relationships` models Scholar/supporter relationships and has Scholar/supporter select plus Scholar insert policies.
- `support_invitations` models invitation lifecycle with creator, Scholar, and verified-email access policies.
- `shared_actions` and `support_messages` depend on support relationships but have RLS enabled with no checked-in policies.
- `connection_requests` and `user_connections` are used by runtime code but have no local create/policy authority in checked-in migrations.
- Role permissions currently define `scholar`, `parent_guardian`, `educator`, `mentor`, `district_admin`, `university_partner`, and `employer_partner` kinds.
- Coach, recruiter, admissions, brand, counselor, TAY, and community relationship semantics are missing or partial.
- Relationship expiry, revocation, consent coupling, organization provenance, and audit policy are not comprehensively implemented or tested.

# 10. Authorization Gaps

1. Deployed schema/policy/function/storage inventory is absent.
2. Eleven actively referenced relations lack local `CREATE TABLE` authority.
3. Multiple RLS-enabled tables have no policy and are used through service-role routes.
4. Twenty-two API routes bypass RLS; no shared privileged-operation audit contract was found.
5. Authentication and authorization handling is inconsistent across service routes.
6. Role selection, route destination, and UI visibility can be mistaken for authorization.
7. Missing role/relationship permissions block coach, recruiting, admissions, brand, counselor, TAY, and community access decisions.
8. Age-policy thresholds and guardian/Scholar consent combinations are unresolved.
9. Consent, organization membership, visibility, role approval, and age-policy canonical schemas are unresolved.
10. Public/network/connections/private semantics are not proven across active tables and response fields.
11. Email-based invitation/recommender policies require verified-email and enumeration/replay tests.
12. Administrative access and moderation boundaries lack complete role verification and audit evidence.
13. Intelligence routes do not yet have documented permission-inheritance tests.
14. Audit event storage, retention, access, tamper resistance, and sensitive-value minimization remain unresolved.
15. No comprehensive owner/non-owner/delegated/revoked/organization/youth/service-role authorization test suite exists.

# 11. RLS Implementation Plan

No phase may widen access before its prerequisites and negative tests pass.

## Phase 1 — Identity and authentication

- Inventory deployed Auth configuration, identities, claims, sessions, anonymous access, and server/browser clients.
- Standardize request authentication and user-context Supabase construction.
- Separate requested role from approved role; prohibit client-controlled elevation.
- Define provisioned administrator and service identities.

## Phase 2 — User ownership

- Establish canonical ownership columns and invariants for all 55 inventoried relations.
- Resolve the 11 runtime relations without checked-in create authority.
- Define owner-safe select/insert/update/delete predicates and lifecycle restrictions.
- Add cross-owner denial tests before delegated access.

## Phase 3 — Profiles

- Classify every profile field and public projection.
- Implement owner access and allowlisted public reads; keep age, contact, consent, verification, and internal role state restricted.
- Define avatar/storage ownership and public delivery boundaries.

## Phase 4 — Scholar Record

- Map PPS-300 domains to concrete tables and ownership FKs.
- Apply owner policies to record, academic, athletics, career, documents, achievements, goals, evidence, outcomes, timeline, and vault data.
- Separate source documents from public/verified presentations.

## Phase 5 — Relationships and delegated access

- Canonicalize relationship types, status, scope, verifier, expiry, revocation, and consent linkage.
- Implement existing Parent/Guardian, Educator, and Mentor permissions first.
- Keep unsupported coach/recruiter/admissions/brand/counselor/TAY/community access denied until governance resolves it.
- Add expiry/revocation and unrelated-Scholar denial tests.

## Phase 6 — Organizations

- Define organizations, verified memberships, functions, scope, and revocation.
- Implement district, university, and employer access only for existing permission verbs.
- Prefer aggregate district views; prevent cross-organization access.

## Phase 7 — Opportunities

- Separate public opportunity listings, organization-owned creation, Scholar applications/matches, candidate sharing, and review.
- Enforce `create_opportunities` and `review_candidates` only in verified employer scope.
- Resolve brand-partner authorization before enabling campaign writes.

## Phase 8 — Messaging and community

- Define participant-only messages, relationship/contact eligibility, age/consent, block/mute, and abuse controls.
- Enforce post/comment/reaction visibility and moderation state.
- Audit sensitive contact without logging message bodies unnecessarily.

## Phase 9 — Administrative controls

- Define provisioned admin roles and bounded operational purposes.
- Replace routine service-role use with user-context RLS where possible.
- Wrap necessary privileged workflows in narrow, authenticated, authorized, audited services.
- Validate moderation, correction, export, and support operations.

## Phase 10 — Audit and monitoring

- Implement append-oriented authorization, consent, role, relationship, organization, admin, service, and safety events.
- Define retention, access, redaction, alerting, review ownership, and incident workflows.
- Add policy drift detection and periodic deployed-catalog validation.

# 12. Planning Completion and Blockers

## Completed

- Current static authentication and authorization inventory.
- All known table authorization map.
- Checked-in RLS policy and database-function inventory.
- Complete 22-file service-role occurrence inventory.
- Role and relationship authorization assessment.
- Dependency-ordered ten-phase implementation plan.
- Separate scenario validation matrix.

## Blocked

- Deployed Supabase catalog and Auth inspection: no production-safe database connection/evidence was supplied.
- SQL policy implementation: prohibited in this planning sprint and dependent on governance/schema decisions.
- Production authorization certification: requires migrations and positive/negative tests in an approved environment.

## Recommended next action

Resolve canonical role/relationship, age/consent, organization, and audit schemas; inspect deployed catalogs; then implement Phase 1–3 policies in a reviewable migration batch with denial-first tests. `PBOS-RLS-001` remains in progress until critical policy and service-boundary evidence exists.
