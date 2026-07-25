# Mentor Intelligence

## Purpose
Specify the existing mentoring/support capabilities and safe evolution toward explainable mentor discovery and coordinated support.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 25, 2026

## Related Documents
- [Intelligence architecture](./ARCHITECTURE.md)
- [Canonical Student Record](./CANONICAL_STUDENT_RECORD.md)
- [Recommendation Letters](./RECOMMENDATION_LETTERS.md)

## Mission and Purpose
Strengthen a Scholar's chosen support network by making relevant, safe human help easier to discover, authorize, coordinate, and evaluate. Intelligence supports relationships; it does not simulate or replace a mentor.

## Repository Status — Partially Implemented

### Already Implemented
- **Database:** `support_relationships`, `support_invitations`, `support_directory_profiles`, `support_messages`, and `shared_actions`, with RLS in their migrations.
- **APIs:** [`app/api/mentor-directory/route.ts`](../../app/api/mentor-directory/route.ts) and support-network summary/message/action handlers.
- **Domain:** [`lib/support-relationships/`](../../lib/support-relationships/), [`lib/support-network-live/`](../../lib/support-network-live/), permissions and network intelligence.
- **UI/components:** mentor/mentorship/connect, connections, messages, invitations, support-network pages and corresponding components.
- **Current inputs/outputs:** directory profile, role, relationship, goals/blockers and availability can produce invitations, relationships, messages, shared actions and notifications.

## Current Capabilities and Limitations
The repository supports directory discovery and relationship workflows. Role-aware permissions distinguish mentor support from verification or partner access. However, [`lib/support-network/supportNetwork.ts`](../../lib/support-network/supportNetwork.ts) still returns a static demonstration graph, and no complete mentor-fit scoring, safeguarding lifecycle, capacity, conflict, feedback, or matching explanation contract is evidenced.

## Required Extensions
- Build on directory and relationship tables; do not create a second connection graph.
- Define explainable candidate filtering from scholar-stated goals, expertise, availability, geography/modalities, safety eligibility and capacity.
- Require Scholar invitation/acceptance controls, guardian/organizational approval where policy requires, easy decline/block/report/end actions, and least-privilege record views.
- Route goals and actions through existing shared actions/events/notifications.

## Engineering Readiness

| Area | Specification |
|---|---|
| Dependencies | Auth/roles, directory, relationships, permissions, trust/moderation, messages/actions, notifications, Scholar goals. |
| Complexity | High because safety and relationship governance exceed ranking complexity. |
| Risks | Unsafe contact, boundary violations, biased matching, overload, sensitive Record disclosure, replacement of existing supporters. |
| Validation | Safeguarding/legal review, RLS/abuse tests, match-reason review, capacity tests, block/report/end-to-end tests, equity/access audit. |
| Success metrics | Accepted mutual matches, relationship retention/health, action follow-through, response time, safety incidents, equitable access. |

## Future Vision
Network intelligence can identify a missing kind of support and suggest either an existing trusted person or eligible directory candidates. It must prefer strengthening current relationships, show why help may be useful, and let the Scholar choose no action.

