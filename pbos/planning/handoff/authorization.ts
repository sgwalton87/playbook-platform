import type { ObjectiveRegistryEntry } from "./types";

export function assertObjectiveAuthorized(
  objective: ObjectiveRegistryEntry
): void {
  if (
    !objective.authority.originatingAuthority ||
    !objective.authority.constitutionalParent ||
    !objective.authority.owner
  ) {
    throw new Error(
      `Planning authorization denied for ${objective.objectiveId}.`
    );
  }
}

export function assertPlanningPrerequisites(options: {
  contextValid: boolean;
  contextErrors: string[];
  artifactConflicts: string[];
}): void {
  if (!options.contextValid) {
    throw new Error(
      `Planning handoff denied: repository context is invalid.\n${options.contextErrors.join("\n")}`
    );
  }
  if (options.artifactConflicts.length > 0) {
    throw new Error(
      `Planning handoff denied: artifact health is invalid.\n${options.artifactConflicts.join("\n")}`
    );
  }
}
