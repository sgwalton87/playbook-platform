import type { ProductionCertificationProof } from "../../kernel/engine-activation";
import { productionCertificationProofDigest } from "../../kernel/engine-activation";
import { productionProviderDecisionDigest } from "./identity";
import type { ProductionProviderCertificationDecision } from "./types";

export function createKernelProductionCertificationProof(
  decision: ProductionProviderCertificationDecision,
  validUntil: string
): ProductionCertificationProof {
  const decisionValid =
    decision.digest === productionProviderDecisionDigest(decision) &&
    decision.authority === "PBOS-PRODUCTION-PROVIDER-CERTIFICATION";
  const body: ProductionCertificationProof = {
    certification_reference: decision.certification_id,
    status:
      decisionValid && decision.status === "CERTIFIED"
        ? "CERTIFIED"
        : "BLOCKED",
    authority: "PBOS-CAPABILITY-PRODUCTION-CERTIFICATION",
    evidence_references: decision.provider_record_digests,
    valid_until: validUntil,
    digest: "",
  };
  return { ...body, digest: productionCertificationProofDigest(body) };
}
