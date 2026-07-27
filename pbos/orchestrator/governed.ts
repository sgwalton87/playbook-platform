import { digestValue, type PBOSRuntimeContext } from "../context";
import type {
  GovernedOrchestrationInput,
  GovernedOrchestrationResult,
  LifecycleStage,
  OrchestrationFailure,
  OrchestrationFailureCode,
} from "./governed-contracts";
import { LIFECYCLE_STAGES } from "./governed-contracts";

const SHA256 = /^[a-f0-9]{64}$/;

export class OrchestrationError extends Error {
  constructor(public readonly failures: OrchestrationFailure[]) {
    super(failures.map((failure) => `${failure.code}: ${failure.message}`).join("; "));
    this.name = "OrchestrationError";
  }
}

function failure(code: OrchestrationFailureCode, stage: LifecycleStage, message: string): OrchestrationFailure {
  return { code, stage, message };
}

function expectedContextDigest(context: PBOSRuntimeContext): string {
  const { contextDigest: _contextDigest, ...digestInput } = context;
  return digestValue(digestInput);
}

function artifactPresence(input: GovernedOrchestrationInput): boolean[] {
  const artifacts = input.artifacts;
  return [artifacts.constitution, artifacts.context, artifacts.plan, artifacts.execution, artifacts.validation, artifacts.certification, artifacts.release].map(Boolean);
}

function evidenceFor(stage: LifecycleStage, input: GovernedOrchestrationInput): string[] {
  const artifacts = input.artifacts;
  switch (stage) {
    case "CONSTITUTION": return artifacts.constitution?.evidenceReferences ?? [];
    case "CONTEXT": return artifacts.context ? [`context:${artifacts.context.contextDigest}`] : [];
    case "PLAN": return artifacts.plan?.evidenceReferences ?? [];
    case "EXECUTE": return artifacts.execution?.plan.evidenceRequirements ?? [];
    case "VALIDATE": return artifacts.validation?.evidenceReferences ?? [];
    case "CERTIFY": return artifacts.certification?.certificationEvidenceBundle ?? [];
    case "RELEASE": return artifacts.release?.evidenceBundle ?? [];
  }
}

function validateArtifact(stage: LifecycleStage, input: GovernedOrchestrationInput): OrchestrationFailure[] {
  const artifacts = input.artifacts;
  switch (stage) {
    case "CONSTITUTION":
      return artifacts.constitution?.status === "VERIFIED" && SHA256.test(artifacts.constitution.sourceDigest) && artifacts.constitution.evidenceReferences.length
        ? [] : [failure("MISSING_EVIDENCE", stage, "Verified constitutional evidence is required.")];
    case "CONTEXT":
      return artifacts.context && artifacts.context.contextDigest === expectedContextDigest(artifacts.context) && artifacts.context.documentInventory.length && !artifacts.context.exclusionRecords.length
        ? [] : [failure("INVALID_CONTEXT", stage, "Runtime Context is invalid or contains exclusions.")];
    case "PLAN":
      return artifacts.plan?.selectedGate && !artifacts.plan.blockingDependencies.length && artifacts.plan.evidenceReferences.length
        ? [] : [failure("INVALID_ARTIFACT", stage, "An eligible evidenced Planning Decision is required.")];
    case "EXECUTE":
      return artifacts.execution?.approvalStatus === "approved" && artifacts.execution.approvalIdentifier && artifacts.execution.planDigest === digestValue(artifacts.execution.plan) && artifacts.execution.plan.evidenceRequirements.length
        ? [] : [failure("INVALID_ARTIFACT", stage, "An approved digest-valid Execution Contract is required.")];
    case "VALIDATE":
      return artifacts.validation?.status === "PASS" && !artifacts.validation.failedRequirements.length && !artifacts.validation.missingEvidence.length && !artifacts.validation.blockingConditions.length && artifacts.validation.evidenceReferences.length
        ? [] : [failure("MISSING_EVIDENCE", stage, "A complete PASS Validation Result is required.")];
    case "CERTIFY":
      return artifacts.certification?.certificationStatus === "CERTIFIED" && artifacts.certification.constitutionalCompliance && artifacts.certification.governanceCompliance && artifacts.certification.evidenceCompleteness && artifacts.certification.certificationEvidenceBundle.length
        ? [] : [failure("INVALID_ARTIFACT", stage, "A complete CERTIFIED result is required.")];
    case "RELEASE":
      return artifacts.release?.releaseStatus === "APPROVED" && !artifacts.release.outstandingConditions.length && artifacts.release.evidenceBundle.length && artifacts.release.rollbackRequirements.length
        ? [] : [failure("INVALID_ARTIFACT", stage, "An approved evidenced release decision with rollback requirements is required.")];
  }
}

export function orchestrateLifecycle(input: GovernedOrchestrationInput): GovernedOrchestrationResult {
  if (Number.isNaN(Date.parse(input.observationTimestamp))) {
    throw new OrchestrationError([failure("INVALID_TRANSITION", "CONSTITUTION", "Observation timestamp is invalid.")]);
  }
  const presence = artifactPresence(input);
  const firstMissing = presence.indexOf(false);
  const derivedCount = firstMissing === -1 ? LIFECYCLE_STAGES.length : firstMissing;
  if (presence.slice(derivedCount).some(Boolean)) {
    const skippedIndex = presence.findIndex((present, index) => index >= derivedCount && present);
    throw new OrchestrationError([failure("SKIPPED_STAGE", LIFECYCLE_STAGES[skippedIndex], "A lifecycle artifact exists before its prerequisite stage.")]);
  }

  const derivedStages = LIFECYCLE_STAGES.slice(0, derivedCount);
  const failures = derivedStages.flatMap((stage) => validateArtifact(stage, input));
  if (failures.length) throw new OrchestrationError(failures);
  const previous = input.state.completedStages;
  if (
    previous.some((stage, index) => stage !== LIFECYCLE_STAGES[index]) ||
    derivedStages.slice(0, previous.length).some((stage, index) => stage !== previous[index]) ||
    derivedStages.length < previous.length ||
    derivedStages.length > previous.length + 1
  ) {
    throw new OrchestrationError([failure("INVALID_TRANSITION", derivedStages.at(-1) ?? "CONSTITUTION", "Lifecycle state may advance exactly one ordered stage per orchestration cycle.")]);
  }

  const governanceBlocked = input.governance.approvalStatus !== "approved" || !input.governance.approvalIdentifier || input.governance.blockers.length > 0;
  const currentLifecycleStage = derivedStages.at(-1) ?? null;
  const nextStage = LIFECYCLE_STAGES[derivedStages.length] ?? null;
  const blockedStages = governanceBlocked && nextStage ? LIFECYCLE_STAGES.slice(derivedStages.length) : [];
  const transitioned = derivedStages.length === previous.length + 1;
  const stateTransitionHistory = [...input.state.transitionHistory];
  if (transitioned && currentLifecycleStage) {
    stateTransitionHistory.push({
      from: previous.at(-1) ?? null,
      to: currentLifecycleStage,
      transitionedAt: input.observationTimestamp,
      evidenceReferences: [...evidenceFor(currentLifecycleStage, input)].sort(),
    });
  }
  const evidenceReferences = [
    ...derivedStages.flatMap((stage) => evidenceFor(stage, input)),
    ...input.governance.evidenceReferences,
  ].filter((item, index, values) => values.indexOf(item) === index).sort();
  const humanApprovalRequirements = [
    ...input.governance.humanApprovalRequirements,
    ...(!input.governance.approvalIdentifier ? ["lifecycle-governance-approval"] : []),
  ].filter((item, index, values) => values.indexOf(item) === index).sort();
  const resultBody = {
    currentLifecycleStage,
    completedStages: [...derivedStages],
    nextEligibleStage: governanceBlocked ? null : nextStage,
    blockedStages: [...blockedStages],
    evidenceReferences,
    stateTransitionHistory,
    humanApprovalRequirements,
  };

  return {
    orchestrationId: `PBOS-ORCH-${digestValue({ governance: input.governance, result: resultBody }).slice(0, 16).toUpperCase()}`,
    ...resultBody,
  };
}
