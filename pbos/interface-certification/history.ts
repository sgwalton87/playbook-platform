import type { InterfaceCertificationArtifact } from "./types";

export function validateInterfaceCertificationHistory(
  artifact: InterfaceCertificationArtifact
): void {
  if (
    artifact.schemaVersion !== 1 ||
    artifact.owner !== "interface-certification" ||
    !Array.isArray(artifact.history)
  ) {
    throw new Error(
      "Interface certification history is invalid; prior attempts cannot be preserved."
    );
  }
  if (
    artifact.history.length > 0 &&
    artifact.runId !==
      artifact.history[artifact.history.length - 1].runId
  ) {
    throw new Error(
      "Interface certification latest result does not match history."
    );
  }
}
