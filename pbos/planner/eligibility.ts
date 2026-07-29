import { isPlanningEligibleStatus } from "../lifecycle/status";
import type {
  DependencyGraph,
  GateDefinition,
  GateEligibility,
  PlannerEnvironment,
} from "./types";

export function evaluateGateEligibility(
  gate: GateDefinition,
  graph: DependencyGraph,
  environment: PlannerEnvironment
): GateEligibility {
  const reasons: GateEligibility["reasons"] = [];
  const incompleteDependencies = gate.dependencies.filter(
    (dependencyId) => {
      const dependency = graph.nodes.get(dependencyId)?.gate;
      return (
        dependency?.status !== "complete" ||
        dependency.completion_state !== "satisfied"
      );
    }
  );
  const missingArtifacts = gate.requires.filter((artifact) => {
    const result = environment.artifacts.get(artifact);
    return !result || result.errors.includes("Artifact does not exist.");
  });
  const invalidArtifacts = gate.requires
    .map((artifact) => environment.artifacts.get(artifact))
    .filter(
      (artifact): artifact is NonNullable<typeof artifact> =>
        Boolean(artifact && !artifact.valid)
    )
    .filter(
      (artifact) =>
        !artifact.errors.includes("Artifact does not exist.")
    )
    .map(({ path, errors }) => ({ path, errors }));

  if (!isPlanningEligibleStatus(gate.status)) {
    reasons.push({
      code: "LIFECYCLE_NOT_EXECUTABLE",
      message: `Gate lifecycle state ${gate.status} does not permit execution.`,
    });
  }
  if (gate.completion_state === "satisfied") {
    reasons.push({
      code: "ALREADY_SATISFIED",
      message: "Gate completion state is already satisfied.",
    });
  }
  if (incompleteDependencies.length > 0) {
    reasons.push({
      code: "DEPENDENCIES_INCOMPLETE",
      message: `Incomplete dependencies: ${incompleteDependencies.join(", ")}.`,
    });
  }
  if (missingArtifacts.length > 0) {
    reasons.push({
      code: "ARTIFACTS_MISSING",
      message: `Missing required artifacts: ${missingArtifacts.join(", ")}.`,
    });
  }
  if (invalidArtifacts.length > 0) {
    reasons.push({
      code: "ARTIFACTS_INVALID",
      message: `Invalid required artifacts: ${invalidArtifacts
        .map(({ path }) => path)
        .join(", ")}.`,
    });
  }
  if (!environment.contextValid) {
    reasons.push({
      code: "CONTEXT_INVALID",
      message:
        environment.contextErrors.join(" ") ||
        "Repository context validation failed.",
    });
  }
  if (!environment.validationPassed) {
    reasons.push({
      code: "VALIDATION_FAILED",
      message: "Runtime validation has not passed.",
    });
  } else if (
    environment.validationGate !== null &&
    environment.validationGate !== gate.id
  ) {
    reasons.push({
      code: "VALIDATION_GATE_MISMATCH",
      message: `Validation belongs to ${environment.validationGate ?? "no gate"}, not ${gate.id}.`,
    });
  }
  if (!environment.releasePermitsExecution) {
    reasons.push({
      code: "RELEASE_STATE_BLOCKED",
      message: `Release state ${environment.releaseState} does not permit execution.`,
    });
  }
  if (gate.blocking_conditions.length > 0) {
    reasons.push({
      code: "GATE_BLOCKED",
      message: `Blocking conditions: ${gate.blocking_conditions.join(", ")}.`,
    });
  }
  if (graph.cycles.length > 0) {
    reasons.push({
      code: "DEPENDENCY_CYCLE",
      message: "The constitutional dependency graph contains a cycle.",
    });
  }
  if (
    graph.missingDependencies.some(
      ({ gateId }) => gateId === gate.id
    )
  ) {
    reasons.push({
      code: "DEPENDENCY_UNKNOWN",
      message: "One or more declared dependencies do not exist.",
    });
  }

  return {
    gate,
    eligible: reasons.length === 0,
    reasons,
    missingArtifacts,
    invalidArtifacts,
    incompleteDependencies,
  };
}
