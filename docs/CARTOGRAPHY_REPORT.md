# Cartography Report

Playbook Cartographer inspection completed on 2026-07-21 after repository verification. This is documentation only; no code was modified.

## Canonical docs read
- `docs/PLAYBOOK_CONSTITUTION.md`
- `docs/PLAYBOOK_BIBLE.md`
- `docs/ADR/ADR-0001-Playbook-Record.md` through `docs/ADR/ADR-0005-Playbook-Graph.md` plus `docs/ADR/ADR_LOG.md`

Missing requested root docs: `docs/ENGINEERING_PRINCIPLES.md`, `docs/CODEX_ENGINEERING_CONTRACT.md`, `docs/VERIFICATION_STANDARD.md`, `docs/INTEGRATION_MATRIX.md`, `docs/SPRINT_BACKLOG.md`.

## Verification summary
- Files cataloged: 1115 non-node_modules/non-.git files.
- Pages: 94; API routes: 32; components: 111; tests: 88; migrations: 18.

## Duplicate and competing implementation detector

### `academic` (4)
- `lib/engines/academic/academicEngine.ts`
- `lib/events/handlers/academic.ts`
- `lib/portfolio/services/academic.ts`
- `lib/repositories/academicRepository.ts`

### `achievement` (2)
- `lib/portfolio/services/achievement.ts`
- `lib/scholar/models/achievement.ts`

### `achievements` (3)
- `lib/events/handlers/achievements.ts`
- `lib/playbook-record/services/achievements.ts`
- `lib/scholar/modules/achievements.ts`

### `applicationworkspace` (2)
- `components/application-workspace/ApplicationWorkspaceDashboard.tsx`
- `lib/application-workspace/applicationWorkspace.ts`

### `badges` (2)
- `app/lib/badges.ts`
- `lib/badges.ts`

### `beta34` (2)
- `components/beta34/Beta34Dashboard.tsx`
- `lib/beta34/beta34.ts`

### `cartographer` (2)
- `lib/cartographer/CartographerEngine.ts`
- `scripts/cartographer.ts`

### `collaborationlayer` (2)
- `components/collaboration/CollaborationLayer.tsx`
- `lib/collaboration/collaborationLayer.ts`

### `collegesearch` (2)
- `components/CollegeSearch.tsx`
- `components/college/CollegeSearch.tsx`

### `compass` (3)
- `lib/compass/CompassEngine.ts`
- `lib/engines/compass/compassEngine.ts`
- `lib/events/handlers/compass.ts`

### `corejourney` (2)
- `components/core-journey/CoreJourneyDashboard.tsx`
- `lib/core-journey/coreJourney.ts`

### `demodirector` (2)
- `components/studio/tools/DemoDirector.tsx`
- `lib/studio/tools/demoDirector.ts`

### `demomode` (2)
- `components/demo/DemoMode.tsx`
- `lib/demo/demoMode.ts`

### `eventmonitor` (2)
- `components/studio/tools/EventMonitor.tsx`
- `lib/studio/tools/eventMonitor.ts`

### `gamification` (2)
- `lib/gamification.ts`
- `lib/gamification/gamificationEngine.ts`

### `goal` (2)
- `lib/compass/GoalEngine.ts`
- `lib/intelligence-network/goals/goalEngine.ts`

### `intelligenceinspector` (2)
- `components/studio/tools/IntelligenceInspector.tsx`
- `lib/studio/tools/intelligenceInspector.ts`

### `learnersimulator` (2)
- `components/studio/tools/LearnerSimulator.tsx`
- `lib/studio/tools/learnerSimulator.ts`

### `ledger` (2)
- `lib/ledger/LedgerEngine.ts`
- `scripts/ledger.ts`

### `networkintelligence` (2)
- `components/network-intelligence/NetworkIntelligenceDashboard.tsx`
- `lib/network-intelligence/networkIntelligence.ts`

### `opportunity` (3)
- `lib/engines/opportunities/opportunityEngine.ts`
- `lib/portfolio/services/opportunity.ts`
- `lib/repositories/opportunityRepository.ts`

### `opportunitygraph` (4)
- `components/opportunity-graph/OpportunityGraphCard.tsx`
- `lib/events/handlers/opportunityGraph.ts`
- `lib/opportunity-graph/engine/OpportunityGraphEngine.ts`
- `lib/repositories/opportunityGraphRepository.ts`

### `portfolio` (3)
- `components/portfolio/PortfolioEngine.tsx`
- `lib/engines/portfolio/portfolioEngine.ts`
- `lib/events/handlers/portfolio.ts`

### `recommendation` (3)
- `lib/compass/RecommendationEngine.ts`
- `lib/intelligence-platform/recommendations/recommendationEngine.ts`
- `lib/portfolio/services/recommendation.ts`

### `recommenderworkflow` (2)
- `components/recommenders/RecommenderWorkflowDashboard.tsx`
- `lib/recommenders/recommenderWorkflow.ts`

### `roleos` (2)
- `components/role-os/RoleOSDashboard.tsx`
- `lib/role-os/roleOS.ts`

### `route` (32)
- `app/api/admin/moderation/route.ts`
- `app/api/ai/zai/route.ts`
- `app/api/albums/photos/route.ts`
- `app/api/albums/route.ts`
- `app/api/application-workspaces/route.ts`
- `app/api/brand-partners/campaigns/route.ts`
- `app/api/community-events/route.ts`
- `app/api/community-events/rsvp/route.ts`
- `app/api/events/emit/route.ts`
- `app/api/guided-tour/progress/route.ts`
- `app/api/invitations/accept/route.ts`
- `app/api/invitations/send/route.ts`
- `app/api/mail-gateway/hostinger/route.ts`
- `app/api/mentor-directory/route.ts`
- `app/api/notifications/route.ts`
- `app/api/notify-admin/route.ts`
- `app/api/notify-guardian/route.ts`
- `app/api/parse-transcript/route.ts`
- `app/api/portfolio/pdf/route.tsx`
- `app/api/portfolio/shares/route.ts`
- `app/api/recommenders/request/route.ts`
- `app/api/rewards/balance/route.ts`
- `app/api/rewards/emit/route.ts`
- `app/api/social/comments/route.ts`
- `app/api/social/reactions/route.ts`
- `app/api/store/redemptions/route.ts`
- `app/api/support-network/actions/route.ts`
- `app/api/support-network/messages/route.ts`
- `app/api/support-network/summary/route.ts`
- `app/api/trust/block/route.ts`
- `app/api/trust/mute/route.ts`
- `app/api/trust/report/route.ts`

### `scholartimeline` (2)
- `components/living-scholar/ScholarTimeline.tsx`
- `components/timeline/ScholarTimeline.tsx`

### `sentinel` (2)
- `lib/sentinel/SentinelEngine.ts`
- `scripts/sentinel.ts`

### `store` (2)
- `lib/store-v2/storeEngine.ts`
- `lib/store.ts`

### `studio` (2)
- `components/studio/StudioCard.tsx`
- `components/studio/StudioDashboard.tsx`

### `timeline` (5)
- `lib/engines/timeline/timelineEngine.ts`
- `lib/events/handlers/timeline.ts`
- `lib/intelligence-network/timeline/timelineEngine.ts`
- `lib/portfolio/services/timeline.ts`
- `lib/repositories/timelineRepository.ts`

### `trust` (3)
- `lib/engines/trust/trustEngine.ts`
- `lib/events/handlers/trust.ts`
- `lib/repositories/trustRepository.ts`

### `types` (12)
- `lib/academic-intelligence/types.ts`
- `lib/compass/types.ts`
- `lib/events/types.ts`
- `lib/intelligence/types.ts`
- `lib/opportunities/types.ts`
- `lib/opportunity-graph/types.ts`
- `lib/oracle/types.ts`
- `lib/portfolio/types.ts`
- `lib/scholar-athlete/types.ts`
- `lib/scholar/types.ts`
- `lib/timeline/types.ts`
- `lib/trust/types.ts`

### `verification` (2)
- `lib/portfolio/services/verification.ts`
- `lib/scholar/models/verification.ts`

## Dead/obsolete indicators verified by filename
- `app/connections/page.tsx.before-live-network`
- `app/courses/[slug]/page.pre-detail-redesign.backup.tsx`
- `app/courses/page.backup.tsx`
- `app/courses/page.pre-schema-redesign.backup.tsx`
- `app/u/[username]/page.tsx.backup`
- `archives/Volume-I-Playbook-Series-Inc/01_Organization/00_Preface.md`
- `archives/Volume-I-Playbook-Series-Inc/01_Organization/01_Founding_Story.md`
- `archives/Volume-I-Playbook-Series-Inc/01_Organization/02_Mission.md`
- `archives/Volume-I-Playbook-Series-Inc/01_Organization/03_Vision.md`
- `archives/Volume-I-Playbook-Series-Inc/01_Organization/04_Core_Values.md`
- `archives/Volume-I-Playbook-Series-Inc/01_Organization/05_Theory_of_Change.md`
- `archives/Volume-I-Playbook-Series-Inc/02_History/2020.md`
- `archives/Volume-I-Playbook-Series-Inc/02_History/2021.md`
- `archives/Volume-I-Playbook-Series-Inc/02_History/2022.md`
- `archives/Volume-I-Playbook-Series-Inc/02_History/2023.md`
- `archives/Volume-I-Playbook-Series-Inc/02_History/2024.md`
- `archives/Volume-I-Playbook-Series-Inc/02_History/2025.md`
- `archives/Volume-I-Playbook-Series-Inc/02_History/2026.md`
- `archives/Volume-I-Playbook-Series-Inc/03_Leadership/Advisors.md`
- `archives/Volume-I-Playbook-Series-Inc/03_Leadership/Board.md`
- `archives/Volume-I-Playbook-Series-Inc/03_Leadership/Executive_Leadership.md`
- `archives/Volume-I-Playbook-Series-Inc/03_Leadership/Founder.md`
- `archives/Volume-I-Playbook-Series-Inc/04_Programs/Career_Readiness.md`
- `archives/Volume-I-Playbook-Series-Inc/04_Programs/College_Readiness.md`
- `archives/Volume-I-Playbook-Series-Inc/04_Programs/Financial_Literacy.md`
- `archives/Volume-I-Playbook-Series-Inc/04_Programs/Leadership.md`
- `archives/Volume-I-Playbook-Series-Inc/04_Programs/Playbook_Platform.md`
- `archives/Volume-I-Playbook-Series-Inc/04_Programs/Tiger_Tank.md`
- `archives/Volume-I-Playbook-Series-Inc/05_Community/Impact.md`
- `archives/Volume-I-Playbook-Series-Inc/05_Community/Partners.md`
- `archives/Volume-I-Playbook-Series-Inc/05_Community/Schools.md`
- `archives/Volume-I-Playbook-Series-Inc/06_Governance/Articles.md`
- `archives/Volume-I-Playbook-Series-Inc/06_Governance/Bylaws.md`
- `archives/Volume-I-Playbook-Series-Inc/06_Governance/Policies.md`
- `archives/Volume-I-Playbook-Series-Inc/07_Platform/Platform_Origin.md`
- `archives/Volume-I-Playbook-Series-Inc/07_Platform/Portfolio_Engine.md`
- `archives/Volume-I-Playbook-Series-Inc/07_Platform/Scholar_Record.md`
- `archives/Volume-I-Playbook-Series-Inc/08_Reference/Glossary.md`
- `archives/Volume-I-Playbook-Series-Inc/08_Reference/Organization_Profile.md`
- `archives/Volume-I-Playbook-Series-Inc/08_Reference/Timeline.md`
- `archives/Volume-I-Playbook-Series-Inc/09_Media/Photos.md`
- `archives/Volume-I-Playbook-Series-Inc/09_Media/Press.md`
- `archives/Volume-I-Playbook-Series-Inc/09_Media/Speeches.md`
- `archives/Volume-I-Playbook-Series-Inc/README.md`
- `backups/dashboard.page.backup.tsx`
- `backups/dashboard.page.before-appshell.tsx`
- `backups/profile.page.backup.tsx`
- `components/AppShell.tsx.before-role-nav`
- `components/shell/UnifiedAppShell.tsx.before-role-nav`
- `docs/DECISIONS/ADR-0004-Company-Archive.md`
- `docs/DEPRECATED/DESIGN_SYSTEM.md`
- `docs/DEPRECATED/ENGINEERING_ARCHITECTURE.md`
- `docs/DEPRECATED/OLD_DATA_MODEL.md`
- `docs/DEPRECATED/OLD_EVENT_CATALOG.md`
- `docs/DEPRECATED/OLD_REPOSITORY_CATALOG.md`
- `docs/DEPRECATED/RELEASES_README.md`
- `docs/DEPRECATED/SPRINTS_README.md`
- `docs/archives/2026-07-07-implementation-archive.md`
- `public/demo/founder-archive/clean-contact-sheet.jpg`
- `public/demo/founder-archive/clean/founder-archive-01.png`
- `public/demo/founder-archive/clean/founder-archive-02.png`
- `public/demo/founder-archive/clean/founder-archive-03.png`
- `public/demo/founder-archive/clean/founder-archive-04.png`
- `public/demo/founder-archive/clean/founder-archive-05.png`
- `public/demo/founder-archive/clean/founder-archive-06.png`
- `public/demo/founder-archive/clean/founder-archive-07.png`
- `public/demo/founder-archive/clean/founder-archive-08.png`
- `public/demo/founder-archive/clean/founder-archive-09.png`
- `public/demo/founder-archive/clean/founder-archive-10.png`
- `public/demo/founder-archive/clean/founder-archive-11.png`
- `public/demo/founder-archive/clean/founder-archive-12.png`
- `public/demo/founder-archive/clean/founder-archive-13.png`
- `public/demo/founder-archive/clean/founder-archive-14.png`
- `public/demo/founder-archive/clean/founder-archive-15.png`
- `public/demo/founder-archive/clean/founder-archive-16.png`
- `public/demo/founder-archive/clean/founder-archive-17.png`
- `public/demo/founder-archive/clean/founder-archive-18.png`
- `public/demo/founder-archive/clean/founder-archive-19.png`
- `public/demo/founder-archive/clean/founder-archive-20.png`
- `public/demo/founder-archive/clean/founder-archive-21.png`
- `public/demo/founder-archive/clean/founder-archive-22.png`
- `public/demo/founder-archive/clean/founder-archive-23.png`
- `public/demo/founder-archive/clean/founder-archive-24.png`
- `public/demo/founder-archive/clean/founder-archive-25.png`
- `public/demo/founder-archive/clean/founder-archive-26.png`
- `public/demo/founder-archive/clean/founder-archive-27.png`
- `public/demo/founder-archive/clean/founder-archive-28.png`
- `public/demo/founder-archive/clean/founder-archive-29.png`
- `public/demo/founder-archive/clean/founder-archive-30.png`
- `public/demo/founder-archive/clean/founder-archive-31.png`
- `public/demo/founder-archive/clean/founder-archive-32.png`
- `public/demo/founder-archive/clean/founder-archive-33.png`
- `public/demo/founder-archive/clean/founder-archive-34.png`
- `public/demo/founder-archive/clean/founder-archive-35.png`
- `public/demo/founder-archive/clean/founder-archive-36.png`
- `public/demo/founder-archive/contact-sheet.jpg`
- `public/demo/founder-archive/founder-archive-01.jpeg`
- `public/demo/founder-archive/founder-archive-02.jpeg`
- `public/demo/founder-archive/founder-archive-03.jpeg`
- `public/demo/founder-archive/founder-archive-04.jpeg`
- `public/demo/founder-archive/founder-archive-05.jpeg`
- `public/demo/founder-archive/founder-archive-06.jpeg`
- `public/demo/founder-archive/founder-archive-07.jpeg`
- `public/demo/founder-archive/founder-archive-08.jpeg`
- `public/demo/founder-archive/founder-archive-09.jpeg`
- `public/demo/founder-archive/founder-archive-10.jpeg`
- `public/demo/founder-archive/founder-archive-11.jpeg`
- `public/demo/founder-archive/founder-archive-12.jpeg`
- `public/demo/founder-archive/founder-archive-13.jpeg`
- `public/demo/founder-archive/founder-archive-14.jpeg`
- `public/demo/founder-archive/founder-archive-15.jpeg`
- `public/demo/founder-archive/founder-archive-16.jpeg`
- `public/demo/founder-archive/founder-archive-17.jpeg`
- `public/demo/founder-archive/founder-archive-18.jpeg`
- `public/demo/founder-archive/founder-archive-19.jpeg`
- `public/demo/founder-archive/founder-archive-20.jpeg`
- `public/demo/founder-archive/founder-archive-21.jpeg`
- `public/demo/founder-archive/founder-archive-22.jpeg`
- `public/demo/founder-archive/founder-archive-23.jpeg`
- `public/demo/founder-archive/founder-archive-24.jpeg`
- `public/demo/founder-archive/founder-archive-25.jpeg`
- `public/demo/founder-archive/founder-archive-26.jpeg`
- `public/demo/founder-archive/founder-archive-27.jpeg`
- `public/demo/founder-archive/founder-archive-28.jpeg`
- `public/demo/founder-archive/founder-archive-29.jpeg`
- `public/demo/founder-archive/founder-archive-30.jpeg`
- `public/demo/founder-archive/founder-archive-31.jpeg`
- `public/demo/founder-archive/founder-archive-32.jpeg`
- `public/demo/founder-archive/founder-archive-33.jpeg`
- `public/demo/founder-archive/founder-archive-34.jpeg`
- `public/demo/founder-archive/founder-archive-35.jpeg`
- `public/demo/founder-archive/founder-archive-36.jpeg`
- `public/demo/founder-archive/special/founder-archive-03.png`
- `public/demo/founder-archive/special/founder-archive-09.png`
- `public/demo/founder-archive/special/founder-archive-10.png`
- `public/demo/founder-archive/special/founder-archive-26.png`
- `public/demo/founder-archive/special/founder-archive-34.png`
- `public/demo/founder-archive/special/founder-archive-35.png`
- `public/demo/founder-archive/transparent-contact-sheet.jpg`
- `public/demo/founder-archive/transparent/founder-archive-01.png`
- `public/demo/founder-archive/transparent/founder-archive-02.png`
- `public/demo/founder-archive/transparent/founder-archive-03.png`
- `public/demo/founder-archive/transparent/founder-archive-04.png`
- `public/demo/founder-archive/transparent/founder-archive-05.png`
- `public/demo/founder-archive/transparent/founder-archive-06.png`
- `public/demo/founder-archive/transparent/founder-archive-07.png`
- `public/demo/founder-archive/transparent/founder-archive-08.png`
- `public/demo/founder-archive/transparent/founder-archive-09.png`
- `public/demo/founder-archive/transparent/founder-archive-10.png`
- `public/demo/founder-archive/transparent/founder-archive-11.png`
- `public/demo/founder-archive/transparent/founder-archive-12.png`
- `public/demo/founder-archive/transparent/founder-archive-13.png`
- `public/demo/founder-archive/transparent/founder-archive-14.png`
- `public/demo/founder-archive/transparent/founder-archive-15.png`
- `public/demo/founder-archive/transparent/founder-archive-16.png`
- `public/demo/founder-archive/transparent/founder-archive-17.png`
- `public/demo/founder-archive/transparent/founder-archive-18.png`
- `public/demo/founder-archive/transparent/founder-archive-19.png`
- `public/demo/founder-archive/transparent/founder-archive-20.png`
- `public/demo/founder-archive/transparent/founder-archive-21.png`
- `public/demo/founder-archive/transparent/founder-archive-22.png`
- `public/demo/founder-archive/transparent/founder-archive-23.png`
- `public/demo/founder-archive/transparent/founder-archive-24.png`
- `public/demo/founder-archive/transparent/founder-archive-25.png`
- `public/demo/founder-archive/transparent/founder-archive-26.png`
- `public/demo/founder-archive/transparent/founder-archive-27.png`
- `public/demo/founder-archive/transparent/founder-archive-28.png`
- `public/demo/founder-archive/transparent/founder-archive-29.png`
- `public/demo/founder-archive/transparent/founder-archive-30.png`
- `public/demo/founder-archive/transparent/founder-archive-31.png`
- `public/demo/founder-archive/transparent/founder-archive-32.png`
- `public/demo/founder-archive/transparent/founder-archive-33.png`
- `public/demo/founder-archive/transparent/founder-archive-34.png`
- `public/demo/founder-archive/transparent/founder-archive-35.png`
- `public/demo/founder-archive/transparent/founder-archive-36.png`
- `scripts/backup.sh`
- `scripts/backups/20260701_171213_page.tsx`
- `scripts/backups/20260701_171317_page.tsx`
- `scripts/backups/20260701_171442_page.tsx`
- `scripts/media/clean-founder-archive-pillow.py`