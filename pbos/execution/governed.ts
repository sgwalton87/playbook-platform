import { digestValue, type PBOSRuntimeContext } from "../context";
import type {
  ExecutionFailure,
  ExecutionFailureCode,
  ExecutionPlan,
  GovernedExecutionInput,
} from "./governed-contracts";

const COMMIT = /^[a-f0-9]{7,64}$/;

export class ExecutionPlanningError extends Error {
  constructor(public readonly failures: ExecutionFailure[]) {
    super(failures.map((failure) => `${failure.code}: ${failure.message}`).join("; "));
    this.name = "ExecutionPlanningError";
  }
}

function failure(code: ExecutionFailureCode, artifact: string, message: string): ExecutionFailure {
  return { code, artifact, message };
}

function expectedContextDigest(context: PBOSRuntimeContext): string {
  const { contextDigest: _contextDigest, ...digestInput } = context;
  return digestValue(digestInput);
}

function sameMembers(left: string[], right: string[]): boolean {
  return [...left].sort().join("\0") === [...right].sort().join("\0");
}

export function createGovernedExecutionPlan(input: GovernedExecutionInput): ExecutionPlan {
  const failures: ExecutionFailure[] = [];
  const context = input.runtimeContext;
  if (!context || context.contextDigest !== expectedContextDigest(context) || !context.documentInventory.length) {
    failures.push(failure("INVALID_CONTEXT", "runtime-context", "Verified PBOS Runtime Context is required."));
  }
  if (
    !input.planningDecision.selectedGate ||
    input.planningDecision.selectedGate !== input.gate.identifier ||
    input.planningDecision.blockingDependencies.length > 0
  ) {
    failures.push(failure("INVALID_PLANNING_DECISION", input.gate.identifier, "Planning Decision is absent, blocked, or does not match the source gate."));
  }
  if (input.gate.status === "blocked" || input.gate.status === "complete") {
    failures.push(failure("BLOCKED_EXECUTION", input.gate.identifier, "Blocked or completed gates cannot produce execution plans."));
  }
  if (!sameMembers(input.gate.dependencies, input.planningDecision.satisfiedDependencies)) {
    failures.push(failure("UNRESOLVED_DEPENDENCY", input.gate.identifier, "Planning evidence does not satisfy every gate dependency."));
  }
  if (input.governance.approvalStatus !== "approved" || !input.governance.approvalIdentifier) {
    failures.push(failure("MISSING_APPROVAL", input.gate.identifier, "Explicit human governance approval is required."));
  }
  if (input.governance.blockers.length || input.governance.exclusions.length || context?.exclusionRecords.length) {
    failures.push(failure("BLOCKED_EXECUTION", input.gate.identifier, "Governance blockers or exclusions prevent execution planning."));
  }
  if (context?.constraints.some((constraint) => constraint.kind === "execution-block")) {
    failures.push(failure("BLOCKED_EXECUTION", input.gate.identifier, "A constitutional execution-block constraint is active."));
  }
  if (!input.repository.branch.trim() || !COMMIT.test(input.repository.commit) || input.repository.workingTree !== "clean") {
    failures.push(failure("INVALID_REPOSITORY_IDENTITY", "repository", "Execution planning requires a clean, identified repository state."));
  }
  if (
    !input.gate.validationRequirements.length ||
    !sameMembers(input.gate.validationRequirements, input.planningDecision.requiredValidations)
  ) {
    failures.push(failure("MISSING_VALIDATION_REQUIREMENT", input.gate.identifier, "Planning Decision must preserve every gate validation requirement."));
  }
  if (
    !input.gate.objective.trim() ||
    !input.gate.requiredActions.length ||
    !input.gate.affectedSystems.length ||
    !input.gate.rollbackExpectations.length ||
    !input.gate.evidenceRequirements.length ||
    !input.gate.completionCriteria.length
  ) {
    failures.push(failure("INVALID_PLANNING_DECISION", input.gate.identifier, "Execution contract requirements cannot be empty."));
  }
  if (failures.length) throw new ExecutionPlanningError(failures);

  const constraints = (context?.constraints ?? [])
    .map((constraint) => `${constraint.id}: ${constraint.description}`)
    .sort();
  const evidenceRequirements = [
    ...input.gate.evidenceRequirements,
    ...input.planningDecision.evidenceReferences,
    ...input.governance.evidenceReferences,
    ...input.repository.validationResults.flatMap((result) => result.evidence),
    `approval:${input.governance.approvalIdentifier}`,
    `repository:${input.repository.commit}`,
  ].filter((item, index, values) => values.indexOf(item) === index).sort();
  const planBody = {
    approvedObjective: input.gate.objective,
    sourceGate: input.gate.identifier,
    satisfiedDependencies: [...input.planningDecision.satisfiedDependencies].sort(),
    requiredActions: [...input.gate.requiredActions],
    affectedSystems: [...input.gate.affectedSystems].sort(),
    constraints,
    requiredValidations: [...input.gate.validationRequirements].sort(),
    rollbackExpectations: [...input.gate.rollbackExpectations],
    evidenceRequirements,
    completionCriteria: [...input.gate.completionCriteria],
  };

  return {
    executionId: `PBOS-EXEC-${digestValue({
      contextDigest: context?.contextDigest,
      governance: input.governance,
      plan: planBody,
      repository: { branch: input.repository.branch, commit: input.repository.commit },
    }).slice(0, 16).toUpperCase()}`,
    ...planBody,
  };
}
