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
