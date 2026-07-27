import { describe, expect, it } from "vitest";
import { compileContext, digestValue, sha256 } from "../context";
import type { GovernedOrchestrationResult } from "../orchestrator";
import type { AutonomyApproval, AutonomyInput } from "./contracts";
import { observeAutonomy, AutonomyError } from "./observation";
import { recommendAutonomy } from "./recommendation";
import { auditAutonomyDecision, transitionAutonomy } from "./state-machine";

function input(): AutonomyInput {
  const content = "canonical autonomy authority";
  const runtimeContext = compileContext({
    sources: [{ identifier: "PPS-808", title: "Autonomous Orchestration", version: "1.0.0", location: "docs/PPS/08_PBOS_ENGINE/PPS-808_AUTONOMOUS_ORCHESTRATION.md", status: "Canonical", owner: "PBOS", dependencies: [], content, digest: sha256(content), validationState: "verified" }],
    governanceDecisions: [],
    registry: { version: "1.0.0", validationState: "verified", documents: [{ identifier: "PPS-808", location: "docs/PPS/08_PBOS_ENGINE/PPS-808_AUTONOMOUS_ORCHESTRATION.md", owner: "PBOS", version: "1.0.0" }] },
    compilationTimestamp: "2026-07-26T00:00:00.000Z",
  });
  const lifecycleState: GovernedOrchestrationResult = { orchestrationId: "PBOS-ORCH-1234567890ABCDEF", currentLifecycleStage: "PLAN", completedStages: ["CONSTITUTION", "CONTEXT", "PLAN"], nextEligibleStage: "EXECUTE", blockedStages: [], evidenceReferences: ["lifecycle:evidence"], stateTransitionHistory: [], humanApprovalRequirements: [] };
  return {
    runtimeContext,
    repositoryState: { branch: "work", commit: "5b3fb3c", workingTree: "clean", changedFiles: ["pbos/autonomy/observation.ts"] },
    lifecycleState,
    governanceState: { status: "resolved", approvalStatus: "approved", approvalIdentifier: "GOV-001", blockers: [], requiredApprovals: [], evidenceReferences: ["governance:evidence"] },
    engineOutputs: {},
    observationTimestamp: "2026-07-26T00:00:00.000Z",
  };
}

function failureCodes(action: () => unknown): string[] {
  try { action(); return []; } catch (error) {
    expect(error).toBeInstanceOf(AutonomyError);
    return (error as AutonomyError).failures.map((failure) => failure.code);
  }
}

describe("PBOS governed autonomy", () => {
  it("creates a deterministic factual observation from valid context", () => {
    const first = observeAutonomy(input());
    expect(observeAutonomy(input())).toEqual(first);
    expect(first.availableNextActions).toEqual(["ADVANCE_EXECUTE"]);
    expect(first.observationId).toMatch(/^PBOS-OBS-[A-F0-9]{16}$/);
  });

  it("creates an advisory recommendation and preserves evidence", () => {
    const observation = observeAutonomy(input());
    const recommendation = recommendAutonomy(observation);
    expect(recommendation.recommendedAction).toBe("ADVANCE_EXECUTE");
    expect(recommendation.requiredApprovals).toContain("execution-authorization");
    expect(recommendation.evidenceReferences).toEqual(observation.evidenceReferences);
    expect(recommendation.advisoryOnly).toBe(true);
  });

  it("advances approved recommendations and creates a provenance audit", () => {
    const observation = observeAutonomy(input());
    const recommendation = recommendAutonomy(observation);
    const approval: AutonomyApproval = { status: "approved", approvalIdentifier: "HUMAN-001", evidenceReferences: ["approval:evidence"] };
    const state = transitionAutonomy({ currentState: "WAITING_FOR_APPROVAL", transitions: [] }, "EXECUTING_APPROVED_WORK", input().observationTimestamp, approval, recommendation.evidenceReferences);
    const audit = auditAutonomyDecision(recommendation, approval, observation.currentLifecycleStage, state.transitions[0], observation.observationTimestamp, observation.inputContextDigest);
    expect(state.currentState).toBe("EXECUTING_APPROVED_WORK");
    expect(audit.inputContextDigest).toBe(observation.inputContextDigest);
    expect(audit.decisionId).toMatch(/^PBOS-AUTO-[A-F0-9]{16}$/);
  });

  it("keeps observed blockers blocked", () => {
    const value = input();
    value.lifecycleState.blockedStages = ["EXECUTE"];
    value.lifecycleState.nextEligibleStage = null;
    const recommendation = recommendAutonomy(observeAutonomy(value));
    expect(recommendation.recommendedAction).toBe("REMAIN_BLOCKED");
    expect(recommendation.blockedConditions).toContain("lifecycle:EXECUTE");
  });

  it("rejects invalid context", () => {
    const value = input();
    value.runtimeContext!.contextDigest = "invalid";
    expect(failureCodes(() => observeAutonomy(value))).toContain("INVALID_CONTEXT");
  });

  it("rejects missing constitutional authority", () => {
    const value = input();
    const context = value.runtimeContext!;
    context.documentInventory = [];
    const { contextDigest: _digest, ...body } = context;
    context.contextDigest = digestValue(body);
    expect(failureCodes(() => observeAutonomy(value))).toContain("MISSING_AUTHORITY");
  });

  it("rejects governance conflict", () => {
    const value = input();
    value.governanceState.status = "conflict";
    expect(failureCodes(() => observeAutonomy(value))).toContain("GOVERNANCE_CONFLICT");
  });

  it("rejects unauthorized execution", () => {
    const approval: AutonomyApproval = { status: "pending", approvalIdentifier: null, evidenceReferences: [] };
    expect(failureCodes(() => transitionAutonomy({ currentState: "WAITING_FOR_APPROVAL", transitions: [] }, "EXECUTING_APPROVED_WORK", input().observationTimestamp, approval, ["evidence"]))).toContain("UNAUTHORIZED_EXECUTION");
  });

  it("rejects skipped lifecycle state", () => {
    const value = input();
    value.lifecycleState.completedStages = ["CONSTITUTION", "PLAN"];
    expect(failureCodes(() => observeAutonomy(value))).toContain("INVALID_LIFECYCLE");
  });

  it("rejects missing observation evidence", () => {
    const value = input();
    value.repositoryState.commit = "missing";
    expect(failureCodes(() => observeAutonomy(value))).toContain("MISSING_EVIDENCE");
  });

  it("rejects invalid autonomy transitions", () => {
    const approval: AutonomyApproval = { status: "approved", approvalIdentifier: "HUMAN-001", evidenceReferences: ["approval"] };
    expect(failureCodes(() => transitionAutonomy({ currentState: "OBSERVING", transitions: [] }, "CERTIFYING", input().observationTimestamp, approval, ["evidence"]))).toContain("INVALID_TRANSITION");
  });
});
