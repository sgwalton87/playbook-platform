import { describe, expect, it } from "vitest";
import { compileContext, sha256 } from "../context";
import type { MetaApproval, MetaInput } from "./contracts";
import { MetaIntelligenceError } from "./errors";
import { createSystemIntelligenceReport } from "./report";
import { transitionMeta } from "./state-machine";

function input(): MetaInput {
  const content = "canonical meta authority";
  const runtimeContext = compileContext({
    sources: [{ identifier: "PPS-809", title: "Engine Governance", version: "1.0.0", location: "docs/PPS/08_PBOS_ENGINE/PPS-809_ENGINE_GOVERNANCE.md", status: "Canonical", owner: "PBOS", dependencies: [], content, digest: sha256(content), validationState: "verified" }],
    governanceDecisions: [],
    registry: { version: "1.0.0", validationState: "verified", documents: [{ identifier: "PPS-809", location: "docs/PPS/08_PBOS_ENGINE/PPS-809_ENGINE_GOVERNANCE.md", owner: "PBOS", version: "1.0.0" }] },
    compilationTimestamp: "2026-07-26T00:00:00.000Z",
  });
  return {
    runtimeContext,
    expectedEngines: ["context", "planning", "validation"],
    engineHistory: [
      { identifier: "ENG-001", engine: "context", outcome: "SUCCESS", durationMs: 10, evidenceComplete: true, evidenceReferences: ["engine:1"] },
      { identifier: "ENG-002", engine: "planning", outcome: "BLOCKED", durationMs: 20, evidenceComplete: true, evidenceReferences: ["engine:2"] },
      { identifier: "ENG-003", engine: "validation", outcome: "FAILURE", durationMs: 30, evidenceComplete: true, evidenceReferences: ["engine:3"] },
    ],
    lifecycleHistory: [
      { identifier: "LIFE-001", stage: "VALIDATE", outcome: "BLOCKED", startedAt: "2026-07-24T00:00:00.000Z", finishedAt: "2026-07-24T00:01:00.000Z", evidenceComplete: true, evidenceReferences: ["life:1"] },
      { identifier: "LIFE-002", stage: "VALIDATE", outcome: "BLOCKED", startedAt: "2026-07-25T00:00:00.000Z", finishedAt: "2026-07-25T00:02:00.000Z", evidenceComplete: true, evidenceReferences: ["life:2"] },
    ],
    governanceHistory: [
      { identifier: "GOV-001", status: "APPROVED", requestedAt: "2026-07-24T00:00:00.000Z", resolvedAt: "2026-07-24T01:00:00.000Z", blockers: ["review-capacity"], evidenceReferences: ["gov:1"] },
      { identifier: "GOV-002", status: "PENDING", requestedAt: "2026-07-25T00:00:00.000Z", blockers: ["review-capacity"], evidenceReferences: ["gov:2"] },
    ],
    institutionalMemory: [{ sourceObservationIds: ["OBS-1"], sourceRecordIdentifiers: ["HIST-1"], evidenceReferences: ["memory:1"], historicalContext: ["context"], decisionOutcomes: [], approvalRecords: [], lifecycleResults: [] }],
    patterns: [{ patternId: "PBOS-PAT-1234567890ABCDEF", signalType: "BLOCKED_TRANSITION", signal: "validation-blocked", occurrenceCount: 2, affectedSystems: ["validation"], sourceRecordIdentifiers: ["LIFE-001", "LIFE-002"], supportingEvidence: ["life:1", "life:2"], cause: "UNDETERMINED" }],
    proposals: [],
    analysisTimestamp: "2026-07-26T00:00:00.000Z",
    directModificationRequested: false,
    causalClaimRequested: false,
  };
}

function failureCodes(action: () => unknown): string[] {
  try { action(); return []; } catch (error) {
    expect(error).toBeInstanceOf(MetaIntelligenceError);
    return (error as MetaIntelligenceError).failures.map((failure) => failure.code);
  }
}

describe("PBOS governed meta intelligence", () => {
  it("creates deterministic evidence-backed reports", () => {
    const first = createSystemIntelligenceReport(input());
    expect(createSystemIntelligenceReport(input())).toEqual(first);
    expect(first.reportId).toMatch(/^PBOS-META-[A-F0-9]{16}$/);
    expect(first.lifecycleAnalysis.bottlenecks).toContain("VALIDATE: repeated blocked transitions observed.");
  });

  it("preserves explainability and pattern provenance", () => {
    const report = createSystemIntelligenceReport(input());
    expect(report.systemHealthSummary.metrics.every((metric) => metric.sourceEvidence.length && metric.calculationMethod && metric.limitations.length)).toBe(true);
    expect(report.recurringPatterns[0].supportingEvidence).toEqual(["life:1", "life:2"]);
    expect(report.risks.every((risk) => risk.includes("causation is not established") || risk.includes("observability risk"))).toBe(true);
  });

  it("keeps recommendations advisory", () => {
    expect(createSystemIntelligenceReport(input()).recommendations.every((item) => item.advisoryOnly && item.classification === "RECOMMENDATION")).toBe(true);
  });

  it("rejects missing context", () => {
    const value = input(); value.runtimeContext = null;
    expect(failureCodes(() => createSystemIntelligenceReport(value))).toContain("MISSING_CONTEXT");
  });

  it("rejects invalid evidence", () => {
    const value = input(); value.engineHistory[0].evidenceReferences = [];
    expect(failureCodes(() => createSystemIntelligenceReport(value))).toContain("INVALID_EVIDENCE");
  });

  it("rejects unauthorized modification", () => {
    const value = input(); value.directModificationRequested = true;
    expect(failureCodes(() => createSystemIntelligenceReport(value))).toContain("UNAUTHORIZED_MODIFICATION");
  });

  it("rejects missing provenance", () => {
    const value = input(); value.patterns[0].sourceRecordIdentifiers = [];
    expect(failureCodes(() => createSystemIntelligenceReport(value))).toContain("MISSING_PROVENANCE");
  });

  it("rejects unsupported causal claims", () => {
    const value = input(); value.causalClaimRequested = true;
    expect(failureCodes(() => createSystemIntelligenceReport(value))).toContain("UNSUPPORTED_CAUSAL_CLAIM");
  });

  it("rejects invalid state transitions and governance bypass", () => {
    const approval: MetaApproval = { status: "pending", approvalIdentifier: null, evidenceReferences: [] };
    expect(failureCodes(() => transitionMeta({ currentState: "OBSERVING", transitions: [] }, "ARCHIVED", "2026-07-26T00:00:00.000Z", approval, ["evidence"]))).toContain("INVALID_TRANSITION");
    expect(failureCodes(() => transitionMeta({ currentState: "GOVERNANCE_REVIEW", transitions: [] }, "ARCHIVED", "2026-07-26T00:00:00.000Z", approval, ["evidence"]))).toContain("GOVERNANCE_BYPASS");
  });
});
