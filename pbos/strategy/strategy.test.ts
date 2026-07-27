import { describe, expect, it } from "vitest";
import { compileContext, sha256 } from "../context";
import type { DiscoveryReport } from "../discovery";
import type { StrategyInput } from "./contracts";
import { StrategyError } from "./errors";
import { createStrategyReport } from "./report";
import { transitionStrategy } from "./state-machine";

function input(): StrategyInput {
  const content = "canonical strategy authority";
  const runtimeContext = compileContext({ sources: [{ identifier: "PPS-809", title: "Engine Governance", version: "1.0.0", location: "docs/PPS/08_PBOS_ENGINE/PPS-809_ENGINE_GOVERNANCE.md", status: "Canonical", owner: "PBOS", dependencies: [], content, digest: sha256(content), validationState: "verified", rules: [{ id: "RULE-1", effect: "approval-required", subject: "strategy", description: "Leadership approves strategy." }] }], governanceDecisions: [], registry: { version: "1.0.0", validationState: "verified", documents: [{ identifier: "PPS-809", location: "docs/PPS/08_PBOS_ENGINE/PPS-809_ENGINE_GOVERNANCE.md", owner: "PBOS", version: "1.0.0" }] }, compilationTimestamp: "2026-07-26T00:00:00.000Z" });
  const discoveryReport: DiscoveryReport = { reportId: "PBOS-DISC-1234567890ABCDEF", observationTimestamp: "2026-07-26T01:00:00.000Z", runtimeContextDigest: runtimeContext.contextDigest, sourceInventory: [], discoveredSignals: [], opportunities: [], risks: [], informationGaps: [], recommendations: [], confidenceClassifications: ["HIGH"], evidenceBundle: ["discovery:evidence:1"] };
  return {
    runtimeContext,
    missionContext: { identifier: "MISSION-001", missionStatements: ["Expand governed opportunity."], strategicObjectives: ["Improve evidence access"], approvedPriorities: ["Trust"], values: ["Accountability"], constraints: ["Human approval"], owner: "Executive Leadership", sourceReference: "governance:mission:1", version: "1.0.0", validationStatus: "verified", evidenceReferences: ["mission:evidence:1"] },
    discoveryReports: [discoveryReport], metaReports: [], adaptationProposals: [], historicalPatterns: [], institutionalMemory: [],
    optionCandidates: [{ strategicObjective: "Improve evidence access", missionObjectiveReferences: ["Improve evidence access"], constitutionalPrincipleReferences: ["RULE-1"], supportingEvidence: ["discovery:evidence:1", "mission:evidence:1"], requiredResources: ["Leadership review"], expectedOutcomes: ["Evidence access may improve."], risks: ["Resource displacement"], dependencies: ["Governance approval"], benefits: ["Improved access"], opportunityCosts: ["Other reviews may wait"], affectedStakeholders: ["Scholars"], urgency: "HIGH", resourceFeasibility: "MEDIUM", riskLevel: "MEDIUM", requiredAuthority: ["strategic-priority", "resource-commitment"] }],
    analysisTimestamp: "2026-07-26T02:00:00.000Z", unauthorizedDecisionRequested: false, guaranteedOutcomeClaimed: false,
  };
}

function codes(action: () => unknown): string[] {
  try { action(); return []; } catch (error) { expect(error).toBeInstanceOf(StrategyError); return (error as StrategyError).failures.map(({ code }) => code); }
}

describe("PBOS governed strategy intelligence", () => {
  it("creates deterministic strategic options from discovery evidence", () => { const first = createStrategyReport(input()); expect(createStrategyReport(input())).toEqual(first); expect(first.strategicOptions[0].optionId).toMatch(/^PBOS-STRAT-OPT-[A-F0-9]{16}$/); });
  it("preserves option evidence and provenance", () => { const option = createStrategyReport(input()).strategicOptions[0]; expect(option.supportingEvidence).toEqual(["discovery:evidence:1", "mission:evidence:1"]); expect(option.provenance.missionIdentifier).toBe("MISSION-001"); });
  it("keeps alignment distinct from leadership decisions", () => { const alignment = createStrategyReport(input()).strategicOptions[0].alignment; expect(alignment.classification).toBe("ALIGNMENT"); expect(alignment.leadershipDecisionRequired).toBe(true); expect(alignment.statement).toContain("not approval"); });
  it("preserves uncertainty in tradeoffs and scenarios", () => { const report = createStrategyReport(input()); expect(report.tradeoffs[0].analysis.uncertaintyStatement).toContain("not guarantees"); expect(report.scenarios.every(({ classificationBoundary }) => classificationBoundary.includes("not predictions"))).toBe(true); });
  it("produces explainable advisory priority assessments", () => { const priority = createStrategyReport(input()).strategicOptions[0].priorityAssessment; expect(priority.scoringMethod).toContain("five disclosed"); expect(priority.limitations).toHaveLength(2); expect(priority.advisoryOnly).toBe(true); });
  it("keeps reports deterministic and recommendations advisory", () => { const first = createStrategyReport(input()); expect(first.reportId).toMatch(/^PBOS-STRAT-[A-F0-9]{16}$/); expect(first.recommendations.every(({ advisoryOnly }) => advisoryOnly)).toBe(true); expect(first.evidenceBundle).toEqual([...first.evidenceBundle].sort()); });
  it("rejects missing mission authority", () => { const value = input(); value.missionContext = null; expect(codes(() => createStrategyReport(value))).toContain("MISSING_MISSION_AUTHORITY"); });
  it("rejects invalid evidence", () => { const value = input(); value.optionCandidates[0].supportingEvidence = []; expect(codes(() => createStrategyReport(value))).toContain("INVALID_EVIDENCE"); });
  it("rejects unauthorized decisions", () => { const value = input(); value.unauthorizedDecisionRequested = true; expect(codes(() => createStrategyReport(value))).toContain("UNAUTHORIZED_DECISION"); });
  it("rejects unsupported certainty", () => { const value = input(); value.guaranteedOutcomeClaimed = true; expect(codes(() => createStrategyReport(value))).toContain("UNSUPPORTED_CERTAINTY"); });
  it("rejects governance bypass", () => { const pending = { status: "pending" as const, approvalIdentifier: null, evidenceReferences: [] }; expect(codes(() => transitionStrategy({ currentState: "GOVERNANCE_REVIEW", transitions: [] }, "ARCHIVED", "2026-07-26T00:00:00.000Z", pending))).toContain("GOVERNANCE_BYPASS"); });
});
