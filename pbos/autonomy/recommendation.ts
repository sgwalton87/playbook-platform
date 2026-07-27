import { digestValue } from "../context";
import type { AutonomyObservation, AutonomyRecommendation } from "./contracts";

const APPROVAL_BY_ACTION: Record<string, string> = {
  ADVANCE_EXECUTE: "execution-authorization",
  ADVANCE_CERTIFY: "certification-approval",
  ADVANCE_RELEASE: "release-approval",
};

export function recommendAutonomy(observation: AutonomyObservation): AutonomyRecommendation {
  const blocked = [...observation.blockedConditions, ...observation.missingEvidence].sort();
  const recommendedAction = blocked.length
    ? "REMAIN_BLOCKED"
    : observation.availableNextActions[0] ?? "OBSERVE_STATE";
  const requiredApprovals = [
    ...observation.governanceRequirements,
    ...(APPROVAL_BY_ACTION[recommendedAction] ? [APPROVAL_BY_ACTION[recommendedAction]] : []),
  ].filter((item, index, values) => values.indexOf(item) === index).sort();
  const recommendationBody = {
    observationId: observation.observationId,
    recommendedAction,
    reasoning: blocked.length
      ? ["Observed blockers or missing evidence prevent lifecycle progression."]
      : [`${recommendedAction} is the next factually eligible lifecycle action.`],
    evidenceReferences: [...observation.evidenceReferences],
    impactedSystems: observation.currentLifecycleStage ? [`PBOS:${observation.currentLifecycleStage}`] : ["PBOS:CONSTITUTION"],
    requiredApprovals,
    confidenceClassification: blocked.length ? "LOW" as const : requiredApprovals.length ? "MEDIUM" as const : "HIGH" as const,
    blockedConditions: blocked,
    advisoryOnly: true as const,
  };
  return { recommendationId: `PBOS-REC-${digestValue(recommendationBody).slice(0, 16).toUpperCase()}`, ...recommendationBody };
}
