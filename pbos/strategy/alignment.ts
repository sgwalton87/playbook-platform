import type { MissionAlignment, MissionContext, StrategyOptionCandidate, StrategyProvenance } from "./contracts";

export function evaluateMissionAlignment(candidate: StrategyOptionCandidate, mission: MissionContext, provenance: StrategyProvenance): MissionAlignment {
  const objectives = [...candidate.missionObjectiveReferences].filter((item) => mission.strategicObjectives.includes(item)).sort();
  return { referencedMissionObjectives: objectives, referencedConstitutionalPrinciples: [...candidate.constitutionalPrincipleReferences].sort(), classification: "ALIGNMENT", statement: `The option references ${objectives.length} verified mission objective(s) and appears consistent with those stated objectives; this is not approval.`, provenance, leadershipDecisionRequired: true };
}
