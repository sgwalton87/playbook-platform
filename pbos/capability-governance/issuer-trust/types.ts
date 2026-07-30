import type {
  AuthorityEnvelope,
  IdentityEnvelope,
} from "../../kernel/contracts";

export type IssuerVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type IssuerRevocationStatus = "ACTIVE" | "REVOKED";

export interface CapabilityIssuerIdentityContract {
  readonly issuer_id: string;
  readonly identity_reference: string;
  readonly organization_reference: string;
  readonly tenant_reference: string | null;
  readonly credential_reference: string;
  readonly authority_scope: readonly string[];
  readonly allowed_capabilities: readonly string[];
  readonly verification_status: IssuerVerificationStatus;
  readonly credential_expiration: string;
  readonly revocation_status: IssuerRevocationStatus;
  readonly created_at: string;
  readonly updated_at: string;
  readonly digest: string;
}

export interface CredentialValidationEvidence {
  readonly credential_reference: string;
  readonly identity_reference: string;
  readonly validator_identity: string;
  readonly cryptographically_valid: boolean;
  readonly validated_at: string;
  readonly expires_at: string;
  readonly revocation_checked_at: string;
  readonly evidence_reference: string;
  readonly digest: string;
}

export interface IssuerTrustRequest {
  readonly request_id: string;
  readonly issuer: CapabilityIssuerIdentityContract;
  readonly identity: IdentityEnvelope;
  readonly authority: AuthorityEnvelope;
  readonly organization_id: string;
  readonly tenant_id: string | null;
  readonly capability_id: string;
  readonly operation: "entitlement.issue" | "entitlement.modify" | "entitlement.revoke";
  readonly evaluated_at: string;
  readonly digest: string;
}

export type IssuerTrustOutcome = "TRUSTED" | "DENIED";

export interface IssuerTrustDecision {
  readonly decision_id: string;
  readonly request_id: string;
  readonly issuer_id: string;
  readonly capability_id: string;
  readonly organization_id: string;
  readonly tenant_id: string | null;
  readonly operation: IssuerTrustRequest["operation"];
  readonly outcome: IssuerTrustOutcome;
  readonly authority_identity: "PBOS-CAPABILITY-ISSUER-TRUST";
  readonly findings: readonly string[];
  readonly identity_evidence_reference: string;
  readonly credential_evidence_reference: string;
  readonly authority_evidence_reference: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface CredentialVerifier {
  verify(
    contract: CapabilityIssuerIdentityContract,
    evaluatedAt: string
  ): CredentialValidationEvidence;
}
