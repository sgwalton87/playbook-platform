import { digestValue, type PBOSRuntimeContext } from "../context";
import type {
  ConfidenceClassification,
  PlanningDecision,
  PlanningFailure,
  PlanningFailureCode,
  PlanningGate,
  PlanningInput,
} from "./constitution-aware-contracts";

const COMMIT = /^[a-f0-9]{7,64}$/;

export class PlanningError extends Error {
  constructor(public readonly failures: PlanningFailure[]) {
    super(failures.map((failure) => `${failure.code}: ${failure.message}`).join("; "));
    this.name = "PlanningError";
  }
}

function failure(code: PlanningFailureCode, artifact: string, message: string): PlanningFailure {
  return { code, artifact, message };
}

function contextDigest(context: PBOSRuntimeContext): string {
  const { contextDigest: _contextDigest, ...digestInput } = context;
  return digestValue(digestInput);
}

function confidenceFor(input: PlanningInput, requiredValidations: string[]): ConfidenceClassification {
  const validations = new Map(input.repository.validationResults.map((result) => [result.identifier, result.status]));
  if (input.repository.workingTree === "dirty" || requiredValidations.some((id) => validations.get(id) === "failed")) {
    return "LOW";
  }
  if (requiredValidations.some((id) => validations.get(id) !== "passed")) return "MEDIUM";
  return "HIGH";
}

function eligibleGate(gate: PlanningGate, completed: Set<string>, known: Set<string>, authority: Set<string>): boolean {
  return (
    (gate.status === "ready" || gate.status === "in_progress") &&
    gate.dependencies.every((dependency) => known.has(dependency) && completed.has(dependency)) &&
    gate.authorityReferences.length > 0 &&
    gate.authorityReferences.every((reference) => authority.has(reference))
  );
}

export function planNextAction(input: PlanningInput): PlanningDecision {
  const failures: PlanningFailure[] = [];
  const context = input.runtimeContext;
  if (!context) throw new PlanningError([failure("MISSING_CONTEXT", "runtime-context", "PBOS Runtime Context is required.")]);
  if (context.contextDigest !== contextDigest(context) || !context.documentInventory.length) {
    failures.push(failure("INVALID_CONTEXT", "runtime-context", "Runtime Context digest or constitutional inventory is invalid."));
  }
  if (context.exclusionRecords.length > 0) {
    failures.push(failure("UNRESOLVED_GOVERNANCE", "runtime-context", "Runtime Context contains unresolved exclusions."));
  }
  if (context.constraints.some((constraint) => constraint.kind === "execution-block")) {
    failures.push(failure("UNRESOLVED_GOVERNANCE", "runtime-context", "A constitutional execution-block constraint prevents gate selection."));
  }
  if (!input.repository.branch.trim() || !COMMIT.test(input.repository.commit)) {
    failures.push(failure("INVALID_REPOSITORY_STATE", "repository", "Repository branch or commit evidence is invalid."));
  }

  const gateIds = new Set<string>();
  for (const gate of input.gates) {
    if (gateIds.has(gate.identifier)) failures.push(failure("CONFLICTING_GATE", gate.identifier, "Gate identifier is duplicated."));
    gateIds.add(gate.identifier);
  }
  if (failures.length) throw new PlanningError(failures);

  const completed = new Set(input.gates.filter((gate) => gate.status === "complete").map((gate) => gate.identifier));
  const authority = new Set(context.documentInventory.map((document) => document.identifier));
  const candidates = input.gates
    .filter((gate) => eligibleGate(gate, completed, gateIds, authority))
    .sort((left, right) => right.priority - left.priority || left.identifier.localeCompare(right.identifier));
  const selected = candidates[0] ?? null;

  if (!selected) {
    const blockingDependencies = input.gates
      .filter((gate) => gate.status !== "complete")
      .flatMap((gate) => gate.dependencies.filter((dependency) => !gateIds.has(dependency) || !completed.has(dependency)))
      .filter((dependency, index, values) => values.indexOf(dependency) === index)
      .sort();
    return {
      selectedGate: null,
      reasoning: ["No gate satisfies status, dependency, and constitutional authority requirements."],
      satisfiedDependencies: [],
      blockingDependencies,
      requiredValidations: [],
      confidenceClassification: "LOW",
      evidenceReferences: [`context:${context.contextDigest}`, `repository:${input.repository.commit}`],
    };
  }

  const satisfiedDependencies = [...selected.dependencies].sort();
  const requiredValidations = [...selected.validationRequirements].sort();
  const evidenceReferences = [
    `context:${context.contextDigest}`,
    `registry:${context.registryDigest}`,
    `governance:${context.governanceDigest}`,
    `repository:${input.repository.commit}`,
    ...selected.authorityReferences.map((reference) => `authority:${reference}`),
    ...selected.evidenceReferences,
  ].sort();

  return {
    selectedGate: selected.identifier,
    reasoning: [
      `${selected.identifier} is eligible under verified constitutional authority.`,
      `Priority ${selected.priority} ranks first among ${candidates.length} eligible gate${candidates.length === 1 ? "" : "s"}.`,
      "The decision is advisory and does not execute the gate.",
    ],
    satisfiedDependencies,
    blockingDependencies: [],
    requiredValidations,
    confidenceClassification: confidenceFor(input, requiredValidations),
    evidenceReferences,
  };
}
