# Playbook Implementation Backlog

This root backlog is consolidated from the current Master Build Checklist and repository inspection. It is dependency-ordered so foundation and launch-gate work happen before feature expansion. Completed work is intentionally excluded from the active backlog.

## P0 — Release-Gate Foundation

### Validation, Build, and QA Gates

- Restore a clean production build by configuring or guarding the Resend dependency used by `/api/notify-admin` so page data collection does not fail without local secrets.
- Define and run role-by-role end-to-end QA for Scholar, Scholar-Athlete, Mentor, Founder, and every remaining registry role before moving related checklist items beyond In Progress or Testing.
- Complete desktop, tablet, mobile, accessibility, performance, security, and RLS validation for the Final Release Checklist.
- Add production database, storage, backup, monitoring, and error-logging validation before soft launch.

#### Completed Validation Debt

- ✅ **Resolved July 27, 2026:** Repo-wide lint failures previously caused by the checked-in backup parse error and high-volume `no-explicit-any` violations no longer block the release gate. `npm run lint` now completes successfully with no reported ESLint violations.

#### Active RLS and Authorization Debt

- **Missing RLS policies:** Complete deployed-catalog reconciliation and add reviewed, operation-specific policies for sensitive tables, views, functions, and storage objects that lack owner, delegated, organization, visibility, age, consent, and lifecycle enforcement.
- **Missing relationship tables and semantics:** Canonicalize status, scope, verification, expiry, revocation, consent linkage, and organization provenance for existing relationships; define currently unsupported coach, recruiting, admissions, brand, counselor, Transition-Aged Youth, and community access before granting it.
- **Missing audit events:** Add append-oriented evidence for role and permission changes, organization membership, relationships, consent, protected delegated access, administrative actions, service-role operations, moderation, export, correction, deletion, and authorization denials required for monitoring.
- **Missing permission schemas:** Establish authoritative schemas for approved roles, relationship permissions, organization membership, consent, age-policy state, visibility, and administrative purpose without relying on client-supplied roles or route destinations.
- **Missing authorization tests:** Implement positive and negative owner, non-owner, delegated, expired, revoked, public/private, cross-organization, youth, administrator, intelligence-inheritance, and lifecycle scenarios defined in the PBOS RLS validation matrix.
- **Missing service-role controls:** Review all 22 documented `SUPABASE_SERVICE_ROLE_KEY` API routes, replace bypass with user-context RLS where possible, and require explicit caller authorization, bounded access, idempotency where relevant, data minimization, and audit logging for remaining privileged workflows.

### Role Registry, Permissions, and Navigation

- Reconcile every user-facing role in the Role Registry with implemented routes, role selection options, side navigation, OS dashboards, and permission checks.
- Implement a centralized role-permission matrix that gates dashboards, profile visibility, messaging, network actions, opportunities, admin/founder tools, and support-role workflows.
- Add tests for role normalization, route access, sidebar visibility, and permission-denied states.
- Fix Role OS permission gaps identified by the Role OS audit before any Operating Systems phase item is marked Complete.

### Onboarding Foundation

- Reconcile onboarding pathways against the Role Registry and Onboarding Audit so every launch role has a complete onboarding path or an explicitly blocked launch decision.
- Fix Onboarding OS redirects so completed onboarding reliably lands each role in the correct OS/dashboard.
- Add dynamic user agreement capture to onboarding, including persistence and acceptance auditability.
- Validate onboarding autosave, profile creation, public profile generation, and failure recovery end to end.

### Authentication and Email Readiness

- Complete authentication security testing, including session handling, close-browser logout behavior, CAPTCHA enforcement, PKCE callback behavior, and unauthorized-route access.
- Complete authentication mobile testing across supported mobile browsers.
- Validate Hostinger/resend email delivery, email verification, password reset, invite handoff, and production email templates.

## P1 — Core User Workflows

### Public Profile and Private Editing

- Finish private profile editing permissions and persistence for avatar, cover photo, username, biography, activities, athletics, transcript, schools, certificates, badges, XP, coins, connections, timeline, and privacy settings.
- Extract profile UI into maintainable components that remain relevant from the previous backlog:
  - AcademicCard
  - BadgesCard
  - CertificatesCard
  - FeedComposer
  - FeedList
  - GalleryGrid
  - ActivityTimeline
- Validate public profile links and private/public visibility rules across role types.

### Network

- Complete user search, suggested users, mutual connections, public profile links, network notifications, and network-to-messaging integration.
- Validate the full connection lifecycle across persistence, permissions, notifications, and end-to-end user flows.

### Messaging and Safety

- Complete direct messages, group messages, conversation search, attachments, read receipts, message notifications, block user, report user, and meeting links.
- Connect messaging safety actions to the centralized permissions and moderation model.
- Validate support-message and role-based messaging flows end to end.

### Feed and Timeline

- Complete real author identity, create post, image/video posts, comments, likes, shares, edit/delete post, profile links, timeline visibility, infinite scroll, and feed moderation.
- Validate feed persistence, permissions, media storage, moderation, and profile timeline integration.

## P2 — Product Feature Completion

### Courses and Learning

- Complete course search, course detail, module completion, progress tracking, reflections, quizzes, XP rewards, coin rewards, certificates, Community Safety Course, and Athletes Abroad Course.
- Validate learning progress persistence, reward issuance, certificate generation, and permissions.

### Academic and Applications

- Complete transcript parsing, FAFSA tracker, scholarships, dream/top schools, application deadlines, application tracker, academic readiness, and Compass recommendations.
- Validate transcript upload/parsing, A-G tracking, college search, recommendation flows, and application workflows end to end.

### Recruiting

- Complete athlete profile, film, measurements, statistics, eligibility, coach connections, recruiter search, college targets, visits, offers, recruiting timeline, and NIL readiness.
- Validate recruiting permissions for athletes, families/support roles, coaches, recruiters, and admissions users.

### Events

- Complete browse events, event detail, RSVP, calendar integration, reminders, QR check-in, event networking, replay library, and summit events.
- Validate RSVP persistence, reminder notifications, attendance/check-in, networking, and replay access.

### Brand Partner Marketplace and Opportunities

- Complete organization profiles, campaign builder, rewards, internships, jobs, sponsorships, NIL opportunities, scholarships, mentorship, opportunity applicants, opportunity tracking, and compliance review.
- Validate marketplace permissions, applicant tracking, compliance review, reward fulfillment, and partner workflows.

### Athletes Abroad Hub

- Complete Go Abroad, Living Abroad, Life After Sport, global athlete profile, career history, country channels, sport channels, Global Locker Room, summit integration, summit meetings, meetups, housing, healthcare, tax, contract resources, and alumni network.
- Validate enrollment, resources, channel access, summit workflows, and alumni networking.

## P3 — Intelligence, Admin, and Optimization

### Founder Dashboard and Platform Operations

- Complete project intelligence, analytics, user management, verification, moderation, feature flags, bug tracking, release management, architecture viewer, documentation center, content review, and system health.
- Ensure Founder/Admin tools are gated by centralized role permissions and covered by tests.

### Portfolio and Scholar Record

- Replace placeholder Portfolio DNA values with live calculations.
- Implement live opportunity calculations.
- Integrate resume generation with the portfolio experience.
- Integrate timeline data with portfolio and public profile surfaces.
- Complete Scholar Record engines that remain relevant from the previous backlog:
  - Verification engine
  - Recommendation engine
  - Achievement engine

### AI and Recommendations

- Complete Compass AI implementation.
- Complete Portfolio Intelligence.
- Complete personalized recommendations across profile, academic, opportunity, course, and role-specific OS contexts.

### Performance and Maintainability

- Cache portfolio calculations.
- Optimize Supabase queries across feed, profile, network, messaging, courses, and marketplace flows.
- Lazy load gallery/media-heavy profile sections.
- Complete image optimization for profile, feed, course, opportunity, and gallery media.
