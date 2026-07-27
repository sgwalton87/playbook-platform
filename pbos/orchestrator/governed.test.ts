import { describe, expect, it } from "vitest";
import { compileContext, sha256 } from "../context";
import type { GovernedOrchestrationInput } from "./governed-contracts";
import { orchestrateLifecycle, OrchestrationError } from "./governed";

function baseInput(): GovernedOrchestrationInput {
  const content = "canonical orchestration authority";
  const context = compileContext({
    sources: [{ identifier: "PPS-808", title: "Autonomous Orchestration", version: "1.0.0", location: "docs/PPS/08_PBOS_ENGINE/PPS-808_AUTONOMOUS_ORCHESTRATION.md", status: "Canonical", owner: "PBOS", dependencies: [], content, digest: sha256(content), validationState: "verified" }],
    governanceDecisions: [],
    registry: { version: "1.0.0", validationState: "verified", documents: [{ identifier: "PPS-808", location: "docs/PPS/08_PBOS_ENGINE/PPS-808_AUTONOMOUS_ORCHESTRATION.md", owner: "PBOS", version: "1.0.0" }] },
    compilationTimestamp: "2026-07-26T00:00:00.000Z",
  });
  return {
    state: { completedStages: ["CONSTITUTION"], transitionHistory: [{ from: null, to: "CONSTITUTION", transitionedAt: "2026-07-25T00:00:00.000Z", evidenceReferences: ["constitution:evidence"] }] },
    artifacts: { constitution: { status: "VERIFIED", sourceDigest: sha256("constitution"), evidenceReferences: ["constitution:evidence"] }, context },
    governance: { approvalStatus: "approved", approvalIdentifier: "ORCH-APPROVAL-001", blockers: [], evidenceReferences: ["governance:evidence"], humanApprovalRequirements: [] },
    observationTimestamp: "2026-07-26T00:00:00.000Z",
  };
}

function failureCodes(input: GovernedOrchestrationInput): string[] {
  try { orchestrateLifecycle(input); return []; } catch (error) {
    expect(error).toBeInstanceOf(OrchestrationError);
    return (error as OrchestrationError).failures.map((item) => item.code);
  }
}

describe("governed PBOS orchestration", () => {
  it("progresses one valid lifecycle stage deterministically", () => {
    const first = orchestrateLifecycle(baseInput());
    expect(orchestrateLifecycle(baseInput())).toEqual(first);
    expect(first.currentLifecycleStage).toBe("CONTEXT");
    expect(first.nextEligibleStage).toBe("PLAN");
    expect(first.completedStages).toEqual(["CONSTITUTION", "CONTEXT"]);
  });

  it("rejects a skipped lifecycle stage", () => {
    const input = baseInput();
    delete input.artifacts.context;
    input.artifacts.plan = { selectedGate: "PBOS-GATE", reasoning: [], satisfiedDependencies: [], blockingDependencies: [], requiredValidations: ["test"], confidenceClassification: "HIGH", evidenceReferences: ["plan:evidence"] };
    expect(failureCodes(input)).toContain("SKIPPED_STAGE");
  });

  it("rejects an invalid multi-stage transition", () => {
    const input = baseInput();
    input.state.completedStages = [];
    input.state.transitionHistory = [];
    expect(failureCodes(input)).toContain("INVALID_TRANSITION");
  });

  it("rejects missing constitutional evidence", () => {
    const input = baseInput();
    input.artifacts.constitution!.evidenceReferences = [];
    expect(failureCodes(input)).toContain("MISSING_EVIDENCE");
  });

  it("stops at a blocked governance boundary", () => {
    const input = baseInput();
    input.governance.approvalStatus = "pending";
    input.governance.approvalIdentifier = null;
    input.governance.blockers = ["Human approval pending"];
    const result = orchestrateLifecycle(input);
    expect(result.nextEligibleStage).toBeNull();
    expect(result.blockedStages).toContain("PLAN");
    expect(result.humanApprovalRequirements).toContain("lifecycle-governance-approval");
  });

  it("rejects invalid Runtime Context", () => {
    const input = baseInput();
    input.artifacts.context!.contextDigest = "invalid";
    expect(failureCodes(input)).toContain("INVALID_CONTEXT");
  });
});
