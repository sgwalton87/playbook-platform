# Route Audit

## Purpose
Classify App Router pages and route handlers for controlled integration.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Architecture Canon](../ARCHITECTURE_CANON.md)
- [Repository Canon](../REPOSITORY_CANON.md)
- [Component Consolidation](./COMPONENT_CONSOLIDATION.md)

## Route Classification Summary
| Classification | Routes |
| --- | --- |
| Production | `/`, `/home`, `/dashboard`, `/profile`, `/record`, `/portfolio/[shareId]`, `/opportunities`, `/messages`, `/notifications`, `/support-network`, `/application-workspaces`, `/community-events`, `/courses`, `/courses/[slug]`, `/tutorial`, `/login`, `/auth/callback`, `/reset-password`, `/check-email`, `/start`, `/role-select`, `/pending`, `/u/[username]` |
| Internal | `/admin`, `/admin/moderation`, `/studio`, `/studio/*`, API admin/moderation, PBOS/studio inspection routes |
| Experimental | `/intelligence-platform`, `/network-intelligence`, `/role-intelligence`, `/living-scholar`, `/compass`, `/gamification`, `/economy`, `/reward-economy`, `/store-v2`, `/opportunity-toolkit`, `/recommenders`, `/recommenders/[requestId]` |
| Demo | `/demo`, `/demo/founder-case-study`, `/founder`, course demo routes, founder archive media consumers |
| Deprecated / Duplicate Candidate | `/mentor-connect` vs `/mentorship`, `/support-messages` vs `/messages`, `/store` vs `/store-v2`, `/portfolio` missing page but has dynamic share route, role OS route variants such as `/scholar-athlete-os`, `/athlete-abroad-os`, `/family-os`, `/mentor-os`, `/educator-os`, `/employer-os`, `/district-os`, `/university-os`, `/brand-partner-os` |
| Planned Scaffold / Implement | `/academic-readiness`, `/action-routing`, `/albums`, `/badges`, `/certificates`, `/collaboration`, `/connections`, `/events`, `/feed`, `/invitations`, `/invite/[token]`, `/journey`, `/leaderboard`, `/permissions`, `/scholar-network`, `/transcript`, `/workflows` |

## API Route Classification
- Production API: auth-adjacent callbacks, notifications, support network, portfolio shares, application workspaces, social interactions, trust, community events, mail gateway, invitations.
- Internal API: admin moderation and operational notification routes.
- Experimental API: AI/ZAI, recommender request, rewards/store automation until release gates harden.

## Routing Cleanup Rules
1. Do not delete routes automatically.
2. Preserve production routes during integration.
3. Put experimental routes behind clear navigation or internal access policy before launch.
4. Consolidate duplicate route pairs only after analytics/import references are checked.
5. Keep Studio as internal tooling and prevent production dependencies on Studio-only components.
