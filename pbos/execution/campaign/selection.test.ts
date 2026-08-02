import { describe, expect, it } from "vitest";
import { artifactDigest } from "../../kernel";
import { ConstitutionalExecutionKernel, type KernelInput, type KernelObjective } from "../../kernel/execution";
import { constrainKernelInputToCampaign, type CampaignMilestoneSelection } from "./selection";

const target = "PLAYBOOK-ROLE-ACTIVATION-FOUNDATION-001";

function objective(id: string, state: KernelObjective["state"], dependencies: string[] = []): KernelObjective {
  return {
    id, description: id, state, parentId: dependencies[0] ?? null,
    dependencyIds: dependencies, childIds: [], constitutionalOrder: 1,
    priority: { constitutional: 100, strategic: 100, engineering: 100, business: 100, operational: 100 },
    risk: 60, estimatedEffort: 1, criticalPath: true, authority: "PBOS-KERNEL",
    blockers: [], requiredApprovals: [], approvals: [], validations: ["npm test"],
    artifacts: [{ id: `${id}-EVIDENCE`, uri: "docs/evidence.md", digest: "a".repeat(64) }],
    outputs: ["docs/output.md"], successCriteria: ["Complete."],
    failureCriteria: ["Validation fails."], rollback: ["Preserve prior state."],
  };
}

function kernelInput(programState: KernelObjective["state"]): KernelInput {
  const objectives = [
    objective("PLAYBOOK-PROGRAM-001", programState),
    objective(target, "READY", ["PLAYBOOK-PROGRAM-001"]),
    objective("SCHOLAR-RECORD-ENGINE-001", "READY"),
  ];
  const registryBody = { id: "REGISTRY", rootObjectiveIds: ["PLAYBOOK-PROGRAM-001", "SCHOLAR-RECORD-ENGINE-001"], objectives };
  return {
    observedAt: "2026-08-02T20:00:00.000Z",
    repository: { root: "/repo", remote: "origin", head: "b".repeat(40), branch: "main", contentDigest: "c".repeat(64), valid: true, errors: [] },
    runtime: { engineVersion: "3.0.0", mode: "planning", activeGate: null, completedGates: [], releaseState: "PROMOTION_COMPLETE", valid: true, errors: [] },
    constitution: { id: "CONSTITUTION", uri: "CODEX.md", digest: "d".repeat(64) },
    registry: { ...registryBody, digest: artifactDigest(registryBody) },
    priorityWeights: { constitutional: 30, strategic: 25, engineering: 20, business: 15, operational: 10 },
  };
}

const selection: CampaignMilestoneSelection = { constrained: true, milestone_id: target, findings: [] };

describe("campaign-aware constitutional selection", () => {
  it("selects pending package four instead of an eligible out-of-campaign milestone", () => {
    const constrained = constrainKernelInputToCampaign({ kernelInput: kernelInput("COMPLETED"), selection });
    expect(constrained.findings).toEqual([]);
    const result = new ConstitutionalExecutionKernel().plan(constrained.input);
    expect(result.decision.selectedObjectiveId).toBe(target);
    expect(result.decision.eligibleObjectiveIds).not.toContain("SCHOLAR-RECORD-ENGINE-001");
    expect(result.certification.status).toBe("CERTIFIED");
  });

  it("reports the exact campaign dependency blocker without selecting unrelated work", () => {
    const constrained = constrainKernelInputToCampaign({ kernelInput: kernelInput("READY"), selection });
    expect(constrained.findings).toContain(`${target}:DEPENDENCY_INCOMPLETE:PLAYBOOK-PROGRAM-001`);
    const result = new ConstitutionalExecutionKernel().plan(constrained.input);
    expect(result.decision.selectedObjectiveId).toBeNull();
    expect(result.decision.eligibleObjectiveIds).not.toContain("SCHOLAR-RECORD-ENGINE-001");
  });
});
