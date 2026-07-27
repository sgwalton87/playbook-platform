import { digestValue, type PBOSRuntimeContext } from "../context";
import type { MetaInput, MetaRecommendation, SystemIntelligenceReport } from "./contracts";
import { MetaIntelligenceError, metaFailure } from "./errors";
import { analyzeGovernance } from "./governance";
import { analyzeEngineHealth } from "./health";
import { analyzeLifecycle } from "./lifecycle";

function expectedContextDigest(context: PBOSRuntimeContext): string {
  const { contextDigest: _contextDigest, ...digestInput } = context;
  return digestValue(digestInput);
}

export function createSystemIntelligenceReport(input: MetaInput): SystemIntelligenceReport {
  const context = input.runtimeContext;
  if (!context || context.contextDigest !== expectedContextDigest(context) || !context.documentInventory.length) throw new MetaIntelligenceError([metaFailure("MISSING_CONTEXT", "Verified constitutional Runtime Context is required.")]);
  if (input.directModificationRequested) throw new MetaIntelligenceError([metaFailure("UNAUTHORIZED_MODIFICATION", "Meta Intelligence cannot directly modify PBOS.")]);
  if (input.causalClaimRequested) throw new MetaIntelligenceError([metaFailure("UNSUPPORTED_CAUSAL_CLAIM", "Recorded recurrence cannot be promoted into a causal claim.")]);
  if (Number.isNaN(Date.parse(input.analysisTimestamp))) throw new MetaIntelligenceError([metaFailure("INVALID_EVIDENCE", "Analysis timestamp is invalid.")]);
  const allRecords = [...input.engineHistory, ...input.lifecycleHistory, ...input.governanceHistory];
  if (allRecords.some((record) => !record.evidenceReferences.length)) throw new MetaIntelligenceError([metaFailure("INVALID_EVIDENCE", "Every analyzed record requires evidence references.")]);
  if (input.patterns.some((pattern) => !pattern.supportingEvidence.length || !pattern.sourceRecordIdentifiers.length)) throw new MetaIntelligenceError([metaFailure("MISSING_PROVENANCE", "Recurring patterns require evidence and source record provenance.")]);
  if (input.institutionalMemory.some((memory) => !memory.evidenceReferences.length || !memory.sourceRecordIdentifiers.length)) throw new MetaIntelligenceError([metaFailure("MISSING_PROVENANCE", "Institutional memory requires evidence and source provenance.")]);

  const systemHealthSummary = analyzeEngineHealth(input);
  const lifecycleAnalysis = analyzeLifecycle(input);
  const governanceAnalysis = analyzeGovernance(input);
  const inputEvidenceReferences = allRecords.flatMap((record) => record.evidenceReferences).filter((item, index, values) => values.indexOf(item) === index).sort();
  const recommendationTexts = [...lifecycleAnalysis.improvementOpportunities, ...governanceAnalysis.advisoryRecommendations].sort();
  const recommendations: MetaRecommendation[] = recommendationTexts.map((recommendation) => ({ recommendation, evidenceReferences: inputEvidenceReferences, advisoryOnly: true, classification: "RECOMMENDATION" }));
  const risks = [
    ...(systemHealthSummary.unavailableEngines.length ? [`Inference: unavailable engine history may indicate an observability risk for ${systemHealthSummary.unavailableEngines.join(", ")}.`] : []),
    ...lifecycleAnalysis.bottlenecks.map((item) => `Inference: ${item} This may indicate a lifecycle bottleneck; causation is not established.`),
    ...governanceAnalysis.observations.map((item) => `Inference: ${item} This may warrant governance review; causation is not established.`),
  ].sort();
  const body = {
    analysisTimestamp: input.analysisTimestamp,
    inputContextDigest: context.contextDigest,
    inputEvidenceReferences,
    systemHealthSummary,
    lifecycleAnalysis,
    governanceAnalysis,
    recurringPatterns: [...input.patterns].sort((left, right) => left.patternId.localeCompare(right.patternId)),
    risks,
    recommendations,
    confidenceClassification: allRecords.length >= 5 ? "HIGH" as const : allRecords.length ? "MEDIUM" as const : "LOW" as const,
  };
  return { reportId: `PBOS-META-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
