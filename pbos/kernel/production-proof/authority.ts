import {
  kernelProductionProofDigest,
  kernelProductionProofIssuanceRequestDigest,
} from "./identity";
import type {
  KernelProductionProof,
  KernelProductionProofIssuanceRequest,
} from "./types";

export class KernelProductionProofAuthority {
  constructor(private readonly authorities: ReadonlySet<string>) {}

  issue(value: KernelProductionProofIssuanceRequest): KernelProductionProof {
    if (
      value.digest !== kernelProductionProofIssuanceRequestDigest(value) ||
      !value.provider_identity ||
      !value.certification_identity ||
      value.certification_status !== "CERTIFIED" ||
      value.certification_digest.length !== 64 ||
      value.evidence_references.length === 0 ||
      !value.evidence_valid ||
      value.review_references.length === 0 ||
      !value.review_approved ||
      !this.authorities.has(value.authority) ||
      Date.parse(value.expiration) <= Date.parse(value.requested_at)
    ) {
      throw new Error("Kernel production proof issuance rejected.");
    }
    const body: KernelProductionProof = {
      proof_id: `KERNEL-PRODUCTION-PROOF-${value.request_id}`,
      provider_identity: value.provider_identity,
      certification_identity: value.certification_identity,
      evidence_references: [...new Set(value.evidence_references)].sort(),
      review_references: [...new Set(value.review_references)].sort(),
      authority: "PBOS-KERNEL-PRODUCTION-PROOF",
      issued_timestamp: value.requested_at,
      expiration: value.expiration,
      digest: "",
    };
    return Object.freeze({
      ...body,
      evidence_references: Object.freeze([...body.evidence_references]),
      review_references: Object.freeze([...body.review_references]),
      digest: kernelProductionProofDigest(body),
    });
  }
}
