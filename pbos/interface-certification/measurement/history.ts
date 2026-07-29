import type { InterfaceMeasurementArtifact } from "./measurement-types";

export function validateInterfaceMeasurementHistory(
  artifact: InterfaceMeasurementArtifact
): void {
  if (
    artifact.schemaVersion !== 1 ||
    artifact.owner !== "interface-measurement" ||
    !Array.isArray(artifact.history)
  ) {
    throw new Error(
      "Interface measurement history is invalid; prior measurements cannot be preserved."
    );
  }
  if (
    artifact.history.length > 0 &&
    artifact.runId !==
      artifact.history[artifact.history.length - 1].runId
  ) {
    throw new Error(
      "Interface measurement latest result does not match history."
    );
  }
}
