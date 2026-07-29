import type {
  LifecycleGovernanceArtifact,
  LifecycleGovernanceRun,
} from "./types";

export function validateLifecycleGovernanceHistory(
  artifact: LifecycleGovernanceArtifact
): void {
  if (
    artifact.schemaVersion !== 1 ||
    artifact.authority !== "lifecycle-governance" ||
    !Array.isArray(artifact.history) ||
    artifact.history.length === 0 ||
    artifact.runId !== artifact.history[artifact.history.length - 1].runId
  ) {
    throw new Error(
      "Lifecycle governance history is invalid; prior transition truth cannot be preserved."
    );
  }
}

export function appendLifecycleGovernanceHistory(
  existing: LifecycleGovernanceArtifact | null,
  run: LifecycleGovernanceRun
): LifecycleGovernanceArtifact {
  if (existing) {
    validateLifecycleGovernanceHistory(existing);
  }
  return {
    schemaVersion: 1,
    ...run,
    history: [...(existing?.history ?? []), run],
  };
}
