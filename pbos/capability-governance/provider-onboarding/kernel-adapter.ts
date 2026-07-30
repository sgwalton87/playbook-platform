import type { ProductionCertificationProof } from "../../kernel/engine-activation";
import { productionCertificationProofDigest } from "../../kernel/engine-activation";
import type { ProductionProviderCertificationDecision } from "../production-certification";
import { productionProviderDecisionDigest } from "../production-certification";
import { providerReadinessAssessmentDigest } from "./identity";
import type { ProductionProviderRegistry } from "./registry";
import type { ProviderCertificationReadinessAssessment } from "./types";

export function createOnboardedProviderKernelProof(
  registry: ProductionProviderRegistry,
  providerId: string,
  readiness: ProviderCertificationReadinessAssessment,
  certification: ProductionProviderCertificationDecision,
  validUntil: string
): ProductionCertificationProof {
  const provider = registry.provider(providerId);
  const certified =
    provider?.registration_status === "CERTIFIED" &&
    readiness.provider === providerId &&
    readiness.decision === "READY_FOR_CERTIFICATION" &&
    readiness.digest === providerReadinessAssessmentDigest(readiness) &&
    certification.status === "CERTIFIED" &&
    certification.digest === productionProviderDecisionDigest(certification);
  const body: ProductionCertificationProof = {
    certification_reference: certification.certification_id,
    status: certified ? "CERTIFIED" : "BLOCKED",
    authority: "PBOS-CAPABILITY-PRODUCTION-CERTIFICATION",
    evidence_references: [
      readiness.digest,
      ...certification.provider_record_digests,
    ],
    valid_until: validUntil,
    digest: "",
  };
  return { ...body, digest: productionCertificationProofDigest(body) };
}
