import type {
  ReleaseEvaluation,
  ValidationEvidence,
} from "./contracts";

export function evaluateReleaseEvidence(
  evidence: ValidationEvidence[]
): ReleaseEvaluation {
  const failedEvidenceIds = evidence
    .filter((item) => item.status === "FAIL")
    .map((item) => item.id);

  const pendingEvidenceIds = evidence
    .filter((item) => item.status === "PENDING")
    .map((item) => item.id);

  if (failedEvidenceIds.length > 0) {
    return {
      status: "FAIL",
      promotionReady: false,
      failedEvidenceIds,
      pendingEvidenceIds,
    };
  }

  if (pendingEvidenceIds.length > 0 || evidence.length === 0) {
    return {
      status: "PENDING",
      promotionReady: false,
      failedEvidenceIds,
      pendingEvidenceIds,
    };
  }

  return {
    status: "PASS",
    promotionReady: true,
    failedEvidenceIds,
    pendingEvidenceIds,
  };
}
