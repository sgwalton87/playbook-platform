import { existsSync } from "node:fs";
import path from "node:path";
import { assertObjectiveAuthorized } from "./authorization";
import type {
  ObjectiveEvaluation,
  ObjectiveRegistry,
  ObjectiveRegistryEntry,
  PlanningHandoffDecision,
} from "./types";

function evaluateObjective(
  objective: ObjectiveRegistryEntry,
  registry: ObjectiveRegistry,
  rootDir: string
): ObjectiveEvaluation {
  assertObjectiveAuthorized(objective);
  const byId = new Map(
    registry.objectives.map((entry) => [entry.objectiveId, entry])
  );
  const missingDependencies =
    objective.dependencies.prerequisiteObjectives.filter((id) => {
      const dependency = byId.get(id);
      return (
        !dependency ||
        !["COMPLETED", "ARCHIVED"].includes(
          dependency.governance.lifecycleState
        )
      );
    });
  const missingArtifacts =
    objective.dependencies.requiredArtifacts.filter(
      (entry) => !existsSync(path.resolve(rootDir, entry))
    );
  const missingEvidence =
    objective.dependencies.requiredEvidence.filter(
      (entry) => !existsSync(path.resolve(rootDir, entry))
    );
  const reasons: string[] = [];
  if (objective.governance.lifecycleState !== "REGISTERED") {
    reasons.push(
      `Lifecycle ${objective.governance.lifecycleState} is not eligible for planning evaluation.`
    );
  }
  if (missingDependencies.length > 0) {
    reasons.push(
      `Missing completed dependencies: ${missingDependencies.join(", ")}.`
    );
  }
  if (missingArtifacts.length > 0) {
    reasons.push(
      `Missing required artifacts: ${missingArtifacts.join(", ")}.`
    );
  }
  if (missingEvidence.length > 0) {
    reasons.push(
      `Missing required evidence: ${missingEvidence.join(", ")}.`
    );
  }
  if (objective.governance.blockingConditions.length > 0) {
    reasons.push(
      `Blocking conditions: ${objective.governance.blockingConditions.join(", ")}.`
    );
  }
  const potentiallyEligible =
    objective.governance.lifecycleState === "REGISTERED";
  return {
    objectiveId: objective.objectiveId,
    status:
      reasons.length === 0
        ? "ELIGIBLE"
        : potentiallyEligible
          ? "BLOCKED"
          : "INELIGIBLE",
    reasons:
      reasons.length > 0
        ? reasons
        : ["All registered eligibility requirements are satisfied."],
    missingDependencies,
    missingArtifacts,
    missingEvidence,
  };
}

export function evaluateObjectives(
  registry: ObjectiveRegistry,
  rootDir: string
): PlanningHandoffDecision {
  const evaluations = registry.objectives
    .map((objective) => evaluateObjective(objective, registry, rootDir))
    .sort((left, right) =>
      left.objectiveId.localeCompare(right.objectiveId)
    );
  const eligible = registry.objectives
    .filter(
      (objective) =>
        evaluations.find(
          ({ objectiveId }) => objectiveId === objective.objectiveId
        )?.status === "ELIGIBLE"
    )
    .sort(
      (left, right) =>
        right.governance.priority - left.governance.priority ||
        left.objectiveId.localeCompare(right.objectiveId)
    );
  const selectedObjective = eligible[0] ?? null;

  return {
    status: selectedObjective
      ? "OBJECTIVE_ELIGIBLE"
      : "GOVERNED_IDLE",
    selectedObjective,
    evaluations,
    reason: selectedObjective
      ? `${selectedObjective.objectiveId} is the highest-priority eligible registered objective.`
      : registry.objectives.length === 0
        ? "No constitutional objectives are registered. PBOS remains in governed idle state."
        : "No registered constitutional objective satisfies every eligibility requirement.",
  };
}
