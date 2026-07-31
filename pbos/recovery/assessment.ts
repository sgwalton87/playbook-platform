import { artifactDigest } from "../kernel/identity";
import type {
  PBOSRecoveryArtifactExpectation,
  PBOSRecoveryAssessment,
  PBOSRecoveryEvidence,
  PBOSRecoveryPhase,
  PBOSRecoveryStep,
  PBOSRecoveryTransition,
} from "./types";

const STEPS: Readonly<Record<Exclude<PBOSRecoveryTransition, "NONE">, PBOSRecoveryStep>> = {
  CHANGE_BOUNDARY_REQUIRED: {
    command: "npm run pbos:change-boundary",
    purpose: "Create an identity-bound repository transition boundary.",
  },
  COMMITTED_CONTEXT_RECONCILIATION_REQUIRED: {
    command: "npm run pbos:approve-refresh",
    purpose: "Authorize the committed repository reconciliation proposed by PBOS.",
  },
  APPROVE_BOUNDARY_REQUIRED: {
    command: "npm run pbos:approve-boundary",
    purpose: "Authorize the current boundary through an independent human decision.",
  },
  APPROVE_REFRESH_REQUIRED: {
    command: "npm run pbos:approve-refresh",
    purpose: "Authorize the exact reconciliation-bound context transition.",
  },
  REFRESH_REQUIRED: {
    command: "npm run pbos:refresh",
    purpose: "Apply the approved repository-context refresh.",
  },
  CONTEXT_ACTIVATION_REQUIRED: {
    command: "npm run pbos:context-activate",
    purpose: "Activate the verified context through Context Activation Authority.",
  },
};

const ORDER: readonly Exclude<PBOSRecoveryTransition, "NONE">[] = [
  "CHANGE_BOUNDARY_REQUIRED",
  "APPROVE_BOUNDARY_REQUIRED",
  "APPROVE_REFRESH_REQUIRED",
  "REFRESH_REQUIRED",
  "CONTEXT_ACTIVATION_REQUIRED",
];

const ARTIFACTS: Readonly<Record<
  Exclude<PBOSRecoveryTransition, "NONE">,
  readonly PBOSRecoveryArtifactExpectation[]
>> = {
  CHANGE_BOUNDARY_REQUIRED: [{
    path: "pbos/runtime/change-boundary.json",
    owner: "change-boundary-authority",
    classification: "RUNTIME",
  }],
  COMMITTED_CONTEXT_RECONCILIATION_REQUIRED: [{
    path: "pbos/runtime/context-refresh-approval.json",
    owner: "context-refresh-authority",
    classification: "RUNTIME",
  }],
  APPROVE_BOUNDARY_REQUIRED: [{
    path: "pbos/runtime/launch-approval.json",
    owner: "authority-ledger",
    classification: "RUNTIME",
  }],
  APPROVE_REFRESH_REQUIRED: [{
    path: "pbos/runtime/context-refresh-approval.json",
    owner: "context-refresh-authority",
    classification: "RUNTIME",
  }],
  REFRESH_REQUIRED: [
    {
      path: "pbos/runtime/repository-context.json",
      owner: "repository-context",
      classification: "RUNTIME",
    },
    {
      path: "pbos/runtime/context-refresh.json",
      owner: "repository-context",
      classification: "RUNTIME",
    },
    {
      path: "pbos/runtime/context-refresh-approval.json",
      owner: "context-refresh-authority",
      classification: "RUNTIME",
    },
    {
      path: "docs/release-evidence/pbos-context-refresh.md",
      owner: "repository-context",
      classification: "TRACKED_EVIDENCE",
    },
  ],
  CONTEXT_ACTIVATION_REQUIRED: [{
    path: "pbos/runtime/trusted-build-context.json",
    owner: "context-activation-authority",
    classification: "RUNTIME",
  }],
};

function deriveState(evidence: PBOSRecoveryEvidence): {
  phase: PBOSRecoveryPhase;
  transition: PBOSRecoveryTransition;
} {
  if (evidence.trusted) {
    return { phase: "TRUSTED", transition: "NONE" };
  }
  if (
    evidence.refreshApproval === "VALID" &&
    evidence.refreshApprovalState === "APPLIED" &&
    evidence.reconciliation.reconciliation_state === "VERIFIED"
  ) {
    return {
      phase: "TRUST_ACTIVATION_READY",
      transition: "CONTEXT_ACTIVATION_REQUIRED",
    };
  }
  const committedContextTransition =
    evidence.sourceChangeCount === 0 &&
    (evidence.trustedCommitIdentity === null ||
      evidence.repository.commit !== evidence.trustedCommitIdentity);
  const runtimeOnlyTransition =
    evidence.sourceChangeCount === 0 && evidence.runtimeChangesOnly;
  if (
    (committedContextTransition || runtimeOnlyTransition) &&
    (evidence.refreshApproval !== "VALID" ||
      evidence.refreshApprovalState !== "APPROVED")
  ) {
    return {
      phase: "COMMITTED_CONTEXT_RECONCILIATION_REQUIRED",
      transition: "COMMITTED_CONTEXT_RECONCILIATION_REQUIRED",
    };
  }
  if (
    (committedContextTransition || runtimeOnlyTransition) &&
    evidence.refreshApproval === "VALID" &&
    evidence.refreshApprovalState === "APPROVED"
  ) {
    return { phase: "REFRESH_APPROVED", transition: "REFRESH_REQUIRED" };
  }
  if (evidence.boundary !== "VALID") {
    return {
      phase: "CONTEXT_INVALID",
      transition: "CHANGE_BOUNDARY_REQUIRED",
    };
  }
  if (evidence.launchApproval !== "VALID") {
    return {
      phase: "CHANGE_BOUNDARY_CREATED",
      transition: "APPROVE_BOUNDARY_REQUIRED",
    };
  }
  if (evidence.reconciliation.reconciliation_state === "VERIFIED") {
    return {
      phase: "TRUST_ACTIVATION_READY",
      transition: "CONTEXT_ACTIVATION_REQUIRED",
    };
  }
  if (
    evidence.refreshApproval !== "VALID" ||
    evidence.refreshApprovalState !== "APPROVED"
  ) {
    return {
      phase: "BOUNDARY_APPROVED",
      transition: "APPROVE_REFRESH_REQUIRED",
    };
  }
  return { phase: "REFRESH_APPROVED", transition: "REFRESH_REQUIRED" };
}

export function buildPBOSRecoveryAssessment(
  evidence: PBOSRecoveryEvidence,
  timestamp: string
): PBOSRecoveryAssessment {
  const { phase, transition } = deriveState(evidence);
  const transitionSequence: readonly Exclude<PBOSRecoveryTransition, "NONE">[] =
    transition === "COMMITTED_CONTEXT_RECONCILIATION_REQUIRED"
      ? [
          "COMMITTED_CONTEXT_RECONCILIATION_REQUIRED",
          "REFRESH_REQUIRED",
          "CONTEXT_ACTIVATION_REQUIRED",
        ]
      : transition === "NONE"
        ? []
        : ORDER.slice(ORDER.indexOf(transition));
  const sequence = transitionSequence.map((item) => STEPS[item]);
  const artifactCandidates = transition === "NONE"
    ? []
    : sequence.flatMap(({ command }) => {
        const item = ORDER.find((candidate) => STEPS[candidate].command === command);
        return item ? ARTIFACTS[item] : [];
      });
  const expectedArtifacts = artifactCandidates.filter(
    (artifact, index, artifacts) =>
      artifacts.findIndex(({ path }) => path === artifact.path) === index
  );
  const approvalRequirements = sequence
    .filter(({ command }) =>
      command === "npm run pbos:change-boundary" ||
      command === "npm run pbos:approve-refresh" ||
      command === "npm run pbos:approve-boundary" ||
      command === "npm run pbos:approve-refresh"
    )
    .map(({ command }) => ({
      transition: command,
      requester_required: true,
      independent_reviewer_required:
        command === "npm run pbos:approve-boundary" ||
        command === "npm run pbos:approve-refresh",
    }));
  const diagnosis = evidence.trusted
    ? ["Trusted context matches current repository reality."]
    : evidence.findings.length > 0
      ? [...evidence.findings]
      : ["Trusted context does not satisfy current repository reality."];
  const body = {
    repository_state: evidence.repository,
    context_state: evidence.reconciliation,
    trust_state: {
      level: evidence.trusted ? "TRUSTED" as const : "BLOCKED" as const,
      trusted_context_identity: evidence.trustedContextIdentity,
      boundary: evidence.boundary,
      launch_approval: evidence.launchApproval,
      refresh_approval: evidence.refreshApproval,
    },
    recovery_required: !evidence.trusted,
    diagnosis,
    current_phase: phase,
    recommended_transition: transition,
    required_sequence: sequence,
    expected_artifacts: expectedArtifacts,
    approval_requirements: approvalRequirements,
    validation_commands: [
      "npm run pbos:context-status",
      "npm run pbos:next",
      "npm run pbos:status",
    ],
  };
  const digest = artifactDigest(body);
  return {
    assessment_id: `PBOS-RECOVERY-${digest.slice(0, 16)}`,
    timestamp,
    ...body,
    digest,
  };
}
