import { describe, expect, it } from "vitest";
import { compileContext, sha256 } from "../context";
import type { DiscoveryInput, OpportunityInput, RiskInput } from "./governed-contracts";
import { DiscoveryError } from "./errors";
import { createOpportunity } from "./opportunities";
import { createDiscoveryReport } from "./reporting";
import { createRisk } from "./risks";
import { detectSignals } from "./signals";
import { transitionDiscovery } from "./state-machine";

function input(): DiscoveryInput {
  const content = "canonical discovery authority";
  const runtimeContext = compileContext({
    sources: [{ identifier: "PPS-809", title: "Engine Governance", version: "1.0.0", location: "docs/PPS/08_PBOS_ENGINE/PPS-809_ENGINE_GOVERNANCE.md", status: "Canonical", owner: "PBOS", dependencies: [], content, digest: sha256(content), validationState: "verified" }],
    governanceDecisions: [], registry: { version: "1.0.0", validationState: "verified", documents: [{ identifier: "PPS-809", location: "docs/PPS/08_PBOS_ENGINE/PPS-809_ENGINE_GOVERNANCE.md", owner: "PBOS", version: "1.0.0" }] }, compilationTimestamp: "2026-07-26T00:00:00.000Z",
  });
  return {
    runtimeContext,
    sources: [{ identifier: "SRC-001", owner: "PBOS Engineering", sourceType: "internal", provenance: "PBOS validation ledger", retrievedAt: "2026-07-26T01:00:00.000Z", validationStatus: "verified", approvedDomains: ["validation"], evidenceReferences: ["ledger:source:1"] }],
    observations: [
      { sourceIdentifier: "SRC-001", observation: "Validation evidence completion improved.", observedAt: "2026-07-26T01:05:00.000Z", affectedDomain: "validation", signalType: "opportunity", evidenceReferences: ["ledger:validation:1", "ledger:validation:2"], occurrenceCount: 2 },
      { sourceIdentifier: "SRC-001", observation: "A validation queue remains blocked.", observedAt: "2026-07-26T01:06:00.000Z", affectedDomain: "validation", signalType: "risk", evidenceReferences: ["ledger:blocker:1"], occurrenceCount: 1 },
    ], metaReports: [], adaptationPatterns: [], adaptationProposals: [],
    informationGaps: [{ domain: "external", description: "No approved external source was supplied; absence is not evidence of no change.", evidenceReferences: ["scope:external:unavailable"], status: "UNRESOLVED" }],
    observationTimestamp: "2026-07-26T02:00:00.000Z", unsupportedConclusionRequested: false, unauthorizedDecisionRequested: false,
  };
}

function codes(action: () => unknown): string[] {
  try { action(); return []; } catch (error) { expect(error).toBeInstanceOf(DiscoveryError); return (error as DiscoveryError).failures.map(({ code }) => code); }
}

const opportunityInput: OpportunityInput = { affectedSystemsOrCommunities: ["validation"], potentialImpact: "Improve evidence completeness.", requiredExpertise: ["validation governance"], risks: ["Incorrect prioritization"], recommendedNextSteps: ["Request a governed investigation."], changeType: "strategic" };
const riskInput: RiskInput = { affectedSystems: ["validation"], severityClassification: "MEDIUM", possibleImpact: "Lifecycle progression may be delayed.", mitigationRecommendations: ["Review the supporting evidence."] };

describe("PBOS governed discovery intelligence", () => {
  it("creates deterministic signals from valid approved sources", () => {
    expect(detectSignals(input())).toEqual(detectSignals(input()));
    expect(detectSignals(input())[0].signalId).toMatch(/^PBOS-DISC-SIG-[A-F0-9]{16}$/);
  });
  it("preserves source trust and signal provenance", () => {
    expect(detectSignals(input())[0]).toMatchObject({ sourceIdentity: "SRC-001", sourceOwnership: "PBOS Engineering", sourceProvenance: "PBOS validation ledger", sourceValidationStatus: "verified" });
  });
  it("creates advisory evidence-preserving opportunities with governance routing", () => {
    const opportunity = createOpportunity(detectSignals(input())[0], opportunityInput);
    expect(opportunity.advisoryOnly).toBe(true); expect(opportunity.supportingEvidence).toHaveLength(2); expect(opportunity.provenance.sourceIdentity).toBe("SRC-001"); expect(opportunity.requiredApprovals).toContain("strategic-governance");
  });
  it("creates risks that preserve uncertainty", () => {
    const risk = createRisk(detectSignals(input())[1], riskInput);
    expect(risk.classification).toBe("RISK"); expect(risk.provenance.validationStatus).toBe("verified"); expect(risk.uncertaintyStatement).toContain("causation are not established");
  });
  it("creates deterministic reports with stable evidence ordering", () => {
    const value = input(); const signals = detectSignals(value); const opportunities = [createOpportunity(signals[0], opportunityInput)]; const risks = [createRisk(signals[1], riskInput)];
    const first = createDiscoveryReport(value, signals, opportunities, risks);
    expect(createDiscoveryReport(value, signals, opportunities, risks)).toEqual(first); expect(first.evidenceBundle).toEqual([...first.evidenceBundle].sort()); expect(first.recommendations[0].advisoryOnly).toBe(true);
  });
  it("rejects missing provenance", () => { const value = input(); value.sources[0].provenance = ""; expect(codes(() => detectSignals(value))).toContain("MISSING_PROVENANCE"); });
  it("rejects invalid sources", () => { const value = input(); value.sources[0].validationStatus = "pending"; expect(codes(() => detectSignals(value))).toContain("INVALID_SOURCE"); });
  it("rejects unsupported conclusions", () => { const value = input(); value.unsupportedConclusionRequested = true; expect(codes(() => detectSignals(value))).toContain("UNSUPPORTED_CONCLUSION"); });
  it("rejects unauthorized decisions", () => { const value = input(); value.unauthorizedDecisionRequested = true; expect(codes(() => detectSignals(value))).toContain("UNAUTHORIZED_DECISION"); });
  it("rejects missing context", () => { const value = input(); value.runtimeContext = null; expect(codes(() => detectSignals(value))).toContain("MISSING_CONTEXT"); });
  it("rejects skipped lifecycle states and governance bypass", () => {
    const pending = { status: "pending" as const, approvalIdentifier: null, evidenceReferences: [] };
    expect(codes(() => transitionDiscovery({ currentState: "OBSERVING", transitions: [] }, "REPORTING", "2026-07-26T00:00:00.000Z", pending))).toContain("INVALID_TRANSITION");
    expect(codes(() => transitionDiscovery({ currentState: "GOVERNANCE_REVIEW", transitions: [] }, "ARCHIVED", "2026-07-26T00:00:00.000Z", pending))).toContain("GOVERNANCE_BYPASS");
  });
});
