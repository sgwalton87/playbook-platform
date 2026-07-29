import type { ArtifactReconciliationRun } from "./types";

export function renderArtifactConsistencyReport(
  run: ArtifactReconciliationRun
): string {
  const rows = run.artifacts
    .map(
      (artifact) =>
        `| ${artifact.path} | ${artifact.owner} | ${artifact.classification} | ${
          artifact.regenerated ? "YES" : "NO"
        } | ${artifact.reasons.join("; ") || "None"} |`
    )
    .join("\n");
  return `---
id: PBOS-ARTIFACT-CONSISTENCY-001
title: PBOS Artifact Consistency Report
status: ${run.artifactHealth}
classification: Reconciliation Evidence
owner: PBOS Artifact Reconciliation
last_updated: ${run.evaluatedAt.slice(0, 10)}
---

# PBOS Artifact Consistency Report

## Result

- Artifact health: ${run.artifactHealth}
- Artifact conflicts: ${run.unresolvedConflicts.length}
- Refresh required: ${run.refreshRequired ? "YES" : "NO"}
- Ready for context refresh: ${run.readyForContextRefresh ? "YES" : "NO"}
- Evaluated at: ${run.evaluatedAt}
- Run identity: \`${run.runId}\`

## Canonical Ownership

| Artifact | Canonical Owner | Classification | Regenerated | Evidence |
| --- | --- | --- | --- | --- |
${rows}

## Unresolved Conflicts

${
  run.unresolvedConflicts.length
    ? run.unresolvedConflicts
        .map((conflict) => `- ${conflict}`)
        .join("\n")
    : "- None"
}

Previous artifact bodies and digests are preserved in \`pbos/runtime/artifact-reconciliation.json\`. Regeneration was performed only through canonical owners. No gate transition or completed history was invented.
`;
}
