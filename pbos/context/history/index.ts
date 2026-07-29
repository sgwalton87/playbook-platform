import type {
  ContextRefreshArtifact,
  ContextRefreshRecord,
} from "../schema";

export function validateContextRefreshHistory(
  artifact: ContextRefreshArtifact
): void {
  if (
    artifact.version !== "1.0.0" ||
    artifact.owner !== "repository-context" ||
    !Array.isArray(artifact.history) ||
    artifact.history.length === 0 ||
    artifact.latest.id !==
      artifact.history[artifact.history.length - 1].id
  ) {
    throw new Error(
      "Context refresh history is invalid; prior context evidence cannot be preserved."
    );
  }
}

export function appendContextRefreshHistory(
  existing: ContextRefreshArtifact | null,
  record: ContextRefreshRecord
): ContextRefreshArtifact {
  if (existing) {
    validateContextRefreshHistory(existing);
  }
  return {
    version: "1.0.0",
    owner: "repository-context",
    latest: record,
    history: [...(existing?.history ?? []), record],
  };
}
