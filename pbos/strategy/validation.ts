import { digestValue, type PBOSRuntimeContext } from "../context";
import type { MissionContext, StrategyInput } from "./contracts";
import { StrategyError, strategyFailure } from "./errors";

function validContext(context: PBOSRuntimeContext): boolean {
  const body = { ...context };
  delete (body as Partial<PBOSRuntimeContext>).contextDigest;
  return context.documentInventory.length > 0 && context.contextDigest === digestValue(body);
}

export function validateStrategyInput(input: StrategyInput): MissionContext {
  if (!input.runtimeContext || !validContext(input.runtimeContext)) throw new StrategyError([strategyFailure("MISSING_CONTEXT", "A valid constitutional Runtime Context is required.")]);
  const mission = input.missionContext;
  if (!mission || mission.validationStatus !== "verified" || !mission.identifier || !mission.owner || !mission.sourceReference || !mission.version || !mission.missionStatements.length || !mission.strategicObjectives.length || !mission.evidenceReferences.length) throw new StrategyError([strategyFailure("MISSING_MISSION_AUTHORITY", "Verified, sourced mission authority is required.")]);
  if (input.unauthorizedDecisionRequested) throw new StrategyError([strategyFailure("UNAUTHORIZED_DECISION", "Strategy Intelligence cannot choose priorities, allocate resources, or approve strategy.")]);
  if (input.guaranteedOutcomeClaimed) throw new StrategyError([strategyFailure("UNSUPPORTED_CERTAINTY", "Strategic analysis cannot claim guaranteed outcomes or causal certainty.")]);
  if (Number.isNaN(Date.parse(input.analysisTimestamp))) throw new StrategyError([strategyFailure("INVALID_EVIDENCE", "Analysis timestamp is invalid.")]);
  if (!input.discoveryReports.length || input.discoveryReports.some((report) => !report.evidenceBundle.length || report.runtimeContextDigest !== input.runtimeContext!.contextDigest)) throw new StrategyError([strategyFailure("INVALID_EVIDENCE", "Discovery inputs require evidence and the active Runtime Context.")]);
  if (input.metaReports.some((report) => !report.inputEvidenceReferences.length || report.inputContextDigest !== input.runtimeContext!.contextDigest)) throw new StrategyError([strategyFailure("INVALID_EVIDENCE", "Meta inputs require evidence and the active Runtime Context.")]);
  if (input.adaptationProposals.some((proposal) => !proposal.supportingEvidence.length || !proposal.detectedPattern.sourceRecordIdentifiers.length) || input.historicalPatterns.some((pattern) => !pattern.supportingEvidence.length || !pattern.sourceRecordIdentifiers.length) || input.institutionalMemory.some((memory) => !memory.evidenceReferences.length || !memory.sourceRecordIdentifiers.length)) throw new StrategyError([strategyFailure("INVALID_EVIDENCE", "Adaptation intelligence and institutional memory require complete provenance.")]);
  if (input.optionCandidates.some((option) => !option.strategicObjective || !option.supportingEvidence.length || !option.missionObjectiveReferences.length || option.missionObjectiveReferences.some((reference) => !mission.strategicObjectives.includes(reference)))) throw new StrategyError([strategyFailure("INVALID_EVIDENCE", "Every option requires evidence and valid mission objective references.")]);
  return mission;
}
