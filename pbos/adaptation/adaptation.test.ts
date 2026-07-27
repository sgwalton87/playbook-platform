import { describe, expect, it } from "vitest";
import { compileContext, sha256 } from "../context";
import type { AutonomyObservation } from "../autonomy";
import type { AdaptationApproval, AdaptationInput, ImprovementProposalDraft } from "./contracts";
import { AdaptationError } from "./errors";
import { detectAdaptationPatterns } from "./patterns";
import { appendInstitutionalMemory, createImprovementProposal } from "./proposals";
import { transitionAdaptation } from "./state-machine";

function input(): AdaptationInput {
  const content = "canonical adaptation authority";
  const runtimeContext = compileContext({
    sources: [{ identifier: "PPS-808", title: "Autonomous Orchestration", version: "1.0.0", location: "docs/PPS/08_PBOS_ENGINE/PPS-808_AUTONOMOUS_ORCHESTRATION.md", status: "Canonical", owner: "PBOS", dependencies: [], content, digest: sha256(content), validationState: "verified" }],
    governanceDecisions: [],
    registry: { version: "1.0.0", validationState: "verified", documents: [{ identifier: "PPS-808", location: "docs/PPS/08_PBOS_ENGINE/PPS-808_AUTONOMOUS_ORCHESTRATION.md", owner: "PBOS", version: "1.0.0" }] },
    compilationTimestamp: "2026-07-26T00:00:00.000Z",
  });
  const observation: AutonomyObservation = { observationId: "PBOS-OBS-1234567890ABCDEF", observationTimestamp: "2026-07-26T00:00:00.000Z", inputContextDigest: runtimeContext.contextDigest, currentLifecycleStage: "VALIDATE", completedStages: ["CONSTITUTION", "CONTEXT", "PLAN", "EXECUTE", "VALIDATE"], availableNextActions: [], blockedConditions: ["validation:test"], missingEvidence: [], governanceRequirements: [], validationStatus: "FAIL", releaseStatus: "NOT_AVAILABLE", evidenceReferences: ["observation:evidence"] };
  return {
    runtimeContext,
    historicalEvidence: [
      { identifier: "HIST-001", signalType: "VALIDATION_FAILURE", signal: "test-suite-failure", affectedSystem: "PBOS Validation", observedAt: "2026-07-24T00:00:00.000Z", evidenceReferences: ["test:run-1"], remediationReference: "remediation:1" },
      { identifier: "HIST-002", signalType: "VALIDATION_FAILURE", signal: "test-suite-failure", affectedSystem: "PBOS Validation", observedAt: "2026-07-25T00:00:00.000Z", evidenceReferences: ["test:run-2"], remediationReference: "remediation:2" },
    ],
    autonomyObservations: [observation],
    autonomyRecommendations: [],
    lifecycleHistory: [{ identifier: "LIFE-001", gateIdentifier: "PBOS-VALIDATE", outcome: "failed", evidenceReferences: ["lifecycle:evidence"] }],
  };
}

const draft: ImprovementProposalDraft = { improvementDescription: "Improve validation fixture reliability.", expectedImpact: "Reduce recurring evidence-backed test failures.", risks: ["May require test harness changes."], constitutionalConsiderations: ["Preserve validation authority."], changeType: "architecture", directModificationRequested: false };

function failureCodes(action: () => unknown): string[] {
  try { action(); return []; } catch (error) {
    expect(error).toBeInstanceOf(AdaptationError);
    return (error as AdaptationError).failures.map((failure) => failure.code);
  }
}

describe("PBOS governed adaptation", () => {
  it("detects deterministic patterns only from repeated evidence", () => {
    const first = detectAdaptationPatterns(input());
    expect(detectAdaptationPatterns(input())).toEqual(first);
    expect(first).toHaveLength(1);
    expect(first[0].occurrenceCount).toBe(2);
    expect(first[0].cause).toBe("UNDETERMINED");
  });

  it("creates advisory proposals that preserve evidence and governance routing", () => {
    const value = input();
    const proposal = createImprovementProposal(detectAdaptationPatterns(value)[0], draft, value);
    expect(proposal.supportingEvidence).toEqual(["test:run-1", "test:run-2"]);
    expect(proposal.requiredApprovals).toContain("architecture-review-approval");
    expect(proposal.institutionalMemory.sourceObservationIds).toContain("PBOS-OBS-1234567890ABCDEF");
    expect(proposal.advisoryOnly).toBe(true);
  });

  it("routes approved proposals into lifecycle flow and retains outcomes", () => {
    const value = input();
    const proposal = createImprovementProposal(detectAdaptationPatterns(value)[0], draft, value);
    const approval: AdaptationApproval = { status: "approved", approvalIdentifier: "HUMAN-001", evidenceReferences: ["approval:evidence"] };
    const approved = transitionAdaptation({ currentState: "GOVERNANCE_REVIEW", transitions: [] }, "APPROVED_CHANGE", "2026-07-26T00:00:00.000Z", approval, approval.evidenceReferences);
    const lifecycle = transitionAdaptation(approved, "LIFECYCLE_EXECUTION", "2026-07-26T00:01:00.000Z", approval, ["execution:evidence"]);
    const remembered = appendInstitutionalMemory(proposal, { decisionOutcome: "approved", approvalRecord: "HUMAN-001", lifecycleResult: "execution-started" });
    expect(lifecycle.currentState).toBe("LIFECYCLE_EXECUTION");
    expect(remembered.institutionalMemory.approvalRecords).toContain("HUMAN-001");
  });

  it("rejects missing evidence", () => {
    const value = input();
    value.historicalEvidence[0].evidenceReferences = [];
    expect(failureCodes(() => detectAdaptationPatterns(value))).toContain("MISSING_EVIDENCE");
  });

  it("rejects invalid context", () => {
    const value = input();
    value.runtimeContext!.contextDigest = "invalid";
    expect(failureCodes(() => detectAdaptationPatterns(value))).toContain("INVALID_CONTEXT");
  });

  it("rejects unauthorized proposal data", () => {
    const value = input();
    expect(failureCodes(() => createImprovementProposal(detectAdaptationPatterns(value)[0], { ...draft, risks: [] }, value))).toContain("UNAUTHORIZED_CHANGE");
  });

  it("rejects governance bypass", () => {
    const approval: AdaptationApproval = { status: "pending", approvalIdentifier: null, evidenceReferences: [] };
    expect(failureCodes(() => transitionAdaptation({ currentState: "GOVERNANCE_REVIEW", transitions: [] }, "APPROVED_CHANGE", "2026-07-26T00:00:00.000Z", approval, ["evidence"]))).toContain("GOVERNANCE_BYPASS");
  });

  it("rejects self-modification requests", () => {
    const value = input();
    expect(failureCodes(() => createImprovementProposal(detectAdaptationPatterns(value)[0], { ...draft, directModificationRequested: true }, value))).toContain("SELF_MODIFICATION");
  });

  it("rejects missing proposal provenance", () => {
    const value = input();
    value.autonomyObservations = [];
    expect(failureCodes(() => createImprovementProposal(detectAdaptationPatterns(value)[0], draft, value))).toContain("MISSING_PROVENANCE");
  });

  it("rejects invalid adaptation transitions", () => {
    const approval: AdaptationApproval = { status: "approved", approvalIdentifier: "HUMAN-001", evidenceReferences: ["approval"] };
    expect(failureCodes(() => transitionAdaptation({ currentState: "OBSERVING", transitions: [] }, "RELEASE", "2026-07-26T00:00:00.000Z", approval, ["evidence"]))).toContain("INVALID_TRANSITION");
  });

  it("rejects empty institutional-memory updates", () => {
    const value = input();
    const proposal = createImprovementProposal(detectAdaptationPatterns(value)[0], draft, value);
    expect(failureCodes(() => appendInstitutionalMemory(proposal, {}))).toContain("MISSING_PROVENANCE");
  });
});
