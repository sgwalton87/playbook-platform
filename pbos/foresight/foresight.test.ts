import { describe, expect, it } from "vitest";
import { compileContext, sha256 } from "../context";
import type { DiscoveryReport } from "../discovery";
import type { KnowledgeReport } from "../knowledge";
import type { SimulationReport } from "../simulation";
import type { ForesightInput } from "./contracts";
import { ForesightError } from "./errors";
import { createForesightReport } from "./reporting";
import { transitionForesight } from "./state-machine";

function input(): ForesightInput {
  const content = "canonical foresight authority";
  const runtimeContext = compileContext({
    sources: [{ identifier: "PPS-809", title: "Foresight Governance", version: "1.0.0", location: "docs/PPS/PPS-809.md", status: "Canonical", owner: "PBOS", dependencies: [], content, digest: sha256(content), validationState: "verified" }],
    governanceDecisions: [],
    registry: { version: "1.0.0", validationState: "verified", documents: [{ identifier: "PPS-809", location: "docs/PPS/PPS-809.md", owner: "PBOS", version: "1.0.0" }] },
    compilationTimestamp: "2026-07-26T00:00:00.000Z",
  });
  const evidence = ["evidence:signal:1", "evidence:history:1", "evidence:simulation:1"];
  const discoveryReport: DiscoveryReport = {
    reportId: "PBOS-DISC-1234567890ABCDEF", observationTimestamp: "2026-07-25T00:00:00.000Z", runtimeContextDigest: runtimeContext.contextDigest,
    sourceInventory: [], discoveredSignals: [], opportunities: [], risks: [], informationGaps: [], recommendations: [], confidenceClassifications: ["MEDIUM"], evidenceBundle: evidence,
  };
  const knowledgeReport: KnowledgeReport = {
    reportId: "PBOS-KNOW-1234567890ABCDEF", runtimeContextDigest: runtimeContext.contextDigest, generatedAt: "2026-07-25T00:00:00.000Z", knowledgeSources: ["HIST-1"],
    entities: [], relationships: [], precedents: [], lessons: [], evidenceBundle: evidence, confidenceClassification: "MEDIUM",
  };
  const simulationReport: SimulationReport = {
    reportId: "PBOS-SIM-1234567890ABCDEF", runtimeContextDigest: runtimeContext.contextDigest, generatedAt: "2026-07-25T00:00:00.000Z", simulationQuestion: "What conditions may require preparation?",
    scenariosAnalyzed: [], assumptions: [], pathways: [], outcomes: [], comparisons: [], risks: [], evidenceBundle: evidence,
    uncertaintyStatements: ["Possible, not predicted."], confidenceClassification: "MEDIUM",
    provenance: { runtimeContextDigest: runtimeContext.contextDigest, knowledgeReportIds: [knowledgeReport.reportId], strategyReportIds: [], discoveryReportIds: [discoveryReport.reportId], metaReportIds: [], evidenceReferences: evidence },
  };
  return {
    runtimeContext,
    discoveryReports: [discoveryReport],
    knowledgeReports: [knowledgeReport],
    simulationReports: [simulationReport],
    strategyReports: [],
    trendDrafts: [{
      description: "Evidence review signals have recurred across recorded periods.", supportingEvidence: ["evidence:signal:1", "evidence:history:1"],
      originatingSignalIds: ["SIG-1"], historicalReferences: ["HIST-1"], affectedDomains: ["validation"], timeframe: "MEDIUM_TERM",
      limitations: ["Recurrence does not establish future continuation."],
    }],
    emergingSignalDrafts: [{
      description: "Evidence review demand has appeared repeatedly.", sourceEvidence: ["evidence:signal:1", "evidence:history:1"], firstObservation: "2026-07-01T00:00:00.000Z",
      recurrenceCount: 2, affectedSystems: ["validation"], limitations: ["Recorded observations may be incomplete."],
    }],
    futureConditionDrafts: [{
      description: "Evidence review capacity may require additional attention.", supportingEvidence: ["evidence:simulation:1"], contributingSignalIds: ["SIG-1"],
      assumptions: ["Recorded demand may continue."], possibleImpacts: ["Review queues may change."], affectedStakeholders: ["Scholars"], classification: "POSSIBLE",
      limitations: ["Future demand and capacity are unknown."],
    }],
    preparednessDrafts: [{
      areaOfPreparation: "Evidence review readiness", supportingEvidence: ["evidence:simulation:1"], futureConditionDescription: "Evidence review capacity may require additional attention.",
      recommendedQuestions: ["What capacity evidence should leadership review?"], resourcesToEvaluate: ["Review capacity"], risks: ["False urgency"], requiredAuthority: ["resource-commitment"],
    }],
    horizonDefinitions: { NEAR_TERM: "Within one approved planning cycle.", MEDIUM_TERM: "Across two to three approved planning cycles.", LONG_TERM: "Beyond three approved planning cycles." },
    generatedAt: "2026-07-26T00:00:00.000Z", predictionPresentedAsFact: false, unauthorizedDirectionRequested: false,
  };
}

function codes(action: () => unknown): string[] {
  try { action(); return []; } catch (error) {
    expect(error).toBeInstanceOf(ForesightError);
    return (error as ForesightError).failures.map(({ code }) => code);
  }
}

describe("PBOS governed foresight intelligence", () => {
  it("creates deterministic evidence-backed reports and trends", () => {
    const first = createForesightReport(input());
    expect(createForesightReport(input())).toEqual(first);
    expect(first.reportId).toMatch(/^PBOS-FOR-[A-F0-9]{16}$/);
    expect(first.trendInventory[0].classification).toBe("TREND_NOT_PREDICTION");
  });

  it("preserves trend evidence and historical provenance", () => {
    const trend = createForesightReport(input()).trendInventory[0];
    expect(trend.supportingEvidence).toEqual(["evidence:history:1", "evidence:signal:1"]);
    expect(trend.historicalReferences).toEqual(["HIST-1"]);
  });

  it("preserves uncertainty across every horizon", () => {
    const horizons = createForesightReport(input()).horizonAnalysis;
    expect(horizons).toHaveLength(3);
    expect(horizons.every(({ uncertaintyStatement }) => uncertaintyStatement.includes("does not establish"))).toBe(true);
  });

  it("preserves emerging-signal uncertainty and avoids causation", () => {
    const signal = createForesightReport(input()).emergingSignals[0];
    expect(signal.recurrenceCount).toBe(2);
    expect(signal.uncertaintyStatement).toContain("does not establish cause");
  });

  it("keeps future conditions limited and preparedness advisory", () => {
    const report = createForesightReport(input());
    expect(report.possibleFutureConditions[0].limitations).toHaveLength(1);
    expect(report.preparednessOpportunities[0]).toMatchObject({ advisoryOnly: true, commitmentCreated: false });
    expect(report.preparednessOpportunities[0].requiredApprovals).toContain("resource-owner");
  });

  it("rejects missing evidence", () => {
    const value = input(); value.trendDrafts[0].supportingEvidence = ["invented:evidence"];
    expect(codes(() => createForesightReport(value))).toContain("MISSING_EVIDENCE");
  });

  it("rejects predictions presented as facts", () => {
    const value = input(); value.predictionPresentedAsFact = true;
    expect(codes(() => createForesightReport(value))).toContain("PREDICTION_PROHIBITED");
  });

  it("rejects unsupported trends", () => {
    const value = input(); value.trendDrafts[0].historicalReferences = [];
    expect(codes(() => createForesightReport(value))).toContain("UNSUPPORTED_TREND");
  });

  it("rejects invalid context", () => {
    const value = input(); value.runtimeContext = null;
    expect(codes(() => createForesightReport(value))).toContain("INVALID_CONTEXT");
  });

  it("rejects governance bypass", () => {
    const pending = { status: "pending" as const, approvalIdentifier: null, evidenceReferences: [] };
    expect(codes(() => transitionForesight({ currentState: "GOVERNANCE_REVIEW", transitions: [] }, "ARCHIVED", "2026-07-26T00:00:00.000Z", pending))).toContain("GOVERNANCE_BYPASS");
  });
});
