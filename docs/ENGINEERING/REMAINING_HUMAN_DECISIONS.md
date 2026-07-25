# Remaining Human Decisions

| ID | Smallest required decision | Exact evidence needed | Blocks |
|---|---|---|---|
| H-001 | Identify the canonical repository | Authoritative remote URL plus host repository identifier, owner/organization, and visibility | Remote setup, full topology, host metadata |
| H-002 | Approve branch roles | Default, development, integration, release, protected branches, and rulesets from an approved Git Integration Policy/host settings | Autonomous branching and PR approval |
| H-003 | Name ownership/approval authority | CODEOWNERS-equivalent owners, required reviewers, and exception authority | Governance certification |
| H-004 | Approve environment/deployment contract | Environment names, promotion path, deployment provider/workflow, required variable names, and secret custodian (no secret values in docs) | Build/E2E/deployment certification |
| H-005 | Identify Supabase authority | Project reference(s), local-vs-remote migration authority, and credential custodian | Database drift/RLS validation |
| H-006 | Reconcile canonical architecture | Decision to promote/rewrite/archive existing lowercase/root material into the four paths named by the canonical map | Architecture certification |
| H-007 | Approve health scoring rubric | Category weights, treatment of unavailable checks, threshold names, and sign-off owner | Numeric repository health score |

No assumed answer is recorded for any item.
