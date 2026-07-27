import { digestValue } from "../context";
import type { StrategyInput, StrategyReport } from "./contracts";
import { createStrategicOption } from "./options";
import { createScenarios } from "./scenarios";
import { validateStrategyInput } from "./validation";

export function createStrategyReport(input: StrategyInput): StrategyReport {
  const mission = validateStrategyInput(input);
  const strategicOptions = input.optionCandidates.map((candidate) => createStrategicOption(input, mission, candidate)).sort((a, b) => a.optionId.localeCompare(b.optionId));
  const scenarios = createScenarios(strategicOptions);
  const evidenceBundle = [...new Set([...mission.evidenceReferences, ...input.discoveryReports.flatMap((report) => report.evidenceBundle), ...input.metaReports.flatMap((report) => report.inputEvidenceReferences), ...input.adaptationProposals.flatMap((proposal) => proposal.supportingEvidence), ...input.historicalPatterns.flatMap((pattern) => pattern.supportingEvidence), ...input.institutionalMemory.flatMap((memory) => memory.evidenceReferences), ...strategicOptions.flatMap((option) => option.supportingEvidence)])].sort();
  const body = { analysisTimestamp: input.analysisTimestamp, runtimeContextDigest: input.runtimeContext!.contextDigest, missionReferences: [mission.identifier, mission.sourceReference].sort(), discoveryInputIds: input.discoveryReports.map(({ reportId }) => reportId).sort(), metaInputIds: input.metaReports.map(({ reportId }) => reportId).sort(), strategicOptions, tradeoffs: strategicOptions.map(({ optionId, tradeoffs: analysis }) => ({ optionId, analysis })), scenarios, risks: [...new Set(strategicOptions.flatMap((option) => option.risks))].sort(), recommendations: strategicOptions.map((option) => ({ optionId: option.optionId, recommendation: `Leadership should consider whether to review: ${option.strategicObjective}`, advisoryOnly: true as const, requiredApprovals: option.requiredApprovals })), evidenceBundle, confidenceClassification: evidenceBundle.length > 3 ? "HIGH" as const : "MEDIUM" as const };
  return { reportId: `PBOS-STRAT-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
