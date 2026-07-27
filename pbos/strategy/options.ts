import { digestValue } from "../context";
import { evaluateMissionAlignment } from "./alignment";
import type { MissionContext, StrategicOption, StrategyInput, StrategyOptionCandidate, StrategyProvenance } from "./contracts";
import { assessPriority } from "./priorities";
import { routeStrategyApprovals } from "./routing";
import { analyzeTradeoffs } from "./tradeoffs";

export function createStrategicOption(input: StrategyInput, mission: MissionContext, candidate: StrategyOptionCandidate): StrategicOption {
  const provenance: StrategyProvenance = { missionIdentifier: mission.identifier, missionSourceReference: mission.sourceReference, missionVersion: mission.version, runtimeContextDigest: input.runtimeContext!.contextDigest, discoveryReportIds: input.discoveryReports.map(({ reportId }) => reportId).sort(), metaReportIds: input.metaReports.map(({ reportId }) => reportId).sort(), evidenceReferences: [...new Set([...mission.evidenceReferences, ...candidate.supportingEvidence])].sort() };
  const body = { strategicObjective: candidate.strategicObjective, supportingEvidence: [...candidate.supportingEvidence].sort(), alignment: evaluateMissionAlignment(candidate, mission, provenance), requiredResources: [...candidate.requiredResources].sort(), expectedOutcomes: [...candidate.expectedOutcomes].sort(), risks: [...candidate.risks].sort(), dependencies: [...candidate.dependencies].sort(), tradeoffs: analyzeTradeoffs(candidate), affectedStakeholders: [...candidate.affectedStakeholders].sort(), requiredApprovals: routeStrategyApprovals(candidate.requiredAuthority), priorityAssessment: assessPriority(candidate), provenance, advisoryOnly: true as const };
  return { optionId: `PBOS-STRAT-OPT-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
