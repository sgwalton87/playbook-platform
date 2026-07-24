# Duplicate Analysis

Generated: 2026-07-21

## Scope

This report identifies potential duplicate or overlapping implementations by repository path. It does not declare which implementation is correct or recommend changes.

## Objective duplicate signals

Command evidence from `find app components lib scripts tests docs -type f | awk -F/ '{print $NF}' | sort | uniq -d` showed repeated basenames including:

- `engine.ts`
- `timelineEngine.ts`
- `types.ts`
- `index.ts`
- `academic.ts`
- `achievement.ts`
- `achievements.ts`
- `verification.ts`
- `CollegeSearch.tsx`
- `ScholarTimeline.tsx`
- `page.tsx`
- `route.ts`
- `layout.tsx`
- multiple repeated documentation names such as `README.md`, `ROADMAP.md`, `VISION.md`, and `PLAYBOOK_HISTORY.md`.

Repeated basenames are not automatically defects in a modular project. They are signals for canonical-boundary review.

## Potential overlapping domain implementations

| Domain | Observed paths | Status |
| --- | --- | --- |
| Scholar/Playbook Record | `lib/playbook-record/index.ts`, `lib/playbook/record/index.ts`, `lib/portfolio/scholar-record.ts`, `lib/scholar/record.ts` | Potential overlap. Canonical owner NOT VERIFIED. |
| Trust | `lib/trust/engine.ts`, `lib/engines/trust/trustEngine.ts`, `lib/playbook/trust/index.ts`, `lib/repositories/trustRepository.ts` | Potential layered architecture or duplicate logic. Canonical boundary NOT VERIFIED. |
| Compass | `lib/compass/CompassEngine.ts`, `lib/engines/compass/compassEngine.ts`, `lib/playbook/compass/index.ts` | Potential layered architecture or duplicate logic. Canonical boundary NOT VERIFIED. |
| Opportunities | `lib/opportunities/engine.ts`, `lib/opportunity-graph/engine/OpportunityGraphEngine.ts`, `lib/engines/opportunities/opportunityEngine.ts`, `lib/playbook/opportunities/index.ts`, `lib/repositories/opportunityRepository.ts`, `lib/repositories/opportunityGraphRepository.ts` | Potential layered architecture or duplicate logic. Canonical boundary NOT VERIFIED. |
| Academic Intelligence | `lib/academic-intelligence/engine.ts`, `lib/academic-intelligence/academicIntelligenceEngine.ts`, `lib/engines/academic/academicEngine.ts` | Potential overlap. Canonical boundary NOT VERIFIED. |
| Timeline | `lib/engines/timeline/timelineEngine.ts`, `lib/intelligence-network/timeline/timelineEngine.ts`, `lib/repositories/timelineRepository.ts`, `lib/timeline/builder.ts` | Potential separate contexts or duplicate timeline logic. Canonical boundary NOT VERIFIED. |
| Resume | `lib/opportunity-toolkit/resumeBuilder.ts`, `lib/portfolio/services/resume.ts` | Potential complementary services; dedicated Resume Intelligence canonical boundary NOT VERIFIED. |
| Notifications | `lib/notifications-v2/notificationEngine.ts`, `lib/notification-automation/*`, `lib/event-notifications/*`, `app/api/notifications/route.ts` | Potential layered architecture; canonical boundary NOT VERIFIED. |

## Backup artifacts inside active tooling scope

Lint output proves `.playbook-backups/20260701_181912_types.ts` is inside ESLint scope and contains a parse error. Backup page files under `scripts/backups/*` also appear in lint output. This is an objective quality/tooling duplicate-scope finding, not an implementation recommendation.

## Conclusion

Duplicate status is **NOT VERIFIED** as defect-level duplication. The repository contains multiple overlapping paths per major domain, but the missing governance manifest and Integration Matrix prevent authoritative canonical-owner classification.

