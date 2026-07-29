import type { LifecycleGovernanceRun } from "./types";

export function renderLifecycleGovernanceReport(
  run: LifecycleGovernanceRun
): string {
  return `---
id: PBOS-LIFECYCLE-GOVERNANCE-001
title: PBOS Lifecycle Governance Report
status: ${run.completed ? "PASS" : "BLOCKED"}
classification: Lifecycle Evidence
owner: PBOS Lifecycle Governance
last_updated: ${run.evaluatedAt.slice(0, 10)}
---

# PBOS Lifecycle Governance Report

## Identity

- Gate: ${run.gateId}
- Gate content identity: \`${run.gateContentIdentity}\`
- Run: \`${run.runId}\`
- Authority: ${run.authority}
- Evaluated at: ${run.evaluatedAt}

## Transition

- Previous state: ${run.previousStatus}
- New state: ${run.newStatus}
- Evidence passed: ${run.evidenceEvaluation.passed ? "YES" : "NO"}
- Promotion eligible: ${run.promotionEligible ? "YES" : "NO"}
- Promoted: ${run.promoted ? "YES" : "NO"}
- Completed: ${run.completed ? "YES" : "NO"}

## Recovery

- Artifacts reconciled: ${run.recovery.artifactsReconciled ? "YES" : "NO"}
- Context refreshed: ${run.recovery.contextRefreshed ? "YES" : "NO"}
- Planning refreshed: ${run.recovery.planningRefreshed ? "YES" : "NO"}

## Validation

${run.validationEvidence
  .map(
    (item) =>
      `- ${item.id}: ${item.status} - ${item.summary}`
  )
  .join("\n") || "- No validation evidence."}

## Blocking Conditions

${run.blockers.length ? run.blockers.map((item) => `- ${item}`).join("\n") : "- None"}

No lifecycle state was manually edited. Completion, promotion, reconciliation, context refresh, and planning were delegated to their canonical authorities.
`;
}
