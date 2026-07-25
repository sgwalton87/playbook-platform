# PBOS Git Integration Policy

**Canonical Path:** `docs/ENGINEERING/GIT_INTEGRATION_POLICY.md`
**Policy ID:** `PBOS-GIT-INTEGRATION-POLICY-001`
**Status:** Canonical
**Authority:** PBOS Engineering Governance
**Applies To:** All repository integration, merge, synchronization, release, and certification activity
**Primary Repository:** Playbook Platform / PBOS
**Effective Date:** Upon approval and registration in `docs/DOCUMENTATION/CANONICAL_DOCS.md`

---

## 1. Purpose

This document is the permanent Git integration constitution for PBOS.

It defines the authoritative rules that govern:

- repository identity
- canonical remotes
- canonical branches
- approved source refs
- integration planning
- merge execution
- conflict resolution
- validation
- documentation synchronization
- pull requests
- releases
- certification
- autonomous PBOS execution

PBOS, Codex, maintainers, contributors, and automated agents must use this policy before performing any repository integration action.

This policy exists to prevent:

- invented merge order
- unknown branch integration
- accidental history rewriting
- unapproved source inclusion
- unverified repository certification
- conflicting engineering instructions
- undocumented architecture changes
- documentation drift
- unsafe autonomous execution

---

## 2. Authority and Precedence

The repository documentation authority order is:

1. `docs/DOCUMENTATION/CANONICAL_DOCS.md`
2. This policy
3. `AGENTS.md`
4. `CODEX.md`
5. Canonical engineering principles
6. Canonical architecture documents
7. Canonical product and roadmap documents
8. Generated logs, dashboards, ledgers, and historical records
9. Non-canonical, duplicate, thin, archived, or legacy documentation

If two documents conflict:

- follow the higher-authority document
- record the inconsistency
- do not silently reconcile it
- update the lower-authority document only when authorized
- preserve historical records

This policy becomes authoritative only after it is listed in `docs/DOCUMENTATION/CANONICAL_DOCS.md`.

---

## 3. Core Integration Principles

All repository integration must be:

- explicit
- deterministic
- reviewable
- reversible
- documented
- validated
- attributable
- consistent with canonical architecture
- safe for autonomous execution

PBOS must never:

- invent a remote
- invent a branch
- invent a source ref
- invent merge order
- invent branch ancestry
- infer approval from naming alone
- force-push shared history
- rewrite protected history
- merge with unresolved conflicts
- skip required validation
- certify an unknown repository state
- delete duplicate documentation before review
- replace canonical architecture without an approved decision
- treat a no-op fetch as proof of synchronization
- assume the current branch contains every approved change
- create fake readiness scores

---

## 4. Repository Identity

Before any integration action, PBOS must determine and record:

- repository root
- repository name
- current branch
- current commit
- symbolic HEAD
- detached HEAD status
- working-tree status
- configured remotes
- upstream branch
- local branches
- remote-tracking branches
- tags
- submodules
- Git LFS usage
- repository hosting provider when determinable

Required commands include:

```bash
git rev-parse --show-toplevel
git rev-parse --is-inside-work-tree
git branch --show-current
git rev-parse HEAD
git symbolic-ref -q HEAD || true
git status --porcelain=v2 --branch
git remote -v
git branch -vv
git branch -a
git tag -n
git submodule status
git lfs env || true
```

If repository identity cannot be established, execution must stop.

---

## 5. Canonical Remote Governance

### 5.1 Required declaration

The canonical documentation must identify:

- canonical remote name
- canonical remote URL
- repository host
- whether additional remotes are approved
- the purpose of every approved remote

Recommended default:

```text
Remote name: origin
Purpose: canonical hosted repository
```

No remote may be added, removed, or changed unless:

- the remote name and URL are explicitly approved
- the change is documented
- the resulting configuration is verified

### 5.2 No-remote condition

If no remote is configured:

- local inspection may continue
- local validation may continue
- repository synchronization cannot be certified
- remote branch availability cannot be certified
- protected branch status cannot be certified
- integration completeness cannot be certified unless the policy explicitly declares the repository local-only

PBOS must not treat `git fetch --all --prune` as meaningful synchronization when no remote exists.

### 5.3 Remote verification

After an approved remote is configured:

```bash
git remote -v
git fetch --all --prune
git branch -a
git ls-remote --heads <remote-name>
```

The canonical remote URL must match the approved policy value exactly.

---

## 6. Canonical Branch Governance

### 6.1 Branch roles

Every integration plan must identify:

- canonical development branch
- canonical integration branch
- canonical release branch
- protected production branch
- temporary work branches
- approved source branches

A single branch may serve more than one role only when explicitly declared.

### 6.2 Default PBOS branch model

Unless the canonical map or an approved engineering decision says otherwise:

- `main` is the protected production branch
- `playbook-os-v1` is the canonical PBOS integration and development branch
- `work` is a temporary execution workspace and is not automatically canonical
- feature, sprint, agent, and repair branches are source branches only when explicitly approved

If `playbook-os-v1` does not exist:

- PBOS may inspect the active branch
- PBOS may not automatically declare the active branch canonical
- an authorized maintainer must approve either creation of `playbook-os-v1` or designation of another canonical branch

### 6.3 Canonical destination declaration

Before a merge, the integration plan must state:

```text
Canonical destination branch:
Destination remote:
Expected upstream:
Protected status:
Permitted integration mechanism:
```

No merge may proceed without this declaration.

---

## 7. Approved Change Set

Every integration execution must operate from an explicit approved change set.

The approved change set must contain one of the following:

### Option A — Ordered source branches

```text
1. <remote>/<branch-one>
2. <remote>/<branch-two>
3. <remote>/<branch-three>
```

### Option B — Approved commits

```text
1. <commit SHA>
2. <commit SHA>
3. <commit SHA>
```

### Option C — Approved pull requests

```text
1. PR #<number>
2. PR #<number>
3. PR #<number>
```

### Option D — Explicit no-additional-input declaration

```text
There are no additional approved branches, commits, or pull requests.
The canonical destination already contains the complete approved change set.
```

A branch name, commit, or pull request is not approved merely because it exists.

Approval must be attributable to:

- repository owner
- designated engineering maintainer
- approved engineering decision record
- canonical merge plan
- authorized pull-request approval

---

## 8. Integration Plan Requirements

Before execution, PBOS must generate or discover a deterministic integration plan.

The plan must specify:

- policy version
- execution ID
- canonical remote
- canonical destination branch
- approved sources
- source order
- integration mechanism
- ancestry requirements
- expected conflicts
- pre-merge validation
- post-merge validation
- documentation updates
- completion test
- rollback procedure
- approval attribution

The integration plan may be stored in:

```text
docs/ENGINEERING/INTEGRATION_PLANS/
```

Recommended filename:

```text
PBOS-INTEGRATION-<DATE>-<SEQUENCE>.md
```

Integration plans are execution records. This policy remains the constitution.

---

## 9. Integration Order

The integration order must be explicit.

If order matters, the plan must list sources sequentially.

If order does not matter, the plan must explicitly state:

```text
The approved sources are independent and order-independent.
```

PBOS must never infer order from:

- branch creation date
- commit date
- branch name
- pull-request number
- apparent feature dependency
- previous historical merge order

When dependencies exist, the integration plan must record them.

---

## 10. Approved Integration Mechanisms

Permitted mechanisms are:

- pull-request merge
- merge commit
- fast-forward merge
- squash merge
- cherry-pick of approved commits
- rebase before merge, only when performed on an unshared source branch and explicitly approved

The integration plan must name exactly one mechanism for each source.

### 10.1 Prohibited mechanisms

The following are prohibited unless an emergency policy explicitly authorizes them:

- force push to shared branches
- destructive reset of shared branches
- rewriting protected history
- unapproved rebasing of shared branches
- merging unknown refs
- resolving conflicts by deleting one side without review
- using `--ours` or `--theirs` across an entire merge without file-level justification
- bypassing required checks

---

## 11. Preflight Gate

No integration may begin until preflight passes.

Required preflight checks:

```bash
git status --short --branch
git diff --check
git diff --cached --check
git remote -v
git fetch --all --prune
git branch -a
```

PBOS must confirm:

- working tree is clean
- index is clean
- no unresolved merge exists
- current destination branch is correct
- destination is synchronized with its upstream
- approved source refs exist
- approved source commits are reachable
- package manager is known
- lockfile is present and consistent
- required environment strategy is documented
- baseline validation result is recorded

If any preflight item fails, integration must stop.

---

## 12. Baseline Validation Gate

Before the first merge, run the repository-approved validation suite.

Default PBOS validation commands:

```bash
npm run lint
npx tsc --noEmit
npm test -- --run
npm run build
git diff --check
git diff --cached --check
git status --short --branch
```

Use the repository’s actual package manager and scripts.

If `npm test` hangs, investigate rather than skipping it.

Minimum investigation:

```bash
npm test -- --run
npx vitest --run
npx vitest --run --reporter=verbose
```

A failing baseline must be classified as:

- existing baseline defect
- environment/configuration defect
- test-runner defect
- integration blocker
- documented exception approved by engineering ownership

PBOS may not silently downgrade a failure to a warning.

---

## 13. Per-Source Integration Procedure

For each approved source:

1. Verify the source ref.
2. Verify ancestry and divergence.
3. Record source commit.
4. Confirm destination branch.
5. Execute the approved integration mechanism.
6. Detect conflicts.
7. Resolve conflicts according to this policy.
8. Run required validation.
9. Review the diff.
10. Update canonical documentation and generated records.
11. Commit or complete the pull-request merge.
12. Record resulting commit.
13. Confirm clean working state before continuing.

Recommended ancestry commands:

```bash
git merge-base <destination> <source>
git log --left-right --graph --cherry-pick --oneline <destination>...<source>
git diff --stat <destination>...<source>
git diff --name-status <destination>...<source>
```

---

## 14. Conflict Resolution Constitution

Conflict resolution must preserve the canonical system.

Resolution precedence:

1. canonical documentation
2. approved architecture decisions
3. current validated architecture
4. approved source intent
5. newest compatible implementation
6. historical behavior

Every conflict must be classified:

- textual
- structural
- architectural
- data/schema
- API contract
- UI/design
- documentation
- generated artifact
- lockfile
- migration ordering

For each conflict, record:

- file
- conflicting sources
- decision
- rationale
- authority
- validation performed

Never:

- resolve conflicts solely by timestamp
- prefer an entire branch automatically
- delete migrations without review
- combine incompatible architectures
- preserve duplicate implementations when one canonical implementation is required
- change public behavior without documenting it

Architectural conflicts require escalation to the repository owner or designated engineering authority.

---

## 15. Database and Migration Governance

When integration includes database changes:

- migrations must remain immutable after shared use
- migration order must be deterministic
- duplicate migrations must be reconciled explicitly
- destructive changes require approval
- schema and generated types must remain synchronized
- RLS policy changes must be reviewed
- rollback or remediation guidance must be documented

Required checks should include, when available:

```bash
npx supabase db lint
npx supabase migration list
```

Do not run production migrations without explicit authorization.

---

## 16. Environment and Build Governance

Secrets must never be committed.

Build-safe placeholder values may be used only when:

- the repository already supports them
- they do not alter production configuration
- their use is recorded in the validation report

PBOS must distinguish:

- local development environment
- test environment
- preview environment
- production environment

A successful placeholder build does not certify production environment configuration.

---

## 17. Documentation Synchronization

After every completed integration unit, update the applicable canonical records:

- `CHANGELOG.md`
- `VERSION.md`
- engineering log
- product log
- daily log
- merge or integration ledger
- engineering dashboard
- architecture status
- migration documentation
- release history
- PBOS status
- remaining gates
- recommended next sprint

Documentation must describe what actually occurred.

Never:

- claim a merge occurred when it did not
- claim validation passed when it did not
- assign readiness scores without completing certification
- delete duplicate or historical documentation without review
- rewrite historical logs to hide prior state

---

## 18. Pull Request Governance

Pull requests are required when:

- merging into a protected branch
- repository hosting rules require review
- architecture changes are included
- database migrations are included
- security-sensitive changes are included
- policy changes are included
- release certification is included

A pull request must include:

- objective
- approved source
- destination
- scope
- validation evidence
- conflict-resolution summary
- documentation impact
- migration impact
- risks
- rollback plan
- approval status

PBOS may prepare pull-request metadata but must not fabricate approval.

---

## 19. Completion Test

Integration is complete only when all of the following are true:

- canonical remote is configured and verified
- canonical destination branch is verified
- every approved source is accounted for
- each source is merged, superseded, rejected, or documented as not applicable
- no unresolved conflicts remain
- lint passes
- TypeScript passes
- tests pass or have an explicitly approved exception
- production build passes
- migrations are consistent
- canonical documentation is synchronized
- working tree is clean
- destination is synchronized with upstream
- final commit or pull request is recorded
- repository certification report is complete

The deterministic inclusion test must use commit ancestry, patch equivalence, pull-request merge state, or an approved equivalent.

Example:

```bash
git merge-base --is-ancestor <approved-source-commit> <canonical-destination>
```

For squash merges, use pull-request metadata or patch-equivalence validation.

---

## 20. Certification

PBOS may issue repository certification only after the completion test passes.

The certification report must include:

1. Executive Summary
2. Policy Version
3. Repository Identity
4. Canonical Remote
5. Canonical Destination
6. Approved Change Set
7. Integration Log
8. Conflict Log
9. Validation Results
10. Architecture Impact
11. Database Impact
12. API Impact
13. UI Impact
14. Documentation Impact
15. Remaining Risks
16. Technical Debt
17. Repository Readiness Score
18. PBOS Readiness Score
19. Recommended Next Command

Readiness scores must include written justification.

No score may be issued when:

- the approved change set is unknown
- remote state is unknown
- destination state is unknown
- required validation was not completed
- integration completeness cannot be proven

---

## 21. Stop Conditions

PBOS must stop when:

- canonical remote is missing or unapproved
- canonical destination is unknown
- approved source set is unknown
- merge order is required but undefined
- source refs are missing
- working tree is dirty before integration
- baseline validation fails without an approved disposition
- conflict resolution exceeds documented authority
- architecture instructions conflict
- destructive database action lacks approval
- protected history would need rewriting
- completion cannot be proven

A stop report must include:

- blocker title
- phase
- evidence
- why execution cannot safely continue
- exact human decision required
- exact recovery procedure
- repository state at stop
- checks performed

---

## 22. Emergency Procedure

Emergency integration is allowed only when explicitly declared by the repository owner or authorized engineering maintainer.

The declaration must state:

- emergency reason
- scope
- destination
- permitted deviations
- validation minimum
- rollback plan
- approving authority
- post-emergency remediation deadline

Emergency status does not permit:

- secret exposure
- fabricated validation
- unknown source inclusion
- undocumented force push
- silent database destruction

---

## 23. Autonomous PBOS Execution Rules

PBOS commands such as:

- `preflight`
- `status`
- `next`
- `audit`
- `merge`
- `release`
- `ship`
- `certify`

must read, in order:

1. `docs/DOCUMENTATION/CANONICAL_DOCS.md`
2. this policy
3. the current approved integration plan
4. canonical engineering and architecture documents
5. current repository state

Autonomous execution must be idempotent where practical.

Repeated execution must not:

- duplicate merges
- duplicate changelog entries
- recreate existing policy
- overwrite approved plans
- manufacture new approvals

PBOS must select exactly one next eligible action when using `next`.

---

## 24. Required Canonical Configuration Block

This section must be completed by an authorized maintainer before this policy can authorize integration.

```yaml
pbos_git_integration:
  policy_version: "1.0.0"
  canonical_remote:
    name: "TO_BE_APPROVED"
    url: "TO_BE_APPROVED"
    host: "TO_BE_APPROVED"

  canonical_branches:
    production: "main"
    development: "playbook-os-v1"
    integration: "playbook-os-v1"
    temporary_workspace: "work"

  protected_branches:
    - "main"

  default_integration_mechanism: "pull_request_merge"

  allowed_integration_mechanisms:
    - "pull_request_merge"
    - "merge_commit"
    - "fast_forward"
    - "squash_merge"
    - "approved_cherry_pick"

  require_clean_worktree: true
  require_remote_sync: true
  require_baseline_validation: true
  require_post_merge_validation: true
  require_documentation_sync: true
  require_pull_request_for_protected_branch: true
  prohibit_force_push: true
  prohibit_shared_history_rewrite: true

  required_validation:
    - "npm run lint"
    - "npx tsc --noEmit"
    - "npm test -- --run"
    - "npm run build"
    - "git diff --check"
    - "git diff --cached --check"
    - "git status --short --branch"

  approval_authority:
    repository_owner: "TO_BE_APPROVED"
    engineering_maintainer: "TO_BE_APPROVED"

  current_approved_change_set:
    status: "TO_BE_DECLARED"
    sources: []
    explicit_no_additional_sources: false
```

Until all `TO_BE_APPROVED` and `TO_BE_DECLARED` values required for the current integration are completed, PBOS may audit and validate locally but must not certify repository synchronization or execute unapproved merges.

---

## 25. Policy Change Governance

Changes to this policy require:

- explicit review
- changelog entry
- version increment
- update to the canonical documentation map when the path or authority changes
- validation that automation still follows the policy
- approval by repository ownership or designated engineering authority

Policy history must be preserved through Git.

---

## 26. Final Directive

This policy is the permanent Git integration constitution for PBOS.

All integration activity must be grounded in:

- canonical documentation
- approved repository topology
- explicit source authorization
- deterministic execution
- validated results
- preserved history
- documented decisions

When required information is missing, PBOS must stop rather than guess.

When execution succeeds, PBOS must leave the repository:

- integrated
- validated
- documented
- clean
- synchronized
- certifiable
- ready for the next canonical PBOS command
