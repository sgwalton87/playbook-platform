# Merge Plan

## Purpose
Define a safe integration plan for PBOS-STABILIZATION-001 without merging, pushing, or deleting branches.

## Ownership
Playbook OS Engineering

## Last Updated
July 24, 2026

## Related Links
- [Repository Baseline Status](./BASELINE_STATUS.md)
- [Branch Inventory](./BRANCH_INVENTORY.md)
- [Pull Request Status](./PULL_REQUEST_STATUS.md)
- [Unique Work Matrix](./UNIQUE_WORK_MATRIX.md)

## Current constraints
- Only local branch `work` is visible.
- No remote is configured.
- No remote-tracking branches are visible.
- GitHub CLI is not installed.
- Browser/live Supabase validation has not been performed.

## Merge order
No merge order can be finalized from this workspace. The provisional order after restoring remote visibility should be:

1. Documentation-only stabilization branches.
2. Build/type/lint fix branches.
3. Runtime consolidation branches with clear Product Owner approval.
4. Design branches only after runtime route ownership is confirmed.
5. Feature branches only after stabilization gates pass.

## Cherry-pick candidates
No cherry-pick candidates can be safely identified until remote branches are fetched and compared to the target base.

## Conflict risk
| Area | Risk | Reason |
|---|---|---|
| Onboarding | High | Recent runtime consolidation changed `/onboarding`, `/start`, auth callback, and tutorial routing. |
| Profile | Medium | `/start` now writes additional top-level profile fields. |
| Role OS | Medium | Shared role dashboard and Scholar-Athlete OS runtime data paths changed. |
| Docs | Low | Repository stabilization docs are additive. |
| Demo/studio surfaces | Unknown | Demo persona removal requires Product Owner policy before broad cleanup. |

## Runtime validation required
Before any runtime consolidation branch is merged, validate each role in a browser with live Supabase data:

- Scholar
- Scholar Athlete
- Parent/Family
- Mentor
- Educator
- District
- University
- Employer
- Brand Partner

Trace login, role, onboarding, tutorial, dashboard, profile, public profile, logout, login again.

## Recommendation
Do not merge from this workspace. Restore remote visibility, inventory open PRs, reproduce checks on the target branch, then create a Product Owner-reviewed integration branch.
