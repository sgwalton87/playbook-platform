export interface KernelProductionProofIssuanceRequest {
  readonly request_id: string;
  readonly provider_identity: string;
  readonly certification_identity: string;
  readonly certification_status: "CERTIFIED" | "CONDITIONAL" | "BLOCKED" | "REVOKED";
  readonly certification_digest: string;
  readonly evidence_references: readonly string[];
  readonly evidence_valid: boolean;
  readonly review_references: readonly string[];
  readonly review_approved: boolean;
  readonly authority: string;
  readonly requested_at: string;
  readonly expiration: string;
  readonly digest: string;
}

export interface KernelProductionProof {
  readonly proof_id: string;
  readonly provider_identity: string;
  readonly certification_identity: string;
  readonly evidence_references: readonly string[];
  readonly review_references: readonly string[];
  readonly authority: "PBOS-KERNEL-PRODUCTION-PROOF";
  readonly issued_timestamp: string;
  readonly expiration: string;
  readonly digest: string;
}
