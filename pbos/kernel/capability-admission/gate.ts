import {
  requireDigest,
  requireIdentifiers,
  validateAuthorityEnvelope,
  validateIdentityEnvelope,
} from "../contracts";
import type {
  CapabilityAdmissionDecision,
  CapabilityAdmissionEvidence,
  CapabilityAdmissionEvidenceSink,
  CapabilityAdmissionInvocation,
  CapabilityAdmissionOutcome,
  CapabilityAdmissionProof,
  CapabilityAdmissionResult,
  CapabilityAdmissionTruthSource,
} from "./types";
import {
  capabilityAdmissionDecisionDigest,
  capabilityAdmissionEvidenceDigest,
  capabilityAdmissionProofDigest,
} from "./identity";
import { validateCapabilityAdmissionRequest } from "./validator";

function validateProof(
  invocation: CapabilityAdmissionInvocation,
  proof: CapabilityAdmissionProof,
  errors: string[]
): void {
  const { request } = invocation;
  requireDigest(
    errors,
    "capability_proof.control_plane_digest",
    proof.control_plane_digest
  );
  requireDigest(errors, "capability_proof.proof_digest", proof.proof_digest);
  if (proof.proof_digest !== capabilityAdmissionProofDigest(proof)) {
    errors.push("capability admission proof digest does not match content.");
  }
  if (
    !Number.isInteger(proof.control_plane_revision) ||
    proof.control_plane_revision < 0
  ) {
    errors.push("capability control-plane revision is invalid.");
  }
  if (!proof.capability) {
    errors.push("capability is unknown.");
  } else {
    requireDigest(
      errors,
      "capability_proof.capability.content_digest",
      proof.capability.content_digest
    );
    if (proof.capability.id !== request.capability_id) {
      errors.push("capability identity does not match request.");
    }
    if (proof.capability.owning_engine_id !== request.engine_id) {
      errors.push("capability owning engine does not match request.");
    }
    if (
      proof.capability.lifecycle_state !== "AVAILABLE" &&
      proof.capability.lifecycle_state !== "ACTIVATED"
    ) {
      errors.push("capability lifecycle does not permit admission.");
    }
    if (!proof.capability.dependencies_available) {
      errors.push("capability dependency is unavailable.");
    }
    const evidence = new Set(invocation.available_evidence_ids);
    for (const id of proof.capability.evidence_requirement_ids) {
      if (!evidence.has(id)) {
        errors.push(`capability evidence is unavailable: ${id}.`);
      }
    }
    const security = new Set(
      invocation.satisfied_security_requirement_ids
    );
    for (const id of proof.capability.security_requirement_ids) {
      if (!security.has(id)) {
        errors.push(`capability security requirement is unavailable: ${id}.`);
      }
    }
  }
  if (!proof.entitlement) {
    errors.push("entitlement is unavailable.");
  } else {
    requireDigest(
      errors,
      "capability_proof.entitlement.content_digest",
      proof.entitlement.content_digest
    );
    if (
      proof.entitlement.id !== request.entitlement_reference ||
      proof.entitlement.subject_id !== request.subject_id ||
      proof.entitlement.capability_id !== request.capability_id
    ) {
      errors.push("entitlement identity does not match request.");
    }
    if (
      proof.entitlement.organization_id !== request.organization_id ||
      proof.entitlement.tenant_id !== request.tenant_id
    ) {
      errors.push("entitlement organization or tenant does not match request.");
    }
    if (
      proof.entitlement.status !== "ACTIVE" ||
      (proof.entitlement.expires_at !== null &&
        Date.parse(proof.entitlement.expires_at) <=
          Date.parse(request.requested_at))
    ) {
      errors.push("entitlement is expired, suspended, or revoked.");
    }
    if (proof.entitlement.policy_reference !== request.policy_reference) {
      errors.push("entitlement policy does not match request.");
    }
    if (
      !invocation.available_evidence_ids.includes(
        proof.entitlement.evidence_reference
      )
    ) {
      errors.push("entitlement evidence is unavailable.");
    }
  }
  if (
    !proof.issuer ||
    !proof.issuer.trusted ||
    !proof.issuer.capability_allowed
  ) {
    errors.push("entitlement issuer is not trusted for capability.");
  } else if (
    proof.issuer.organization_id !== request.organization_id ||
    proof.issuer.tenant_id !== request.tenant_id ||
    proof.issuer.id !== proof.entitlement?.issuer_id
  ) {
    errors.push("entitlement issuer identity or scope does not match.");
  }
  if (!proof.policy) {
    errors.push("capability policy result is unavailable.");
  } else {
    if (proof.policy.id !== request.policy_reference) {
      errors.push("capability policy identity does not match request.");
    }
    if (proof.policy.outcome !== "ALLOW") {
      errors.push("capability policy does not allow admission.");
    }
    for (const id of proof.policy.evidence_ids) {
      if (!invocation.available_evidence_ids.includes(id)) {
        errors.push(`capability policy evidence is unavailable: ${id}.`);
      }
    }
  }
  if (proof.active_revocation_ids.length > 0) {
    errors.push("capability trust chain contains an active revocation.");
  }
}

function outcome(
  proof: CapabilityAdmissionProof,
  errors: readonly string[]
): CapabilityAdmissionOutcome {
  if (errors.length === 0) return "ADMITTED";
  if (
    proof.capability?.lifecycle_state === "SUSPENDED" ||
    proof.entitlement?.status === "SUSPENDED"
  ) {
    return "SUSPENDED";
  }
  if (
    proof.policy?.outcome === "REQUIRES_REVIEW" &&
    errors.every((error) =>
      error.startsWith("capability policy")
    )
  ) {
    return "REQUIRES_REVIEW";
  }
  return "DENIED";
}

export class KernelCapabilityAdmissionGate {
  constructor(
    private readonly truthSource: CapabilityAdmissionTruthSource,
    private readonly evidenceSink: CapabilityAdmissionEvidenceSink
  ) {}

  admit(invocation: CapabilityAdmissionInvocation): CapabilityAdmissionResult {
    const errors = [
      ...validateCapabilityAdmissionRequest(invocation.request).errors,
      ...validateIdentityEnvelope(invocation.identity).errors,
      ...validateAuthorityEnvelope(invocation.authority).errors,
    ];
    requireIdentifiers(
      errors,
      "admission.available_evidence_ids",
      invocation.available_evidence_ids
    );
    requireIdentifiers(
      errors,
      "admission.satisfied_security_requirement_ids",
      invocation.satisfied_security_requirement_ids
    );
    const { request } = invocation;
    const actor = invocation.identity.actor;
    if (
      actor.id !== request.subject_id ||
      actor.organizationId !== request.organization_id ||
      actor.tenantId !== request.tenant_id
    ) {
      errors.push("subject identity or scope does not match request.");
    }
    if (
      invocation.authority.id !== request.authority_reference ||
      invocation.authority.actorId !== request.subject_id ||
      invocation.authority.subjectId !== request.capability_id ||
      invocation.authority.scope.organizationId !== request.organization_id ||
      invocation.authority.scope.tenantId !== request.tenant_id ||
      !invocation.authority.scope.resourceIds.includes(request.capability_id) ||
      !invocation.authority.scope.operations.includes(request.requested_action)
    ) {
      errors.push("authorization identity or scope does not match request.");
    }
    if (
      Date.parse(invocation.authority.issuedAt) >
        Date.parse(request.requested_at) ||
      (invocation.authority.expiresAt !== null &&
        Date.parse(invocation.authority.expiresAt) <=
          Date.parse(request.requested_at))
    ) {
      errors.push("authorization is not current.");
    }
    if (
      Date.parse(actor.issuedAt) > Date.parse(request.requested_at) ||
      (actor.expiresAt !== null &&
        Date.parse(actor.expiresAt) <= Date.parse(request.requested_at))
    ) {
      errors.push("subject identity is not current.");
    }
    const proof = this.truthSource.resolve(request);
    validateProof(invocation, proof, errors);

    const evidenceReference = `CAPABILITY-ADMISSION-EVIDENCE-${request.request_id}`;
    const decisionBody: CapabilityAdmissionDecision = {
      decision_id: `CAPABILITY-ADMISSION-DECISION-${request.request_id}`,
      request_id: request.request_id,
      decision: outcome(proof, errors),
      kernel_authority: PBOS_KERNEL_CAPABILITY_ADMISSION_AUTHORITY,
      reason: errors,
      evidence_reference: evidenceReference,
      timestamp: request.requested_at,
      digest: "",
    };
    const decision: CapabilityAdmissionDecision = {
      ...decisionBody,
      digest: capabilityAdmissionDecisionDigest(decisionBody),
    };
    const sourceEvidence = [
      ...new Set([
        ...invocation.available_evidence_ids,
        ...proof.active_revocation_ids,
      ]),
    ].sort();
    const evidenceBody: CapabilityAdmissionEvidence = {
      evidence_id: evidenceReference,
      request_id: request.request_id,
      request_digest: request.content_digest,
      decision_id: decision.decision_id,
      decision_digest: decision.digest,
      subject_id: request.subject_id,
      organization_id: request.organization_id,
      tenant_id: request.tenant_id,
      capability_id: request.capability_id,
      capability_digest: proof.capability?.content_digest ?? null,
      engine_id: request.engine_id,
      entitlement_reference: request.entitlement_reference,
      entitlement_digest: proof.entitlement?.content_digest ?? null,
      policy_reference: request.policy_reference,
      policy_outcome: proof.policy?.outcome ?? "UNKNOWN",
      kernel_decision: decision.decision,
      control_plane_revision: proof.control_plane_revision,
      control_plane_digest: proof.control_plane_digest,
      source_evidence_ids: sourceEvidence,
      timestamp: request.requested_at,
      digest: "",
    };
    const evidence: CapabilityAdmissionEvidence = {
      ...evidenceBody,
      digest: capabilityAdmissionEvidenceDigest(evidenceBody),
    };
    const receipt = this.evidenceSink.record(
      decision,
      evidence,
      proof.control_plane_revision
    );
    if (
      receipt.evidence_id !== evidence.evidence_id ||
      receipt.evidence_digest !== evidence.digest ||
      receipt.persisted_revision !== proof.control_plane_revision + 1
    ) {
      throw new Error("Capability admission evidence receipt is invalid.");
    }
    return { decision, evidence, receipt };
  }
}

export const PBOS_KERNEL_CAPABILITY_ADMISSION_AUTHORITY =
  "PBOS-KERNEL-CAPABILITY-ADMISSION";
