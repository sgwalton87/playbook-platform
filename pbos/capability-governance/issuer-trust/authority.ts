import {
  credentialValidationEvidenceDigest,
  issuerTrustDecisionDigest,
} from "./identity";
import type {
  CredentialVerifier,
  IssuerTrustDecision,
  IssuerTrustRequest,
} from "./types";
import {
  validateCredentialEvidence,
  validateIssuerTrustRequest,
} from "./validator";

export class CapabilityIssuerTrustAuthority {
  constructor(private readonly credentialVerifier: CredentialVerifier) {}

  evaluate(request: IssuerTrustRequest): IssuerTrustDecision {
    const findings = [...validateIssuerTrustRequest(request)];
    const credential = this.credentialVerifier.verify(
      request.issuer,
      request.evaluated_at
    );
    findings.push(...validateCredentialEvidence(credential));
    const actor = request.identity.actor;
    if (
      actor.id !== request.issuer.identity_reference ||
      actor.id !== request.authority.actorId ||
      actor.organizationId !== request.organization_id ||
      actor.tenantId !== request.tenant_id
    ) {
      findings.push("issuer identity or organization scope does not match.");
    }
    if (
      request.issuer.organization_reference !== request.organization_id ||
      request.issuer.tenant_reference !== request.tenant_id ||
      request.authority.scope.organizationId !== request.organization_id ||
      request.authority.scope.tenantId !== request.tenant_id
    ) {
      findings.push("issuer organization or tenant authority does not match.");
    }
    if (
      request.authority.subjectId !== request.issuer.issuer_id ||
      !request.authority.scope.resourceIds.includes(request.capability_id) ||
      !request.authority.scope.operations.includes(request.operation) ||
      !request.issuer.authority_scope.includes(request.operation) ||
      !request.issuer.allowed_capabilities.includes(request.capability_id)
    ) {
      findings.push("issuer authority does not permit the capability action.");
    }
    if (
      request.issuer.verification_status !== "VERIFIED" ||
      request.issuer.revocation_status !== "ACTIVE"
    ) {
      findings.push("issuer identity is not verified and active.");
    }
    if (
      credential.credential_reference !==
        request.issuer.credential_reference ||
      credential.identity_reference !== request.issuer.identity_reference ||
      !credential.cryptographically_valid ||
      credential.digest !== credentialValidationEvidenceDigest(credential) ||
      Date.parse(credential.expires_at) <= Date.parse(request.evaluated_at) ||
      Date.parse(request.issuer.credential_expiration) <=
        Date.parse(request.evaluated_at)
    ) {
      findings.push("issuer credential is invalid, mismatched, or expired.");
    }
    const body: IssuerTrustDecision = {
      decision_id: `ISSUER-TRUST-${request.request_id}`,
      request_id: request.request_id,
      issuer_id: request.issuer.issuer_id,
      capability_id: request.capability_id,
      organization_id: request.organization_id,
      tenant_id: request.tenant_id,
      operation: request.operation,
      outcome: findings.length === 0 ? "TRUSTED" : "DENIED",
      authority_identity: "PBOS-CAPABILITY-ISSUER-TRUST",
      findings,
      identity_evidence_reference: request.identity.actor.id,
      credential_evidence_reference: credential.evidence_reference,
      authority_evidence_reference: request.authority.id,
      timestamp: request.evaluated_at,
      digest: "",
    };
    return { ...body, digest: issuerTrustDecisionDigest(body) };
  }
}
