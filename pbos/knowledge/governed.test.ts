import { describe, expect, it } from "vitest";
import { compileContext, sha256 } from "../context";
import { createKnowledgeEntities } from "./entities";
import { KnowledgeError } from "./errors";
import type { KnowledgeInput } from "./governed-contracts";
import { createKnowledgeReport } from "./reporting";
import { retrieveKnowledge } from "./retrieval";
import { transitionKnowledge } from "./state-machine";

function input(): KnowledgeInput {
  const content = "canonical knowledge authority";
  const runtimeContext = compileContext({ sources: [{ identifier: "PPS-809", title: "Knowledge Governance", version: "1.0.0", location: "docs/PPS/PPS-809.md", status: "Canonical", owner: "PBOS", dependencies: [], content, digest: sha256(content), validationState: "verified" }], governanceDecisions: [], registry: { version: "1.0.0", validationState: "verified", documents: [{ identifier: "PPS-809", location: "docs/PPS/PPS-809.md", owner: "PBOS", version: "1.0.0" }] }, compilationTimestamp: "2026-07-26T00:00:00.000Z" });
  const entityInputs = [
    { sourceRecordId: "DEC-001", name: "Evidence policy decision", classification: "DECISION" as const, owner: "Governance", timestamp: "2026-07-24T00:00:00.000Z", sourceEvidence: ["decision:evidence:1"], historicalState: "Approved at recorded time." },
    { sourceRecordId: "OUT-001", name: "Evidence completion outcome", classification: "OUTCOME" as const, owner: "Validation", timestamp: "2026-07-25T00:00:00.000Z", sourceEvidence: ["outcome:evidence:1"], historicalState: "Observed after decision; causation not established." },
  ];
  const entities = createKnowledgeEntities(entityInputs, runtimeContext.contextDigest);
  return { runtimeContext, historicalRecords: [{ recordId: "DEC-001", recordType: "decision", occurredAt: "2026-07-24T00:00:00.000Z", owner: "Governance", summary: "Evidence policy approved.", evidenceReferences: ["decision:evidence:1"], status: "APPROVED" }, { recordId: "OUT-001", recordType: "outcome", occurredAt: "2026-07-25T00:00:00.000Z", owner: "Validation", summary: "Evidence completion observed.", evidenceReferences: ["outcome:evidence:1", "relationship:evidence:1", "contradiction:evidence:1"], status: "OBSERVED" }], institutionalMemory: [], strategyReports: [], discoveryReports: [], entityInputs, relationshipInputs: [{ fromEntityId: entities[0].entityId, toEntityId: entities[1].entityId, relationshipType: "PRODUCED", evidenceReferences: ["relationship:evidence:1", "contradiction:evidence:1"], confidence: "MEDIUM", limitations: ["Temporal order does not establish causation."] }], precedentInputs: [{ historicalSituation: "Evidence was incomplete.", evidenceReferences: ["decision:evidence:1", "outcome:evidence:1"], decisionMade: "A policy was approved.", outcome: "Completion was later observed.", lessonsLearned: ["Review evidence requirements."], limitations: ["The historical context may differ."], applicabilityConditions: ["Comparable evidence requirements."], sourceRecordIds: ["DEC-001", "OUT-001"] }], lessonInputs: [{ originatingEvidence: ["outcome:evidence:1"], historicalContext: "A recorded policy preceded an observed outcome.", observedOutcome: "Completion improved.", lessonSummary: "Consider explicit evidence requirements.", confidence: "MEDIUM", limitations: ["No causal conclusion is supported."], governanceStatus: "DRAFT", sourceRecordIds: ["OUT-001"] }], generatedAt: "2026-07-26T00:00:00.000Z", fabricatedKnowledgeRequested: false, historyModificationRequested: false };
}

function codes(action: () => unknown): string[] { try { action(); return []; } catch (error) { expect(error).toBeInstanceOf(KnowledgeError); return (error as KnowledgeError).failures.map(({ code }) => code); } }

describe("PBOS governed institutional knowledge", () => {
  it("creates deterministic evidence-backed entities and reports", () => { const first = createKnowledgeReport(input()); expect(createKnowledgeReport(input())).toEqual(first); expect(first.report.reportId).toMatch(/^PBOS-KNOW-[A-F0-9]{16}$/); expect(first.graph.nodes).toHaveLength(2); });
  it("preserves relationship provenance and limitations", () => { const relationship = createKnowledgeReport(input()).graph.relationships[0]; expect(relationship.provenance.sourceRecordIds).toEqual(["DEC-001", "OUT-001"]); expect(relationship.limitations).toContain("Temporal order does not establish causation."); });
  it("preserves precedent history without making prescriptions", () => { const precedent = createKnowledgeReport(input()).report.precedents[0]; expect(precedent.distinction).toBe("HISTORICAL_NOT_PRESCRIPTIVE"); expect(precedent.applicabilityConditions).toHaveLength(1); });
  it("preserves lesson limitations and non-command status", () => { const lesson = createKnowledgeReport(input()).report.lessons[0]; expect(lesson.artifactType).toBe("KNOWLEDGE_NOT_COMMAND"); expect(lesson.limitations).toContain("No causal conclusion is supported."); });
  it("retrieves evidence, history, provenance, and contradictions", () => { const { graph } = createKnowledgeReport(input()); const result = retrieveKnowledge(graph, { classifications: ["OUTCOME"], includeContradictoryEvidence: true }); expect(result.items[0].supportingEvidence).toContain("contradiction:evidence:1"); expect(result.items[0].historicalContext).toContain("causation not established"); expect(result.contradictoryEvidencePreserved).toBe(true); });
  it("rejects missing provenance", () => { const value = input(); value.entityInputs[0].sourceEvidence = []; expect(codes(() => createKnowledgeReport(value))).toContain("MISSING_PROVENANCE"); });
  it("rejects unsupported relationships", () => { const value = input(); value.relationshipInputs[0].toEntityId = "UNKNOWN"; expect(codes(() => createKnowledgeReport(value))).toContain("UNSUPPORTED_RELATIONSHIP"); });
  it("rejects fabricated knowledge", () => { const value = input(); value.fabricatedKnowledgeRequested = true; expect(codes(() => createKnowledgeReport(value))).toContain("FABRICATED_KNOWLEDGE"); });
  it("rejects invalid context", () => { const value = input(); value.runtimeContext = null; expect(codes(() => createKnowledgeReport(value))).toContain("INVALID_CONTEXT"); });
  it("rejects history modification", () => { const value = input(); value.historyModificationRequested = true; expect(codes(() => createKnowledgeReport(value))).toContain("HISTORY_MODIFICATION"); });
  it("rejects governance bypass", () => { const pending = { status: "pending" as const, approvalIdentifier: null, evidenceReferences: [] }; expect(codes(() => transitionKnowledge({ currentState: "GOVERNANCE_REVIEW", transitions: [] }, "ARCHIVED", "2026-07-26T00:00:00.000Z", pending))).toContain("GOVERNANCE_BYPASS"); });
});
