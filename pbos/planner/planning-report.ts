import type {
  ConstitutionalPlanningReport,
  DependencyGraph,
  GateEligibility,
  PlannerEnvironment,
} from "./types";
import { explainSelection } from "./recommendation";

export function createPlanningReport(options: {
  engineVersion: string;
  graph: DependencyGraph;
  environment: PlannerEnvironment;
  evaluations: GateEligibility[];
  selected: GateEligibility | null;
}): ConstitutionalPlanningReport {
  const {
    engineVersion,
    graph,
    environment,
    evaluations,
    selected,
  } = options;
  const completedGates = [...graph.nodes.values()]
    .filter(
      ({ gate }) =>
        gate.status === "complete" &&
        gate.completion_state === "satisfied"
    )
    .map(({ gate }) => gate.id)
    .sort();
  const blockedGates = evaluations
    .filter(
      (evaluation) =>
        evaluation.gate.status !== "complete" &&
        !evaluation.eligible
    )
    .sort((a, b) => a.gate.id.localeCompare(b.gate.id))
    .map((evaluation) => ({
      gateId: evaluation.gate.id,
      reasons: evaluation.reasons,
      incompleteDependencies: evaluation.incompleteDependencies,
      missingArtifacts: evaluation.missingArtifacts,
      invalidArtifacts: evaluation.invalidArtifacts,
    }));

  return {
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    engineVersion,
    repositoryContext: {
      valid: environment.contextValid,
      errors: environment.contextErrors,
    },
    currentLifecycle: {
      releaseState: environment.releaseState,
      releasePermitsExecution: environment.releasePermitsExecution,
    },
    currentDependencyNode: selected?.gate.id ?? null,
    completedGates,
    eligibleGates: evaluations
      .filter((evaluation) => evaluation.eligible)
      .map((evaluation) => evaluation.gate.id)
      .sort(),
    blockedGates,
    dependencyGraphSummary: {
      nodeCount: graph.nodes.size,
      edgeCount: [...graph.nodes.values()].reduce(
        (total, node) => total + node.dependencies.length,
        0
      ),
      missingDependencies: graph.missingDependencies,
      cycles: graph.cycles,
    },
    selectedGate: selected?.gate ?? null,
    reasonSelected: explainSelection(selected, evaluations),
    requiredArtifacts: selected?.gate.requires ?? [],
    validationResults: {
      passed: environment.validationPassed,
      gateId: environment.validationGate,
    },
    recommendedNextGate: selected?.gate.id ?? null,
    expectedDeliverables: selected?.gate.produces ?? [],
    estimatedImpact: selected
      ? selected.gate.description
      : "No implementation impact is authorized.",
    blockingConditions: blockedGates.flatMap(({ reasons }) =>
      reasons.map((reason) => reason.message)
    ),
    planningHealth: selected ? "HEALTHY" : "BLOCKED",
  };
}
