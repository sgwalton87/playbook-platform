import {
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../../kernel/contracts";
import { artifactDigest } from "../../kernel/identity";
import type {
  CapabilityProductionCertificationDecision,
  CapabilityProductionReadinessAssessment,
  CapabilityReadinessDomain,
} from "./types";

const REQUIRED_DOMAINS: readonly CapabilityReadinessDomain[] = [
  "IDENTITY",
  "ISSUER",
  "STORAGE",
  "EVIDENCE",
  "RECOVERY",
  "OBSERVABILITY",
  "SECURITY",
  "PERFORMANCE",
];

export function capabilityReadinessAssessmentDigest(
  assessment: CapabilityProductionReadinessAssessment
): string {
  const { digest: _digest, ...content } = assessment;
  void _digest;
  return artifactDigest(content);
}

export function capabilityProductionCertificationDigest(
  decision: CapabilityProductionCertificationDecision
): string {
  const { digest: _digest, ...content } = decision;
  void _digest;
  return artifactDigest(content);
}

export function validateCapabilityReadinessAssessment(
  assessment: CapabilityProductionReadinessAssessment
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "assessment.assessment_id", assessment.assessment_id);
  requireIdentifier(errors, "assessment.requirement", assessment.requirement);
  requireIdentifiers(errors, "assessment.evidence", assessment.evidence);
  requireTimestamp(errors, "assessment.assessed_at", assessment.assessed_at);
  requireIdentifier(
    errors,
    "assessment.assessor_identity",
    assessment.assessor_identity
  );
  requireDigest(errors, "assessment.digest", assessment.digest);
  if (assessment.digest !== capabilityReadinessAssessmentDigest(assessment)) {
    errors.push("production readiness assessment digest is invalid.");
  }
  if (
    assessment.current_state !== "IMPLEMENTED" ||
    assessment.validation !== "PASS" ||
    assessment.approval_state !== "APPROVED" ||
    assessment.evidence.length === 0
  ) {
    errors.push(`production readiness domain is incomplete: ${assessment.domain}.`);
  }
  return errors;
}

export class CapabilityProductionCertificationAuthority {
  certify(
    assessments: readonly CapabilityProductionReadinessAssessment[],
    timestamp: string
  ): CapabilityProductionCertificationDecision {
    const findings: string[] = [];
    requireTimestamp(findings, "certification.timestamp", timestamp);
    for (const domain of REQUIRED_DOMAINS) {
      const matches = assessments.filter((item) => item.domain === domain);
      if (matches.length !== 1) {
        findings.push(
          `production readiness requires exactly one assessment for ${domain}.`
        );
        continue;
      }
      findings.push(...validateCapabilityReadinessAssessment(matches[0]));
    }
    if (new Set(assessments.map(({ assessment_id: id }) => id)).size !== assessments.length) {
      findings.push("production readiness assessment identities are not unique.");
    }
    const body: CapabilityProductionCertificationDecision = {
      certification_id: `CAPABILITY-PRODUCTION-CERTIFICATION-${artifactDigest(
        assessments.map(({ digest }) => digest).sort()
      ).slice(0, 16)}`,
      status: findings.length === 0 ? "CERTIFIED" : "BLOCKED",
      assessment_digests: assessments.map(({ digest }) => digest).sort(),
      findings,
      authority: "PBOS-CAPABILITY-PRODUCTION-CERTIFICATION",
      timestamp,
      digest: "",
    };
    return { ...body, digest: capabilityProductionCertificationDigest(body) };
  }
}
