import type { PriorityAssessment, StrategyOptionCandidate } from "./contracts";

const level = { LOW: 1, MEDIUM: 2, HIGH: 3 } as const;
export function assessPriority(candidate: StrategyOptionCandidate): PriorityAssessment {
  const factors = { missionAlignment: Math.min(3, candidate.missionObjectiveReferences.length), urgency: level[candidate.urgency], evidenceStrength: Math.min(3, candidate.supportingEvidence.length), resourceFeasibility: level[candidate.resourceFeasibility], risk: 4 - level[candidate.riskLevel] };
  return { score: Object.values(factors).reduce((sum, value) => sum + value, 0), scoringMethod: "Unweighted sum of five disclosed 1–3 ordinal factors; lower risk contributes a higher feasibility value.", factors, evidenceReferences: [...candidate.supportingEvidence].sort(), limitations: ["Ordinal scores do not measure probability or expected value.", "The score is advisory and cannot select a priority."], confidence: candidate.supportingEvidence.length > 1 ? "HIGH" : "MEDIUM", advisoryOnly: true };
}
