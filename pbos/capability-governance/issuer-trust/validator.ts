import {
  requireChronology,
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  validateAuthorityEnvelope,
  validateIdentityEnvelope,
} from "../../kernel/contracts";
import {
  credentialValidationEvidenceDigest,
  issuerIdentityContractDigest,
  issuerTrustDecisionDigest,
  issuerTrustRequestDigest,
} from "./identity";
import type {
  CapabilityIssuerIdentityContract,
  CredentialValidationEvidence,
  IssuerTrustDecision,
  IssuerTrustRequest,
} from "./types";

export function validateIssuerIdentityContract(
  contract: CapabilityIssuerIdentityContract
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "issuer.issuer_id", contract.issuer_id);
  requireIdentifier(
    errors,
    "issuer.identity_reference",
    contract.identity_reference
  );
  requireIdentifier(
    errors,
    "issuer.organization_reference",
    contract.organization_reference
  );
  requireIdentifier(
    errors,
    "issuer.credential_reference",
    contract.credential_reference
  );
  requireIdentifiers(errors, "issuer.authority_scope", contract.authority_scope);
  requireIdentifiers(
    errors,
    "issuer.allowed_capabilities",
    contract.allowed_capabilities
  );
  requireTimestamp(
    errors,
    "issuer.credential_expiration",
    contract.credential_expiration
  );
  requireTimestamp(errors, "issuer.created_at", contract.created_at);
  requireTimestamp(errors, "issuer.updated_at", contract.updated_at);
  requireChronology(
    errors,
    "issuer.created_at",
    contract.created_at,
    "issuer.credential_expiration",
    contract.credential_expiration
  );
  requireDigest(errors, "issuer.digest", contract.digest);
  if (contract.digest !== issuerIdentityContractDigest(contract)) {
    errors.push("issuer identity contract digest does not match content.");
  }
  return errors;
}

export function validateCredentialEvidence(
  evidence: CredentialValidationEvidence
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(
    errors,
    "credential.credential_reference",
    evidence.credential_reference
  );
  requireIdentifier(
    errors,
    "credential.identity_reference",
    evidence.identity_reference
  );
  requireIdentifier(
    errors,
    "credential.validator_identity",
    evidence.validator_identity
  );
  requireIdentifier(
    errors,
    "credential.evidence_reference",
    evidence.evidence_reference
  );
  requireTimestamp(errors, "credential.validated_at", evidence.validated_at);
  requireTimestamp(errors, "credential.expires_at", evidence.expires_at);
  requireTimestamp(
    errors,
    "credential.revocation_checked_at",
    evidence.revocation_checked_at
  );
  requireDigest(errors, "credential.digest", evidence.digest);
  if (evidence.digest !== credentialValidationEvidenceDigest(evidence)) {
    errors.push("credential evidence digest does not match content.");
  }
  return errors;
}

export function validateIssuerTrustRequest(
  request: IssuerTrustRequest
): readonly string[] {
  const errors = [
    ...validateIssuerIdentityContract(request.issuer),
    ...validateIdentityEnvelope(request.identity).errors,
    ...validateAuthorityEnvelope(request.authority).errors,
  ];
  requireIdentifier(errors, "trust.request_id", request.request_id);
  requireIdentifier(errors, "trust.organization_id", request.organization_id);
  requireIdentifier(errors, "trust.capability_id", request.capability_id);
  requireTimestamp(errors, "trust.evaluated_at", request.evaluated_at);
  requireDigest(errors, "trust.digest", request.digest);
  if (request.digest !== issuerTrustRequestDigest(request)) {
    errors.push("issuer trust request digest does not match content.");
  }
  return errors;
}

export function validateIssuerTrustDecision(
  decision: IssuerTrustDecision
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "trust.decision_id", decision.decision_id);
  requireIdentifier(errors, "trust.request_id", decision.request_id);
  requireIdentifier(errors, "trust.issuer_id", decision.issuer_id);
  requireIdentifier(errors, "trust.capability_id", decision.capability_id);
  requireIdentifier(errors, "trust.organization_id", decision.organization_id);
  requireIdentifier(
    errors,
    "trust.identity_evidence_reference",
    decision.identity_evidence_reference
  );
  requireIdentifier(
    errors,
    "trust.credential_evidence_reference",
    decision.credential_evidence_reference
  );
  requireIdentifier(
    errors,
    "trust.authority_evidence_reference",
    decision.authority_evidence_reference
  );
  requireTimestamp(errors, "trust.timestamp", decision.timestamp);
  requireDigest(errors, "trust.digest", decision.digest);
  if (decision.digest !== issuerTrustDecisionDigest(decision)) {
    errors.push("issuer trust decision digest does not match content.");
  }
  return errors;
}
