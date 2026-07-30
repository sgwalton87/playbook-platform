import { artifactDigest } from "../../kernel/identity";
import type { ProviderCertificationReadinessAssessment } from "../provider-onboarding";
import type { ProductionProviderEvaluation } from "../provider-selection";
import {
  productionProviderDecisionDigest,
  productionProviderPackageDigest,
} from "./identity";
import type {
  ProductionProviderCertificationDecision,
  ProductionProviderCertificationPackage,
} from "./types";

export interface ProductionProviderCertificationReview {
  readonly review_id: string;
  readonly provider_id: string;
  readonly reviewer_identity: string;
  readonly evaluation_digest: string;
  readonly readiness_digest: string;
  readonly package_digest: string;
  readonly decision_digest: string;
  readonly status: "CERTIFIED" | "CONDITIONAL" | "BLOCKED";
  readonly findings: readonly string[];
  readonly expiration: string;
  readonly timestamp: string;
  readonly digest: string;
}

export class IndependentProductionProviderCertificationAuthority {
  review(
    evaluation: ProductionProviderEvaluation,
    readiness: ProviderCertificationReadinessAssessment,
    packageValue: ProductionProviderCertificationPackage,
    decision: ProductionProviderCertificationDecision,
    reviewerIdentity: string,
    expiration: string
  ): ProductionProviderCertificationReview {
    const findings: string[] = [];
    if (!reviewerIdentity || reviewerIdentity === evaluation.provider_id) {
      findings.push("independent reviewer identity is invalid.");
    }
    if (evaluation.evaluation_status !== "READY_FOR_INTAKE") {
      findings.push("provider evaluation is not ready for intake.");
    }
    if (readiness.provider !== evaluation.provider_id) {
      findings.push("provider readiness identity does not match evaluation.");
    }
    if (readiness.decision !== "READY_FOR_CERTIFICATION") {
      findings.push("provider readiness evidence is incomplete.");
    }
    if (packageValue.digest !== productionProviderPackageDigest(packageValue)) {
      findings.push("provider certification package digest is invalid.");
    }
    if (decision.digest !== productionProviderDecisionDigest(decision)) {
      findings.push("provider certification decision digest is invalid.");
    }
    if (decision.package_id !== packageValue.package_id) {
      findings.push("provider certification package identity does not match.");
    }
    if (decision.status !== "CERTIFIED") {
      findings.push("provider certification authority did not certify.");
    }
    if (
      !Number.isFinite(Date.parse(expiration)) ||
      Date.parse(expiration) <= Date.parse(decision.timestamp)
    ) {
      findings.push("provider certification expiration is invalid.");
    }
    const status =
      findings.length === 0
        ? "CERTIFIED"
        : readiness.decision === "CONDITIONAL"
          ? "CONDITIONAL"
          : "BLOCKED";
    const body: ProductionProviderCertificationReview = {
      review_id: `PROVIDER-REVIEW-${evaluation.evaluation_id}`,
      provider_id: evaluation.provider_id,
      reviewer_identity: reviewerIdentity,
      evaluation_digest: evaluation.digest,
      readiness_digest: readiness.digest,
      package_digest: packageValue.digest,
      decision_digest: decision.digest,
      status,
      findings,
      expiration,
      timestamp: decision.timestamp,
      digest: "",
    };
    return Object.freeze({ ...body, digest: artifactDigest(body) });
  }

  revoke(
    decision: ProductionProviderCertificationDecision,
    authority: string,
    reason: string,
    timestamp: string
  ): ProductionProviderCertificationDecision {
    if (
      decision.status !== "CERTIFIED" ||
      !authority ||
      !reason ||
      Date.parse(timestamp) < Date.parse(decision.timestamp) ||
      decision.digest !== productionProviderDecisionDigest(decision)
    ) {
      throw new Error("Provider certification revocation rejected.");
    }
    const body: ProductionProviderCertificationDecision = {
      ...decision,
      status: "REVOKED",
      findings: [...decision.findings, `Revoked by ${authority}: ${reason}`],
      timestamp,
      digest: "",
    };
    return Object.freeze({
      ...body,
      provider_record_digests: Object.freeze([
        ...body.provider_record_digests,
      ]),
      findings: Object.freeze([...body.findings]),
      digest: productionProviderDecisionDigest(body),
    });
  }
}
