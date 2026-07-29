import { artifactDigest } from "../../kernel";
import type {
  PlanningHandoffArtifact,
  PlanningHandoffRecord,
} from "./types";

export function validatePlanningHistory(
  artifact: PlanningHandoffArtifact
): void {
  if (
    artifact.version !== "1.0.0" ||
    artifact.owner !== "planning-handoff" ||
    !Array.isArray(artifact.history)
  ) {
    throw new Error("Planning handoff history is invalid.");
  }
  for (const record of artifact.history) {
    const identityInput = Object.fromEntries(
      Object.entries(record).filter(([key]) => key !== "recordId")
    );
    if (record.recordId !== artifactDigest(identityInput)) {
      throw new Error(
        "Planning handoff history contains an invalid record identity."
      );
    }
  }
}

export function appendPlanningHistory(
  existing: PlanningHandoffArtifact | null,
  record: PlanningHandoffRecord
): PlanningHandoffArtifact {
  if (existing) {
    validatePlanningHistory(existing);
  }
  const history = [...(existing?.history ?? []), record];
  return {
    version: "1.0.0",
    owner: "planning-handoff",
    latest: record,
    history,
  };
}
