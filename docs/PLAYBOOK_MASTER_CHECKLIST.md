# PLAYBOOK OS — MASTER BUILD CHECKLIST

**Overall completion:** 36%
**Last updated:** 2026-07-22T00:00:00.000Z

**Auto-build control:** `docs/sprints/AUTO_BUILD_CONTROL_BOARD.md` and `docs/sprints/AUTO_BUILD_QUEUE.json`

## Status legend

- ⬜ Not Started
- 🟨 In Progress
- 🟦 Testing
- 🟩 Complete
- 🟥 Needs Fix

## Definition of Done

A task may be marked complete only after its interface, persistence, permissions, integrations, tests, build, and end-to-end workflow have been validated.

# Phase 1 — Identity & Authentication

**Status:** 🟨 in progress
**Completion:** 41%

- 🟦 Login
- 🟦 Signup
- 🟦 Google Login
- 🟨 Password Reset
- 🟦 Remember Me
- 🟦 Logout
- 🟦 Session Timeout
- 🟦 Close Browser Logout
- 🟦 CAPTCHA
- 🟦 PKCE
- 🟨 Email Verification
- 🟨 Hostinger Email
- 🟨 Email Templates
- 🟦 Role Selection
- ⬜ Authentication Security Testing
- ⬜ Authentication Mobile Testing

Notes: Auth interfaces and Supabase flows are present, including login/signup, OAuth, saved email, session timeout, close-browser logout, CAPTCHA, PKCE-style callback routes, and role selection. Items remain below Complete because the Definition of Done still requires full permissions, integration, build, and end-to-end validation evidence. Hostinger/email work is Partial pending production template and delivery validation.

# Phase 2 — Onboarding

**Status:** 🟨 in progress
**Completion:** 48%

- 🟨 Scholar Onboarding
- 🟨 Scholar-Athlete Onboarding
- 🟨 Parent Guardian Onboarding
- 🟨 Teacher Educator Onboarding
- 🟨 High School Counselor Onboarding
- 🟨 Mentor Onboarding
- 🟨 High School Coach Onboarding
- 🟨 College Coach Recruiter Onboarding
- 🟨 College Admissions Onboarding
- 🟨 Brand Partner Onboarding
- 🟨 Employer Workforce Partner Onboarding
- 🟨 District School Administrator Onboarding
- 🟨 Transition-Aged Youth Onboarding
- 🟨 Athlete Abroad Enrollment
- 🟨 Dynamic User Agreement
- 🟨 Onboarding Autosave
- 🟨 Profile Creation Animation
- 🟨 Public Profile Generation
- 🟦 Onboarding OS Redirects

Notes: All 14 public role schemas, their canonical routes, and OS destinations are now built and contract-tested locally. They remain Partial until persistence/resume, relationship permissions and RLS, institutional verification, agreement audit records, and role-by-role mobile/desktop E2E validation pass. The exact implementation map is `docs/ROLE_ONBOARDING_STEP_CATALOG.md`. Nothing is promoted to Complete or merged before desktop review.

# Phase 3 — Public Profile

**Status:** 🟨 in progress
**Completion:** 26%

- 🟨 Avatar
- 🟨 Cover Photo
- 🟨 Username
- 🟨 Biography
- 🟨 Activities
- 🟨 Athletics
- 🟨 Transcript
- 🟨 Dream Schools
- 🟨 Top Colleges
- 🟨 Certificates
- 🟨 Badges
- 🟨 XP
- 🟨 Coins
- 🟨 Connections
- 🟨 Public Timeline
- 🟨 Privacy Settings
- 🟨 Private Profile Editing

Notes: Profile surfaces and fields are present, but all items remain Partial because public/private profile permissions, persistence coverage, and end-to-end validation are not yet release-gate evidence.

# Phase 4 — Operating Systems

**Status:** 🟥 needs fix
**Completion:** 42%

- 🟦 Scholar OS
- 🟦 Scholar-Athlete OS
- 🟨 Parent Guardian OS
- 🟨 Teacher Educator OS
- 🟨 High School Counselor OS
- 🟦 Mentor OS
- 🟨 High School Coach OS
- 🟨 College Coach Recruiter OS
- 🟨 College Admissions OS
- 🟦 Brand Partner OS
- 🟦 Employer OS
- 🟨 Founder OS
- 🟦 Athletes Abroad Hub
- 🟦 Role-Aware Sidebar Navigation
- 🟥 Role Permissions

Notes: Role OS pages, a role selection surface, and role-aware navigation exist for many audiences. Needs Fix: Role Permissions must be reconciled with the role registry and Role OS audit before any OS item can move to Complete under the Definition of Done.

# Phase 5 — Network

**Status:** 🟦 testing
**Completion:** 45%

- 🟨 User Search
- 🟨 Suggested Users
- 🟦 Connection Requests
- 🟦 Accept Requests
- 🟦 Decline Requests
- 🟦 Cancel Requests
- 🟦 Remove Connections
- 🟨 Mutual Connections
- 🟨 Public Profile Links
- 🟨 Network Notifications
- 🟨 Network Messaging Integration

Notes: Connection request lifecycle evidence exists and is in Testing. Discovery, mutuals, notifications, and messaging links remain Partial until validated across persistence, permissions, and end-to-end flows.

# Phase 6 — Feed

**Status:** 🟨 in progress
**Completion:** 29%

- 🟨 Real Author Identity
- 🟨 Create Post
- 🟨 Image Posts
- 🟨 Video Posts
- 🟨 Comments
- 🟨 Likes
- 🟨 Shares
- 🟨 Edit Post
- 🟨 Delete Post
- 🟨 Profile Links
- 🟨 Timeline Visibility
- 🟨 Infinite Scroll
- 🟨 Feed Moderation

Notes: Feed UI and Supabase-backed post/media paths exist, but feature-level permissions, moderation, and end-to-end validation evidence are incomplete.

# Phase 7 — Messaging

**Status:** 🟨 in progress
**Completion:** 23%

- 🟨 Direct Messages
- 🟨 Group Messages
- 🟨 Conversation Search
- 🟨 Attachments
- 🟨 Read Receipts
- 🟨 Message Notifications
- 🟨 Block User
- 🟨 Report User
- 🟨 Meeting Links

Notes: Inbox and support-message surfaces exist, but message features are Partial until persistence, access controls, safety actions, notification wiring, and end-to-end workflows are validated.

# Phase 8 — Courses

**Status:** 🟨 in progress
**Completion:** 26%

- 🟨 Course Library
- 🟨 Course Search
- 🟨 Course Detail
- 🟨 Module Completion
- 🟨 Progress Tracking
- 🟨 Reflections
- 🟨 Quizzes
- 🟨 XP Rewards
- 🟨 Coin Rewards
- 🟨 Certificates
- 🟨 Community Safety Course
- 🟨 Athletes Abroad Course

Notes: Course surfaces and flagship content exist, but completion/progress/reward/certificate flows are still Partial pending persistence, permissions, tests, and end-to-end validation.

# Phase 9 — Academic

**Status:** 🟨 in progress
**Completion:** 35%

- 🟦 Transcript Upload
- 🟨 Transcript Parsing
- 🟦 A-G Tracker
- 🟨 FAFSA Tracker
- 🟨 Scholarships
- 🟦 College Search
- 🟨 Dream Schools
- 🟨 Top Schools
- 🟨 Application Deadlines
- 🟨 Application Tracker
- 🟦 Academic Readiness
- 🟦 Compass Recommendations

Notes: Academic pages, college search, A-G tracking, readiness, and recommendation surfaces are present and some have unit-test coverage. Remaining items stay Partial/Testing until the full academic workflow is validated against the Definition of Done.

# Phase 10 — Recruiting

**Status:** 🟨 in progress
**Completion:** 23%

- 🟨 Athlete Profile
- 🟨 Film
- 🟨 Measurements
- 🟨 Statistics
- 🟨 Eligibility
- 🟨 Coach Connections
- 🟨 Recruiter Search
- 🟨 College Targets
- 🟨 Visits
- 🟨 Offers
- 🟨 Recruiting Timeline
- 🟨 NIL Readiness

Notes: Scholar-athlete and recruiting-adjacent surfaces exist, but recruiting remains Partial because the checklist items do not yet have complete persistence, permissions, integrations, tests, and end-to-end validation evidence.

# Phase 11 — Events

**Status:** 🟨 in progress
**Completion:** 29%

- 🟨 Browse Events
- 🟨 Event Detail
- 🟨 RSVP
- 🟨 Calendar Integration
- 🟨 Reminders
- 🟨 QR Check-In
- 🟨 Event Networking
- 🟨 Replay Library
- 🟨 Summit Events

Notes: Events and community-event surfaces exist, but all event features remain Partial until RSVP, notification/reminder, check-in, networking, replay, and summit workflows are validated end to end.

# Phase 12 — Brand Partner Marketplace

**Status:** 🟨 in progress
**Completion:** 23%

- 🟨 Organization Profiles
- 🟨 Campaign Builder
- 🟨 Rewards
- 🟨 Internships
- 🟨 Jobs
- 🟨 Sponsorships
- 🟨 NIL Opportunities
- 🟨 Scholarships
- 🟨 Mentorship
- 🟨 Opportunity Applicants
- 🟨 Opportunity Tracking
- 🟨 Compliance Review

Notes: Brand Partner OS, opportunity, reward, and marketplace surfaces exist, but marketplace workflows remain Partial until applicant tracking, compliance, permissions, and integrations are validated.

# Phase 13 — Athletes Abroad Hub

**Status:** 🟨 in progress
**Completion:** 23%

- 🟨 Go Abroad
- 🟨 Living Abroad
- 🟨 Life After Sport
- 🟨 Global Athlete Profile
- 🟨 Career History
- 🟨 Country Channels
- 🟨 Sport Channels
- 🟨 Global Locker Room
- 🟨 Summit Integration
- 🟨 Summit Meetings
- 🟨 Meetups
- 🟨 Housing Resources
- 🟨 Healthcare Resources
- 🟨 Tax Resources
- 🟨 Contract Resources
- 🟨 Alumni Network

Notes: Athlete Abroad routes and hub concepts are present, but launch-readiness evidence is Partial across enrollment, global profile, channels, resources, summit, and alumni workflows.

# Phase 14 — Founder Dashboard

**Status:** 🟨 in progress
**Completion:** 29%

- 🟨 Project Intelligence
- 🟨 Analytics
- 🟨 User Management
- 🟨 Verification
- 🟨 Moderation
- 🟨 Feature Flags
- 🟨 Bug Tracking
- 🟨 Release Management
- 🟨 Architecture Viewer
- 🟨 Documentation Center
- 🟨 Content Review
- 🟨 System Health

Notes: Founder/admin/studio surfaces exist, but launch-gate admin controls remain Partial until each operational workflow has validated persistence, permissions, tests, build, and end-to-end coverage.

# Phase 15 — Platform QA

**Status:** 🟨 in progress
**Completion:** 13%

- 🟨 Scholar End-to-End QA
- 🟨 Scholar-Athlete End-to-End QA
- ⬜ Parent Guardian End-to-End QA
- ⬜ Teacher Educator End-to-End QA
- ⬜ Counselor End-to-End QA
- 🟨 Mentor End-to-End QA
- ⬜ High School Coach End-to-End QA
- ⬜ College Coach End-to-End QA
- ⬜ Admissions End-to-End QA
- ⬜ Brand Partner End-to-End QA
- ⬜ Employer End-to-End QA
- 🟨 Founder End-to-End QA
- ⬜ Athlete Abroad End-to-End QA
- ⬜ Desktop QA
- ⬜ Tablet QA
- ⬜ Mobile QA
- ⬜ Accessibility QA
- ⬜ Performance QA
- ⬜ Security QA
- ⬜ RLS Audit
- 🟦 Production Build
- ⬜ Soft Launch
- ⬜ Beta Feedback
- ⬜ Final Launch QA

Notes: Unit and release-audit tests exist for selected platform areas, and production build validation is in Testing. Platform QA remains mostly Not Started because role-by-role E2E, device, accessibility, performance, security/RLS, soft-launch, and final launch evidence is not complete.

# Final Release Checklist

- ⬜ Desktop validation
- ⬜ Tablet validation
- ⬜ Mobile validation
- ⬜ Accessibility validation
- ⬜ Performance validation
- ⬜ Security and RLS validation
- ⬜ Production database validation
- ⬜ Storage and backup validation
- ⬜ Email and notification validation
- ⬜ Monitoring and error logging
- ⬜ Soft launch
- ⬜ Beta feedback resolved
- 🟦 Final production build
- ⬜ Public launch 🚀
