# Mock Data Inventory

Purpose: inventory active hardcoded/demo data related to onboarding integrity. Owner: Playbook OS Engineering. Last updated: July 24, 2026.

Related links: `docs/audits/RUNTIME_COMPONENT_MAP.md`, `docs/audits/FIRST_LOGIN_TOUR_AUDIT.md`.

## Method

Searched repository with ripgrep for product-owner terms and inspected route imports. This inventory prioritizes sources that are reachable in current runtime; broader studio/demo/foundation content remains review-required.

## Active runtime mock/demo sources

| Location | Line/row | Screen consuming it | Production runtime? | Why it exists | Action |
|---|---:|---|---|---|---|
| `lib/role-os/roleDashboards.ts` | learner/family/mentor dashboard objects | `/family-os`, `/mentor-os`, role pages through `RoleDashboardExperience`; learner if routed | Yes for role OS pages | Static dashboard seed object used as runtime data | REPLACE |
| `lib/role-os/roleDashboards.ts` | Maya strings: `Good morning, Maya`, `Congratulate Maya`, `Review Maya's next step` | role dashboards | Yes | Demo copy was left in active role dashboard source | REMOVE/REPLACE |
| `components/role-os/dashboards/RoleDashboardExperience.tsx` | calls `getRoleDashboard`, role-intelligence builders | `/family-os`, `/mentor-os`, `/educator-os`, `/district-os`, `/university-os`, `/employer-os` | Yes | Generic role OS shell never connected to authenticated profile data | REPLACE |
| `components/scholar-athlete/ScholarAthleteDashboard.tsx` | hardcoded `Target University`, `Dream College`, `eligibilityStatus: action_needed` | `/scholar-athlete-os` | Yes | Placeholder dashboard became active OS | REPLACE |
| `components/messages/InboxV2.tsx` | imports `getDemoConversations`, `getDemoConversationMessages`; senderName `Maya` | `/messages`, `/messages/[threadId]` | Yes | Demo inbox used as actual inbox | REPLACE |
| `lib/messages/conversationEngine.ts` | demo conversations/messages including Maya/Coach Taylor | `/messages` | Yes | Demo conversation engine powers inbox | REPLACE |
| `components/support-network-live/SupportNetworkLiveCenter.tsx` | `DEMO_SCHOLAR_ID = scholar-maya`, initial demo thread/actions | `/support-messages` | Yes | API-backed attempt starts from demo state and demo scholar ID | REPLACE |
| `lib/support-network-live/supportNetworkLive.ts` | demo thread/actions | `/support-messages`, support APIs depending implementation | Yes/fallback | local demo fallback | REPLACE |
| `lib/role-intelligence/roleIntelligence.ts` | Maya/Jaylen-like role recommendations/scenarios | `RoleDashboardExperience` | Yes | static intelligence copy | REPLACE |
| `lib/permissions/rolePermissions.ts` | Maya/Coach Taylor sample relationships | permission demos if imported | Potential | sample relationship data | REVIEW REQUIRED |
| `lib/action-routing/actionRouting.ts` | Maya action messages | action-routing route/components | Potential | static action-routing demo | REVIEW REQUIRED |
| `lib/collaboration/collaborationLayer.ts` | Maya collaboration scenario | collaboration route/components | Potential | static demo layer | REVIEW REQUIRED |
| `lib/support-network/supportNetwork.ts` | Maya support network | support network screen if imported | Potential | static model/demo data | REVIEW REQUIRED |
| `lib/workflows/supportWorkflow.ts` | Maya workflow | workflow screens | Potential | static workflow demo | REVIEW REQUIRED |
| `lib/demo/demoMode.ts` | `demo-learner-maya-johnson` | `/demo` family routes | Demo route | intended demo mode | REVIEW REQUIRED; isolate from production nav |
| `app/portfolio/[shareId]/page.tsx` | `scholarName: Maya Johnson` | `/portfolio/[shareId]` | Yes for any share route | hardcoded portfolio share fallback | REPLACE |
| `app/recommenders/[requestId]/page.tsx` | Coach Taylor/Maya demo request | recommender request route | Yes | hardcoded recommender request fallback | REPLACE |
| `app/leaderboard/page.tsx` | Jordan Miles and other hardcoded leaders | `/leaderboard` | Yes | static leaderboard | REPLACE |
| `app/feed/page.tsx` | Jordan M. leaderboard constants | `/feed` | Yes | static feed leaderboard/sidebar | REPLACE |
| `app/connections/page.tsx.before-live-network` | Jordan Miles backup file | not routed | No | historical backup file | REVIEW REQUIRED/remove backup |
| `app/opportunities/page.tsx`, `app/compass/page.tsx` | `demoCourses` arrays | opportunities/compass | Yes | local course demo props | REPLACE |
| `lib/supabaseClient.ts` | placeholder Supabase URL/key | all client Supabase importers when env missing | Build/runtime fallback | build-safe placeholder | REVIEW REQUIRED; must not masquerade as data |

## Maya retirement explanation

Maya was likely previously reported as retired because the explicit `/demo` route and `lib/demo/demoMode.ts` were recognized as demo-only content. That did not retire Maya from active production runtime because Maya also exists in non-demo libraries consumed by live pages: `lib/role-os/roleDashboards.ts`, `lib/messages/conversationEngine.ts`, `components/messages/InboxV2.tsx`, `components/support-network-live/SupportNetworkLiveCenter.tsx`, and support/role-intelligence libraries.

## Exact current Maya render sources

- `/messages` and `/messages/[threadId]`: `InboxV2` uses `getDemoConversations()`/`getDemoConversationMessages()` and sends new messages as `Maya`.
- `/support-messages`: `SupportNetworkLiveCenter` initializes with demo thread/actions and uses `scholar-maya` for API calls.
- `/family-os` and `/mentor-os`: static role dashboard action strings include Maya references.
- Other Maya sources can render when their corresponding static pages/components are reached, especially portfolio/recommender/collaboration/support workflows.
