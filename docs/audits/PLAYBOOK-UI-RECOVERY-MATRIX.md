# Playbook UI Recovery Implementation Matrix

Exact base: `724fa10a9577586598127da77b336cbadfd2455b`

This is an implementation control artifact. A mapping or marker is not completion.

| Route or surface | Current UI generation | Canonical target | Shared dependency | Implementation status | Desktop verification | Mobile verification |
|---|---|---|---|---|---|---|
| `AUTHENTICATED_PRODUCT_SHELL` | Canonical shared implementation | PGDS-001 | Root layout | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `STUDIO_SHELL_AUTHORITY` | Dedicated operator implementation | PGDS-001 | Studio layout | IMPLEMENTED_AND_VERIFIED | PASSED | N/A |
| `/about` | Canonical marker present | PGDS-001 | Unified authenticated shell | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `/academic-readiness` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/action-routing` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/admin/moderation` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/admin` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/albums` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/application-workspaces` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/athlete-abroad-os` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/auth/callback` | Legacy/inline presentation | PGDS-001 | Authentication shell | PENDING | PENDING | PENDING |
| `/badges` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/brand-partner-os` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/certificates` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/check-email` | Canonical marker present | PGDS-001 | Authentication shell | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `/collaboration` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/community-events` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/compass` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/connections` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/courses/[slug]` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/courses/athletes-abroad-global-hub` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/courses/community-safety-no-bullying` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/courses` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/dashboard` | Canonical marker present | PGDS-001 | Unified authenticated shell | IN_PROGRESS_UNVERIFIED | PENDING | PENDING |
| `/demo/founder-case-study` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/demo` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/district-os` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `/economy` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/educator-os` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `/employer-os` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `/events` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/family-os` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `/feed` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/founder` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/gamification` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/home` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/intelligence-platform` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/invitations` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/invite/[token]` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/journey` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/leaderboard` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/living-scholar` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/login` | Canonical marker present | PGDS-001 | Authentication shell | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `/mentor-connect` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/mentor-os` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `/mentorship` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/messages/[threadId]` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/messages` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/network-intelligence` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/notifications` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/opportunities` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/opportunity-toolkit` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/` | Canonical marker present | PGDS-001 | Public shell | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `/pending` | Canonical marker present | PGDS-001 | Authentication shell | IN_PROGRESS_UNVERIFIED | PENDING | PENDING |
| `/permissions` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/portfolio/[shareId]` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/profile` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/recommenders/[requestId]` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/recommenders` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/record` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/reset-password` | Canonical marker present | PGDS-001 | Authentication shell | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `/reward-economy` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/role-intelligence` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/role-select` | Shared or unclassified presentation | PGDS-001 | Authentication shell | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `/scholar-athlete-os` | Canonical owner-scoped implementation | PGDS-001 / PGSA-001 | Unified authenticated shell + athlete record projection | IN_PROGRESS_UNVERIFIED | PENDING | PENDING |
| `/scholar-network` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/start` | Canonical marker present | PGDS-001 | Authentication shell | IN_PROGRESS_UNVERIFIED | PENDING | PENDING |
| `/store-v2` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/store` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/architecture` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/beta-33` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/beta-34-audit` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/beta-34` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/connected-journey-qa` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/demo-director` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/design-schema-audit` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/docs` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/events` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/inspector` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/invitations` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/network-inspector` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/oracle` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/release` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/sdk` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/simulator` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/system-map` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/themes` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/studio/visual-qa` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/support-messages` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/support-network` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/transcript` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/tutorial` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/u/[username]` | Legacy/inline presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
| `/university-os` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | IMPLEMENTED_AND_VERIFIED | PASSED | PASSED |
| `/workflows` | Shared or unclassified presentation | PGDS-001 | Unified authenticated shell | PENDING | PENDING | PENDING |
