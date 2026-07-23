# PLAYBOOK OS
# CODEX OPERATING SYSTEM
## Codename: RUN IT

Version: 1.0

Repository:
Playbook OS Git Repository

Accepted repository names:
- playbook-premium-recovery
- playbook-platform

Primary Development Branch:
playbook-os-v1

Execution environments may include:
- Local macOS
- GitHub Codespaces
- Docker
- Cloud Workspaces
- Codex Containers

Repository verification must always be Git-based, never filesystem-path-based.

---

# PURPOSE

This document is the engineering constitution for Playbook OS.

Every AI coding session begins here.

This file defines:

- Engineering standards
- Architecture
- Git workflow
- Sprint workflow
- Build rules
- UI standards
- Documentation standards
- Definition of Done

When uncertainty exists:

Follow this document.

If this document conflicts with repository documentation, follow the repository documentation.

---

# MISSION

Build the world's premier Operating System for Scholars.

Every implementation should be production-quality, even while the platform is under active development.

Every feature should:

✓ Improve the Scholar Record

✓ Increase Opportunity

✓ Strengthen the Starting Five

✓ Build Momentum

✓ Feel like Playbook OS

If it doesn't...

Redesign it.

RUN IT.

---

# NORTH STAR

Every Scholar should leave Playbook more confident than when they arrived.

Every engineering decision should reinforce this experience.

---

# SOURCE OF TRUTH

Always consult these documents before implementation.

1. docs/MASTER_CHECKLIST.md

2. docs/ROADMAP.md

3. docs/ARCHITECTURE.md

4. docs/UI_DESIGN_SYSTEM.md

5. docs/DATABASE.md

6. docs/DECISIONS.md

Follow documented architecture.

Do not invent architecture.

If architecture changes are required:

Document the decision before implementation.

---

# PRE-FLIGHT CHECK

Before writing ANY code:

## STEP 1 — Verify Repository

Run:

pwd

git rev-parse --is-inside-work-tree

git rev-parse --show-toplevel

basename "$(git rev-parse --show-toplevel)"

Expected repository:

playbook-platform

or

playbook-premium-recovery

If another repository is detected:

STOP.

Do not modify code.

Resolve repository first.

---

## STEP 2 — Detect Workspace

Determine execution environment.

Possible environments:

- Local Git clone
- GitHub Codespaces
- Docker
- Cloud workspace
- Codex container
- CI runner

Never rely on absolute filesystem paths.

Always rely on Git.

---

## STEP 3 — Verify Branch

Run:

git fetch --all --prune

git branch --show-current

git branch -a

Preferred development branch:

playbook-os-v1

If playbook-os-v1 exists:

Switch to it.

If playbook-os-v1 does NOT exist:

Continue ONLY if the current branch is the active development branch or the only available branch.

Never create a branch simply to satisfy this rule.

Never guess the intended branch.

If multiple branches exist and playbook-os-v1 is missing:

Report the discrepancy.

---

## STEP 4 — Verify Working Tree

Run:

git status --short --branch

Display:

Current Branch

Modified Files

Untracked Files

Ahead / Behind

If merge conflicts exist:

Resolve before coding.

---

## STEP 5 — Display Build Context

Print:

Repository Name

Repository Root

Current Directory

Current Branch

Latest Commit

Git Status

---

## STEP 6 — Read Documentation

Read:

docs/MASTER_CHECKLIST.md

Determine:

Current Sprint

Highest Priority Feature

Highest Priority Bug

Known Blockers

Resume from the highest unfinished task.

Never skip ahead.

---

## STEP 7 — Verify Build

Run:

npm run build

If build fails:

STOP.

Fix build.

---

## STEP 8 — Verify Lint

Run:

npm run lint

Resolve every lint issue before beginning new work.

Only after every Pre-Flight step succeeds may implementation begin.

---

# BUILD RULES

Always maintain a buildable repository.

Before implementing any feature:

Run build.

Run lint.

Fix all failures.

Never continue feature development while the project is broken.

---

# SPRINT EXECUTION

Repeat continuously:

Read MASTER_CHECKLIST

↓

Identify Current Sprint

↓

Identify Highest Priority Task

↓

Review Architecture

↓

Implement

↓

Build

↓

Lint

↓

Fix

↓

Test

↓

Update Documentation

↓

Update MASTER_CHECKLIST

↓

Commit

↓

Repeat

---

# UI STANDARDS

Every page must include:

✓ AppShell

✓ Theme Provider

✓ Shared Components

✓ Design Tokens

✓ Responsive Layout

✓ Loading State

✓ Empty State

✓ Error State

✓ Motion

✓ Accessibility

✓ Mobile

✓ Tablet

✓ Desktop

✓ Role-aware UX

---

# DESIGN SYSTEM

Never hardcode:

Colors

Spacing

Typography

Radius

Shadows

Motion

Always use:

Theme

Tokens

Component Library

Shared Utilities

---

# COMPONENT RULES

Search before creating.

Reuse before duplicating.

Never create temporary UI.

Prefer extending shared components.

---

# ARCHITECTURE RULES

Maintain one source of truth.

Avoid duplicate:

Logic

Components

Routes

Utilities

Database structures

Document major architectural decisions.

---

# DATABASE RULES

Every schema change requires:

Migration

Types

Indexes

Policies

RLS

Validation

Testing

Documentation

No migration is complete until verified.

---

# ROLE SYSTEM

Supported roles include:

Scholar

Scholar Athlete

Parent / Guardian

Teacher

Counselor

Coach

Mentor

College Recruiter

Admissions

Employer

Partner

Founder

Administrator

Every role inherits:

Authentication

Navigation

Permissions

Messaging

Notifications

Profile

Dashboard

---

# ENGINEERING PRINCIPLES

Optimize for maintainability.

Prefer scalable systems.

Avoid shortcuts that create technical debt.

Leave the repository better than you found it.

---

# DOCUMENTATION

At the end of every sprint:

Update:

MASTER_CHECKLIST.md

Document:

Completed Work

Current Work

Known Risks

Architecture Decisions

---

# GIT RULES

Always verify:

git status

git branch --show-current

git log -1 --oneline

Never commit:

Broken builds

Failing lint

Broken TypeScript

Merge conflicts

Incomplete migrations

If playbook-os-v1 exists:

Use it.

If not:

Use the active development branch.

Never force push.

Never rewrite shared history.

Leave the repository buildable.

---

# DEFINITION OF DONE

A task is complete only when:

✓ Build passes

✓ Lint passes

✓ TypeScript passes

✓ UI complete

✓ Responsive

✓ Mobile verified

✓ Desktop verified

✓ Accessibility verified

✓ Persistence verified

✓ Permissions verified

✓ Documentation updated

✓ MASTER_CHECKLIST updated

✓ End-to-end workflow verified

---

# END OF SESSION

Before ending work:

□ Build passes

□ Lint passes

□ Git status reviewed

□ Documentation updated

□ MASTER_CHECKLIST updated

□ No temporary code

□ No unfinished migrations

□ Repository remains deployable

Only then:

Commit.

Push.

Continue the next sprint.

RUN IT.
