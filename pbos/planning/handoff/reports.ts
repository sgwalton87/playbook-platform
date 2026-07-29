import type { PlanningHandoffRecord } from "./types";

export function renderPlanningHandoffReport(
  record: PlanningHandoffRecord
): string {
  const selected = record.decision.selectedObjective;
  return `# PBOS Planning Handoff Report

## Purpose

Record the governed, non-executing evaluation of registered constitutional objectives.

## Ownership

PBOS Planning Handoff Architecture

## Decision

- Status: ${record.decision.status}
- Selected objective: ${selected?.objectiveId ?? "none"}
- Reason: ${record.decision.reason}
- Generated: ${record.generatedAt}

## Authority

- Model: ${record.authorization.authorityModel}
- Authorized: ${record.authorization.authorized ? "YES" : "NO"}
- Owner: ${selected?.authority.owner ?? "none"}
- Originating authority: ${selected?.authority.originatingAuthority ?? "none"}
- Constitutional parent: ${selected?.authority.constitutionalParent ?? "none"}

## Lineage

- Repository: ${record.lineage.repositoryIdentity}
- Commit: ${record.lineage.repositoryCommit}
- Context: ${record.lineage.contextIdentity}
- Registry: ${record.lineage.registryIdentity}
- Objective: ${record.lineage.objectiveIdentity ?? "none"}
- Dependency snapshot: ${record.lineage.dependencySnapshotIdentity}
- Evidence: ${record.lineage.evidenceIdentity}

## Evaluations

${record.decision.evaluations.length === 0
  ? "No objectives are registered."
  : record.decision.evaluations
      .map(
        (evaluation) =>
          `- ${evaluation.objectiveId}: ${evaluation.status} - ${evaluation.reasons.join(" ")}`
      )
      .join("\n")}

## Constitutional Boundary

This report does not activate a gate, mutate lifecycle state, authorize execution, or dispatch an adapter.
`;
}
