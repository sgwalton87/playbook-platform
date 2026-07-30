import { artifactDigest } from "../kernel/identity";
import type { BuildMilestoneState } from "../manifests";
import type {
  ManifestTransitionDecision,
  ManifestTransitionRequest,
} from "./types";

const TRANSITIONS: Readonly<Record<BuildMilestoneState, readonly BuildMilestoneState[]>> = {
  DISCOVERED: ["DEFINED"],
  DEFINED: ["BLOCKED", "READY"],
  BLOCKED: ["READY"],
  READY: ["PLANNED"],
  PLANNED: ["AUTHORIZED"],
  AUTHORIZED: ["IN_PROGRESS"],
  IN_PROGRESS: ["VALIDATING"],
  VALIDATING: ["COMPLETE"],
  COMPLETE: ["ARCHIVED"],
  ARCHIVED: [],
};

export class MilestoneAdvancementAuthority {
  evaluate(
    request: ManifestTransitionRequest,
    expected: {
      readonly manifest_digest: string;
      readonly context_digest: string;
      readonly package_digest: string;
      readonly authorization_valid: boolean;
      readonly execution_succeeded: boolean;
      readonly validation_passed: boolean;
    },
    timestamp: string
  ): ManifestTransitionDecision {
    const findings = [
      ...(!TRANSITIONS[request.from].includes(request.to) ? ["Lifecycle transition is invalid."] : []),
      ...(request.manifest_digest !== expected.manifest_digest ? ["Manifest identity changed."] : []),
      ...(request.context_digest !== expected.context_digest ? ["Context identity changed."] : []),
      ...(request.package_digest !== expected.package_digest ? ["Package identity changed."] : []),
      ...(!expected.authorization_valid ? ["Authorization is invalid."] : []),
      ...(!expected.execution_succeeded ? ["Execution has not succeeded."] : []),
      ...(!expected.validation_passed || request.validation_evidence.length === 0
        ? ["Passing validation evidence is required."]
        : []),
      ...(request.to === "COMPLETE" && request.completion_evidence.length === 0
        ? ["Completion evidence is required."]
        : []),
      ...(!request.requested_by || !request.authorization_id || !request.execution_id
        ? ["Transition identity is incomplete."]
        : []),
    ];
    const transitionBody = findings.length === 0
      ? {
          milestone_id: request.milestone_id,
          from: request.from,
          to: request.to,
          request_digest: request.digest,
        }
      : null;
    const body = {
      request_id: request.request_id,
      approved: findings.length === 0,
      authority: "PBOS-MILESTONE-ADVANCEMENT" as const,
      findings,
      transition_digest: transitionBody ? artifactDigest(transitionBody) : null,
      timestamp,
    };
    return { ...body, digest: artifactDigest(body) };
  }
}
