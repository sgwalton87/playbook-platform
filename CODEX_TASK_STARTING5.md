# PLAYBOOK PLATFORM — OVERNIGHT CODEX TASK

## IMPORTANT

The repository currently builds successfully.

Your job is to improve the project WITHOUT breaking existing functionality.

If at any point you introduce a build failure, you must fix it before stopping.

---

# ABSOLUTE RULES

DO NOT:

- commit
- create branches
- create pull requests
- push
- merge
- rewrite authentication
- rewrite onboarding architecture
- rewrite routing
- replace existing components unless required

Leave all changes uncommitted.

Tomorrow I will review everything manually.

---

# PRIMARY GOAL

Implement the architecture for the Playbook Platform "Starting 5."

The Starting 5 is NOT an invite list.

It is the scholar's permanent support network.

Future features will depend on this system including:

- parent engagement
- counselor collaboration
- teacher communication
- mentor relationships
- athletic recruiting
- transcript sharing
- recommendation requests
- FAFSA collaboration
- college planning

The Parent/Guardian is collected during onboarding.

The remaining members are added later from the dashboard.

---

# SUPPORT TEAM

Scholar

• Parent / Guardian
• School Counselor
• Teacher
• Mentor
• Trusted Adult

Scholar Athlete

• Parent / Guardian
• School Counselor
• Teacher
• Mentor
• Coach

---

# TASK 1

Create a complete support network domain.

Create:

lib/support-network/

Organize reusable modules including:

types.ts

queries.ts

mutations.ts

helpers.ts

validation.ts

constants.ts

---

# TASK 2

Create a Supabase migration.

Table:

support_network

Recommended columns

id

scholar_id

supporter_name

supporter_email

supporter_phone

relationship

status

invite_token

invited_at

accepted_at

declined_at

created_by

created_at

updated_at

Create indexes.

Enable Row Level Security.

Create appropriate policies.

If database TypeScript types are generated in this project, update them.

---

# TASK 3

Create

components/support-network/StartingFiveBuilder.tsx

Requirements

Reusable.

Responsive.

Uses Playbook design language.

Supports:

Parent

Counselor

Teacher

Mentor

Coach

Trusted Adult

Should support:

readonly

editable

invitable

future expansion

No placeholder styling.

---

# TASK 4

Create

components/dashboard/StartingFiveWidget.tsx

Display:

Starting 5

Progress

Accepted

Pending

Missing

Progress ring

Completion %

Scholar:

Trusted Adult

Scholar Athlete:

Coach

Read real data from support_network.

No fake data.

---

# TASK 5

Integrate onboarding.

ONLY Parent / Guardian is required.

Collect

Name

Email

Phone

Persist to support_network.

Status = Pending.

Do NOT send invitations.

Do NOT send emails.

Do NOT require the other four members.

Preserve existing onboarding.

---

# TASK 6

Dashboard

Immediately after onboarding

Dashboard displays

Starting 5

1 / 5 Complete

Remaining cards empty.

---

# TASK 7

Create reusable persistence layer.

Avoid duplicated Supabase queries.

Everything should flow through

lib/support-network

---

# TASK 8

Refactor.

Remove duplicate code.

Remove dead code.

Keep architecture modular.

Preserve existing functionality.

---

# BUILD REQUIREMENT

After every meaningful change

Run

npm run build

If build fails

Read errors.

Fix errors.

Run build again.

Repeat until build succeeds.

Never stop while build is failing.

---

# QUALITY REQUIREMENTS

No TypeScript errors.

No broken imports.

No duplicate logic.

No TODO comments.

No console.log debugging.

No placeholder implementations.

Use existing Playbook styling.

Prefer reusable architecture over shortcuts.

---

# FINAL DELIVERABLE

DO NOT COMMIT.

DO NOT PUSH.

When complete provide:

• Files created

• Files modified

• Database migration summary

• Remaining recommendations

• Areas requiring manual review

Stop ONLY after

npm run build

passes successfully.
