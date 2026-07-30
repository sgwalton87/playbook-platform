import {
  experienceCapabilityDecisionDigest,
  experienceCapabilityDigest,
  scholarDecisionBoundaryDigest,
  scholarExperienceFactDigest,
} from "./identity";
import type {
  ExperienceCapability,
  ExperienceCapabilityDecision,
  ExperienceContext,
  ScholarDecisionBoundary,
  ScholarExperienceFact,
} from "./types";

export class ExperienceCapabilityFramework {
  evaluate(
    capability: ExperienceCapability,
    context: ExperienceContext
  ): ExperienceCapabilityDecision {
    const reasons: string[] = [];
    if (capability.digest !== experienceCapabilityDigest(capability)) {
      reasons.push("capability contract digest is invalid.");
    }
    if (!capability.allowed_roles.includes(context.role)) {
      reasons.push("role is not permitted.");
    }
    if (!context.permissions.includes(capability.required_permission)) {
      reasons.push("required permission is absent.");
    }
    if (
      capability.required_consent &&
      !context.consents.includes(capability.required_consent)
    ) {
      reasons.push("required consent is absent.");
    }
    if (
      capability.kernel_state === "AVAILABLE" &&
      !capability.kernel_decision_reference
    ) {
      reasons.push("Kernel availability decision is absent.");
    }
    const state =
      reasons.some(
        (reason) =>
          reason.includes("digest") ||
          reason.includes("Kernel availability")
      )
        ? "UNAVAILABLE"
        : reasons.some((reason) => reason.includes("permission") || reason.includes("role"))
          ? "REQUIRES_PERMISSION"
          : reasons.some((reason) => reason.includes("consent"))
            ? "LOCKED"
            : capability.kernel_state;
    const body: ExperienceCapabilityDecision = {
      capability_id: capability.capability_id,
      state,
      visible: state !== "UNAVAILABLE",
      reason: reasons,
      kernel_decision_reference: capability.kernel_decision_reference,
      digest: "",
    };
    return Object.freeze({
      ...body,
      reason: Object.freeze([...reasons]),
      digest: experienceCapabilityDecisionDigest(body),
    });
  }
}

export function validateScholarExperienceFact(
  value: ScholarExperienceFact,
  context: ExperienceContext
): readonly string[] {
  const errors: string[] = [];
  if (value.digest !== scholarExperienceFactDigest(value)) {
    errors.push("Scholar fact digest is invalid.");
  }
  if (
    value.scholar_identity !== context.scholar_identity ||
    value.owner_identity !== context.scholar_identity
  ) {
    errors.push("Scholar ownership is invalid.");
  }
  if (
    !value.source_reference ||
    value.evidence_references.length === 0 ||
    !value.human_confirmed
  ) {
    errors.push("Scholar fact requires provenance and human confirmation.");
  }
  if (
    value.sensitive &&
    !context.permissions.includes("scholar.sensitive.read")
  ) {
    errors.push("Sensitive Scholar information requires authorization.");
  }
  if (value.revision < 1) {
    errors.push("Scholar fact revision is invalid.");
  }
  return errors;
}

const PROHIBITED_ACTIONS = new Set([
  "DECIDE",
  "RANK_HUMAN_WORTH",
  "REPLACE_ADVISOR",
  "CREATE_FACT",
  "IRREVERSIBLE_ACTION",
]);

export function enforceScholarDecisionBoundary(
  value: ScholarDecisionBoundary
): ScholarDecisionBoundary {
  if (
    value.digest !== scholarDecisionBoundaryDigest(value) ||
    PROHIBITED_ACTIONS.has(value.action) ||
    !value.explanation ||
    value.evidence_references.length === 0 ||
    !value.human_confirmation_required
  ) {
    throw new Error("Scholar decision boundary rejected.");
  }
  return Object.freeze({
    ...value,
    evidence_references: Object.freeze([...value.evidence_references]),
  });
}
