# Cross-System Role and Command Consistency Audit — 2026-10-22

## Scope and evidentiary limits
Source inspection of role registry, signup/onboarding, invitation client and API, Role OS gate, shell navigation, Support Network, PBOS journeys, and selected API usage. Production authenticated journeys and every file in the repository have **not** been exhaustively exercised. This is an in-progress audit, not an all-systems certification.

## Constitutional criteria
PPS-009 requires stable canonical identifiers and preserved deprecated aliases. Authority-bearing paths must resolve to one registered canonical role and fail closed on unknown identities. Do not convert missing/unknown identities to Scholar authority.

## Live production database (read-only inspection)
- Supabase project `Playbook OS` (`oexgxnybeixwadgtdtzp`) is ACTIVE_HEALTHY.
- `public.profiles` has 42 records; 34 have NULL `profile_mode`, 11 have legacy `role=scholar_athlete`. There are 8 canonical `role=scholar-athlete` records (4 with NULL profile_mode and 4 explicitly canonical). No explicit nonnull role/profile_mode mismatch was found.
- No CHECK constraints exist on the `public.profiles` table in the inspected schema. This does **not** establish that canonicalization is safe as a bulk update; downstream tables, policies, and triggers still need a compatibility review.
- Supabase security advisors report 10 RLS-enabled tables lacking policies (INFO), 8 authenticated-callable SECURITY DEFINER functions (WARN), and leaked-password protection warning. They require separate authorization/security evaluation; do not automatically grant access or revoke RPC functionality without reviewing contracts.

## Confirmed findings
1. **P0 — Invitation role mismatch (corrected in this branch).** `InvitationCenter` compared raw `profile_mode` against canonical `scholar-athlete`; stored `scholar_athlete` could be denied. Server had canonicalization, but used a compatibility normalizer with Scholar fallback. Both sides now use strict `requirePlaybookRole`, reject unknown roles, and preserve intentional legacy aliases.
2. **P0 — Discoverability.** Family OS tells users to select Invite Parent/Guardian from Scholar dashboard. The actual form exists at `/invitations`, but screenshots show an instructional screen without an action. Verify Scholar/Transition Youth dashboard links for every eligible role and add mobile entry action where absent.
3. **P0 — Trusted login QA.** `/login` requires hCaptcha before enabling Log In, while governed headless role tests attempted a click without completing challenge (Issue #234). PR #278 adds explicit blocked-stage reporting; real hCaptcha acceptance still required. Never disable security challenges to achieve green test results.
4. **P1 — Mobile usability.** Screenshot evidence shows fixed bottom navigation overlaying some content and long Marketplace hero typography exceeding mobile viewport. Requires actual-device/browser viewport regression.
5. **P1 — Incomplete authority certification.** Production `7053951` deployed and READY; role E2E failed at Scholar login. Family OS intentionally awaits independent `FAMILY_RELATIONSHIP` acceptance. No proof of complete PBOS activation or 15-role journey success.
6. **P1 — Parallel identity formats are in source.** Canonical slug `scholar-athlete`, compatibility alias `scholar_athlete`, and `parent_guardian` as a **relationship** type (not a role) are all used. Distinguish role identities from relationship kinds, PBOS adapter keys, and OS identifiers rather than blanket string replacement.

7. **P0 — Incorrect route substring matching (corrected in this branch).** `getRoleHomeRoute` previously used `normalized.includes("athlete")`, misrouting `athlete-abroad` to Scholar-Athlete OS, and sent College Coach and Counselor to Scholar fallback. Now resolves registered role to exact OS route, routes unknown identity to `/start`, and retains explicit platform operator route compatibility.
8. **P1 — PBOS connector coverage.** PBOS connector identity contract lists seven internal roles while the public registry has fifteen onboarding roles and two provisioned Operating Systems. This may represent an intentional bounded integration; require a documented mapping and a per-role activation audit before claiming all fifteen roles are fully PBOS integrated.

9. **P0 — Unknown-role shell fallback (corrected in this branch).** `getRoleNavigation` used permissive `normalizePlaybookRole` which defaults unsupported stored roles to Scholar UI. It now uses strict canonical resolution and a restricted onboarding navigation for unknown or absent identity. This is not a substitute for server-side authorization.

## Guardrails
- Use `requirePlaybookRole` whenever persisted role affects permissions, activation, routing or invitations; handle invalid/missing role explicitly.
- Keep `normalizePlaybookRole` confined to intentionally non-authoritative legacy/display compatibility.
- Never compare raw persisted role values to canonical literal strings before resolving the role.
- Do not promote relationships into roles, or bypass Family consent and Mentor validation.
- Add cross-client/API, underscore-alias, invalid-role and denial tests.
- Keep preexisting release rollback and do not delete member records.

## Release criteria
CI and Platform QA green on exact commit; reviewer approves; deploy same commit in controlled rollout; manually verify Scholar invited Family consent acceptance and revocation, real login/CAPTCHA, all-role owner access, 390px and 320px mobile overflow, navigation visibility, PBOS activation and persistence. Fail closed, and report unsupported journeys rather than marking them passed.
