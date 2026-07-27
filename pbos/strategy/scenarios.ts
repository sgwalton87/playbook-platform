import { digestValue } from "../context";
import type { StrategicOption, StrategyScenario } from "./contracts";

export function createScenarios(options: StrategicOption[]): StrategyScenario[] {
  return [...options].sort((a, b) => a.optionId.localeCompare(b.optionId)).flatMap((option) => [
    { name: `Current path for ${option.strategicObjective}`, knownFacts: option.supportingEvidence, possibleOutcomes: ["Existing priorities and constraints remain in effect."], assumptions: ["No strategic option is approved."], unknownFactors: option.tradeoffs.opportunityCosts, risks: option.risks, evidenceReferences: option.supportingEvidence },
    { name: `Alternative path for ${option.strategicObjective}`, knownFacts: option.supportingEvidence, possibleOutcomes: option.expectedOutcomes, assumptions: ["Required human approvals and resources may be obtained."], unknownFactors: option.dependencies, risks: option.risks, evidenceReferences: option.supportingEvidence },
  ].map((scenario) => ({ scenarioId: `PBOS-STRAT-SCN-${digestValue({ optionId: option.optionId, ...scenario }).slice(0, 16).toUpperCase()}`, ...scenario, classificationBoundary: "Known facts are evidence references; possible outcomes are not predictions; assumptions and unknowns are explicitly non-factual." })));
}
