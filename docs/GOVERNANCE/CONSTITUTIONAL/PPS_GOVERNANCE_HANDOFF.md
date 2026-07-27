# PPS Governance Handoff

## Purpose
Defines the human authority boundary for PBOS-CONST-002 and prevents automated inference from becoming constitutional action.

## Ownership
PBOS / Constitutional Governance

## Last Updated
July 26, 2026

## Related Documents
- [Issue Registry](./PPS_CONSTITUTIONAL_ISSUE_REGISTRY.md)
- [Authority Decision Matrix](./PPS_AUTHORITY_DECISION_MATRIX.md)
- [Canonical Resolution Manifest](./PPS_CANONICAL_RESOLUTION_MANIFEST.md)
- [Governance Approval Queue](./PPS_GOVERNANCE_APPROVAL_QUEUE.json)

## What PBOS Detected
PBOS detected 1 missing indexed path, 0 unindexed volume directories, 10 absent dependency targets represented by 42 unresolved dependency edges, 8 unresolved related-reference edges, 1 dependency cycle, 140 metadata defects, and 0 duplicate PPS identifiers. Missing means only **not found in the tracked PPS corpus**; it does not mean deleted.

## What PBOS Can Recommend
PBOS may identify a unique numeric-prefix location as a candidate, but a candidate is not a deterministic correction when its taxonomy conflicts with the index title. PBOS may identify evidence gaps, classify risk, preserve proposed state, and block validation. PBOS cannot convert a recommendation into authority.

## Validation Boundaries
PBOS must classify artifacts using affirmative evidence:

1. **Missing document:** referenced or explicitly indexed, but no tracked artifact resolves the identifier.
2. **Deprecated document:** an artifact exists and explicitly declares a deprecated status.
3. **Historical document:** an artifact exists in an authorized historical/archive scope or explicitly declares historical classification.
4. **Renamed document:** old and new identities are connected by an explicit rename, successor, or supersession record.
5. **Intentional migration:** an approved decision records source, destination, effective version, and migration state.
6. **True constitutional conflict:** two authorities compete, a dependency cannot resolve, or correction would change constitutional meaning.

PBOS shall never infer deprecation, deletion, rename, migration, or supersession from absence alone. Until affirmative evidence exists, the status remains `missing` or `unresolved` and validation remains blocked.

## What Requires Human Approval
- Every Category A metadata correction requires Platform Governance approval.
- Every Category B evidence or recovery decision requires Constitutional Governance review.
- Every Category C change requires the formal constitutional amendment process.

## Changes Prohibited Without Amendment
PBOS must not change hierarchy, foundational authority, ownership rules, dependency authority, or constitutional meaning; invent missing specifications; rewrite constitutional prose; delete history; or move documents based only on inferred intent.

## Required Approval Process
1. Review each pending queue item and its cited evidence.
2. Record an approver, decision, rationale, date, and scope.
3. Escalate any meaning-changing proposal to Category C.
4. Apply approved Category A metadata changes separately from constitutional amendments.
5. Preserve before/after manifests and the decision record.
6. Re-run deterministic verification; certification remains blocked until all required gates pass.
