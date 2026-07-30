import { describe, expect, it } from "vitest";
import { artifactDigest } from "../kernel/identity";
import {
  ConstitutionalExecutionKernel,
  type KernelInput,
  type KernelObjective,
} from "../kernel/execution";
import {
  transitionAutonomousExecution,
  type AutonomousExecutionPolicy,
} from "./autonomous";
import { assessMilestoneEligibility } from "./dependency-engine";
import { analyzePBOSSystemState } from "./intelligence";
import { generateCodexExecutionPackage } from "./prompt-generator";
import { recommendCanonicalMilestone } from "./recommendation";
import { GovernedPlanningEngine } from "./planning";

const now = "2026-07-30T12:00:00.000Z";

function objective(
  overrides: Partial<KernelObjective> = {}
): KernelObjective {
  return {
    id: "MILESTONE-001",
    description: "Implement the next governed milestone.",
    state: "READY",
    parentId: null,
    dependencyIds: [],
    childIds: [],
    constitutionalOrder: 1,
    priority: {
      constitutional: 100,
      strategic: 100,
      engineering: 100,
      business: 100,
      operational: 100,
    },
    risk: 10,
    estimatedEffort: 3,
    criticalPath: true,
    authority: "PBOS-CONSTITUTION",
    blockers: [],
    requiredApprovals: [],
    approvals: [],
    validations: ["npm test"],
    artifacts: [
      {
        id: "EVIDENCE-001",
        uri: "docs/evidence.md",
        digest: "a".repeat(64),
      },
    ],
    outputs: ["docs/output.md"],
    successCriteria: ["Tests pass."],
    failureCriteria: ["Validation fails."],
    rollback: ["Preserve prior state."],
    ...overrides,
  };
}

function input(
  objectives: KernelObjective[] = [objective()],
  repositoryValid = true
): KernelInput {
  const registryBody = {
    id: "PBOS-CONSTITUTIONAL-PLANNER",
    rootObjectiveIds: objectives
      .filter(({ dependencyIds }) => dependencyIds.length === 0)
      .map(({ id }) => id),
    objectives,
  };
  return {
    observedAt: now,
    repository: {
      root: "/repo",
      remote: "git@example/repo.git",
      head: "b".repeat(40),
      branch: "main",
      contentDigest: "c".repeat(64),
      valid: repositoryValid,
      errors: repositoryValid ? [] : ["Repository context invalid."],
    },
    runtime: {
      engineVersion: "3.0.0",
      mode: "planning",
      activeGate: null,
      completedGates: [],
      releaseState: "PROMOTION_COMPLETE",
      valid: true,
      errors: [],
    },
    constitution: {
      id: "CONSTITUTION",
      uri: "pbos/gates",
      digest: "d".repeat(64),
    },
    registry: {
      ...registryBody,
      digest: artifactDigest(registryBody),
    },
    priorityWeights: {
      constitutional: 30,
      strategic: 25,
      engineering: 20,
      business: 15,
      operational: 10,
    },
  };
}

describe("PBOS development orchestration", () => {
  it("selects only the canonical Kernel milestone and generates deterministic evidence", () => {
    const value = input();
    const kernel = new ConstitutionalExecutionKernel().plan(value);
    const assessments = value.registry.objectives.map((item) =>
      assessMilestoneEligibility(item, kernel)
    );
    const first = recommendCanonicalMilestone(value, kernel, assessments);
    const second = recommendCanonicalMilestone(value, kernel, assessments);
    expect(first).toEqual(second);
    expect(first.recommended_milestone).toBe("MILESTONE-001");
    expect(first.authority).toBe("PBOS-CONSTITUTIONAL-PLANNER");
    expect(first.evidence).toContain(kernel.decision.digest);
    expect(
      generateCodexExecutionPackage(value, first, kernel.plan)
    ).toEqual(generateCodexExecutionPackage(value, second, kernel.plan));
  });

  it("detects dependency and repository failures and rejects prompt generation", () => {
    const blockedObjective = objective({
      state: "BLOCKED",
      dependencyIds: ["MISSING-001"],
      blockers: ["EXTERNAL_PROVIDER_REQUIRED"],
    });
    const value = input([blockedObjective], false);
    const kernel = new ConstitutionalExecutionKernel().plan(value);
    const assessment = assessMilestoneEligibility(blockedObjective, kernel);
    const recommendation = recommendCanonicalMilestone(
      value,
      kernel,
      [assessment]
    );
    expect(assessment.state).toBe("WAITING_EXTERNAL_INPUT");
    expect(recommendation.recommended_milestone).toBeNull();
    expect(recommendation.confidence).toBe(0);
    expect(recommendation.blocking_conditions.length).toBeGreaterThan(0);
    expect(() =>
      generateCodexExecutionPackage(value, recommendation, kernel.plan)
    ).toThrow("blocked");
    expect(analyzePBOSSystemState(value, kernel).repository.validation_status).toBe(
      "INVALID"
    );
  });

  it("requires explicit human approval before autonomous execution", () => {
    const body: AutonomousExecutionPolicy = {
      policy_id: "AUTO-001",
      package_id: "CODEX-001",
      state: "PROPOSED",
      human_approval_required: true,
      approved_by: null,
      approval_reference: null,
      evidence: ["RECOMMENDATION-001"],
      timestamp: now,
      digest: "",
    };
    const proposed = {
      ...body,
      digest: artifactDigest({ ...body, digest: undefined }),
    };
    expect(() =>
      transitionAutonomousExecution(
        proposed,
        "APPROVED",
        "HUMAN-001",
        null,
        now
      )
    ).toThrow("rejected");
    const approved = transitionAutonomousExecution(
      proposed,
      "APPROVED",
      "HUMAN-001",
      "APPROVAL-001",
      now
    );
    expect(
      transitionAutonomousExecution(
        approved,
        "EXECUTING",
        "PBOS-EXECUTOR",
        null,
        now
      ).state
    ).toBe("EXECUTING");
  });

  it("blocks governed planning when context is invalid", () => {
    const value = input([objective()], false);
    const kernel = new ConstitutionalExecutionKernel().plan(value);
    const eligibility = value.registry.objectives.map((item) =>
      assessMilestoneEligibility(item, kernel)
    );
    const canonical = recommendCanonicalMilestone(value, kernel, eligibility);
    const intelligence = analyzePBOSSystemState(value, kernel);
    const recommendation = new GovernedPlanningEngine().recommend({
      assessment: intelligence.assessment,
      canonical,
      eligibility,
    });
    expect(intelligence.assessment.current_maturity).toBe("BLOCKED");
    expect(recommendation.recommended_milestone).toBeNull();
    expect(recommendation.evidence_references).toContain(
      intelligence.assessment.digest
    );
  });

  it("permits only an eligible canonical milestone", () => {
    const value = input();
    const kernel = new ConstitutionalExecutionKernel().plan(value);
    const eligibility = value.registry.objectives.map((item) =>
      assessMilestoneEligibility(item, kernel)
    );
    const canonical = recommendCanonicalMilestone(value, kernel, eligibility);
    const assessment = analyzePBOSSystemState(value, kernel).assessment;
    const first = new GovernedPlanningEngine().recommend({
      assessment,
      canonical,
      eligibility,
    });
    const second = new GovernedPlanningEngine().recommend({
      assessment,
      canonical,
      eligibility,
    });
    expect(first).toEqual(second);
    expect(first.recommended_milestone).toBe("MILESTONE-001");
    expect(first.authority).toBe("PBOS-CONSTITUTIONAL-PLANNER");
  });
});
