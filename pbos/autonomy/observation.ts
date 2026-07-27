import { digestValue, type PBOSRuntimeContext } from "../context";
import { LIFECYCLE_STAGES } from "../orchestrator";
import type { AutonomyFailure, AutonomyFailureCode, AutonomyInput, AutonomyObservation } from "./contracts";

const COMMIT = /^[a-f0-9]{7,64}$/;

export class AutonomyError extends Error {
  constructor(public readonly failures: AutonomyFailure[]) {
    super(failures.map((failure) => `${failure.code}: ${failure.message}`).join("; "));
    this.name = "AutonomyError";
  }
}

const failure = (code: AutonomyFailureCode, message: string): AutonomyFailure => ({ code, message });

function expectedContextDigest(context: PBOSRuntimeContext): string {
  const { contextDigest: _contextDigest, ...digestInput } = context;
  return digestValue(digestInput);
}

export function observeAutonomy(input: AutonomyInput): AutonomyObservation {
  const context = input.runtimeContext;
  const failures: AutonomyFailure[] = [];
  if (!context || context.contextDigest !== expectedContextDigest(context)) failures.push(failure("INVALID_CONTEXT", "Runtime Context is absent or digest-invalid."));
  if (!context?.documentInventory.length) failures.push(failure("MISSING_AUTHORITY", "Constitutional authority inventory is empty."));
  if (input.governanceState.status === "conflict") failures.push(failure("GOVERNANCE_CONFLICT", "Governance conflict requires human resolution."));
  if (Number.isNaN(Date.parse(input.observationTimestamp)) || !COMMIT.test(input.repositoryState.commit)) failures.push(failure("MISSING_EVIDENCE", "Observation timestamp or repository identity evidence is invalid."));
  const completed = input.lifecycleState.completedStages;
  if (
    completed.some((stage, index) => stage !== LIFECYCLE_STAGES[index]) ||
    input.lifecycleState.currentLifecycleStage !== (completed.at(-1) ?? null)
  ) failures.push(failure("INVALID_LIFECYCLE", "Lifecycle stages are skipped or inconsistent."));
  if (failures.length) throw new AutonomyError(failures);

  const missingEvidence = [
    ...(!input.repositoryState.changedFiles.length ? ["repository:changed-files"] : []),
    ...(input.engineOutputs.validation?.missingEvidence ?? []),
  ].sort();
  const blockedConditions = [
    ...input.lifecycleState.blockedStages.map((stage) => `lifecycle:${stage}`),
    ...input.governanceState.blockers,
    ...(context?.exclusionRecords.map((item) => `context:${item.artifact}:${item.reason}`) ?? []),
  ].sort();
  const availableNextActions = input.lifecycleState.nextEligibleStage
    ? [`ADVANCE_${input.lifecycleState.nextEligibleStage}`]
    : [];
  const evidenceReferences = [
    ...input.lifecycleState.evidenceReferences,
    ...input.governanceState.evidenceReferences,
    ...input.repositoryState.changedFiles.map((file) => `changed:${file}`),
    `context:${context!.contextDigest}`,
    `repository:${input.repositoryState.commit}`,
  ].filter((item, index, values) => values.indexOf(item) === index).sort();
  const observationBody = {
    observationTimestamp: input.observationTimestamp,
    inputContextDigest: context!.contextDigest,
    currentLifecycleStage: input.lifecycleState.currentLifecycleStage,
    completedStages: [...completed],
    availableNextActions,
    blockedConditions,
    missingEvidence,
    governanceRequirements: [...input.governanceState.requiredApprovals].sort(),
    validationStatus: input.engineOutputs.validation?.status ?? "NOT_AVAILABLE" as const,
    releaseStatus: input.engineOutputs.release?.releaseStatus ?? "NOT_AVAILABLE" as const,
    evidenceReferences,
  };
  return { observationId: `PBOS-OBS-${digestValue(observationBody).slice(0, 16).toUpperCase()}`, ...observationBody };
}
