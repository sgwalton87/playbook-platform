import type {
  ArtifactReconciliationArtifact,
  ArtifactReconciliationRun,
} from "./types";

export function validateArtifactReconciliationHistory(
  artifact: ArtifactReconciliationArtifact
): void {
  if (
    artifact.schemaVersion !== 1 ||
    artifact.owner !== "artifact-reconciliation" ||
    !Array.isArray(artifact.history) ||
    artifact.history.length === 0 ||
    artifact.runId !==
      artifact.history[artifact.history.length - 1].runId
  ) {
    throw new Error(
      "Artifact reconciliation history is invalid; prior evidence cannot be preserved."
    );
  }
}

export function appendArtifactReconciliationHistory(
  existing: ArtifactReconciliationArtifact | null,
  run: ArtifactReconciliationRun
): ArtifactReconciliationArtifact {
  if (existing) {
    validateArtifactReconciliationHistory(existing);
  }
  return {
    schemaVersion: 1,
    ...run,
    history: [...(existing?.history ?? []), run],
  };
}
