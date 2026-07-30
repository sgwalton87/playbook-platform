import { artifactDigest } from "../identity";
import type {
  CapabilityAdmissionDecision,
  CapabilityAdmissionEvidence,
  CapabilityAdmissionProof,
  CapabilityAdmissionRequest,
} from "./types";

export function capabilityAdmissionRequestDigest(
  request: CapabilityAdmissionRequest
): string {
  return artifactDigest({
    schema_version: request.schema_version,
    request_id: request.request_id,
    subject_id: request.subject_id,
    tenant_id: request.tenant_id,
    organization_id: request.organization_id,
    capability_id: request.capability_id,
    engine_id: request.engine_id,
    requested_action: request.requested_action,
    entitlement_reference: request.entitlement_reference,
    policy_reference: request.policy_reference,
    authority_reference: request.authority_reference,
    requested_at: request.requested_at,
  });
}

export function createCapabilityAdmissionRequest(
  content: Omit<CapabilityAdmissionRequest, "content_digest">
): CapabilityAdmissionRequest {
  const request = { ...content, content_digest: "" };
  return {
    ...request,
    content_digest: capabilityAdmissionRequestDigest(request),
  };
}

export function capabilityAdmissionDecisionDigest(
  decision: CapabilityAdmissionDecision
): string {
  return artifactDigest({
    decision_id: decision.decision_id,
    request_id: decision.request_id,
    decision: decision.decision,
    kernel_authority: decision.kernel_authority,
    reason: decision.reason,
    evidence_reference: decision.evidence_reference,
    timestamp: decision.timestamp,
  });
}

export function capabilityAdmissionEvidenceDigest(
  evidence: CapabilityAdmissionEvidence
): string {
  return artifactDigest({
    evidence_id: evidence.evidence_id,
    request_id: evidence.request_id,
    request_digest: evidence.request_digest,
    decision_id: evidence.decision_id,
    decision_digest: evidence.decision_digest,
    subject_id: evidence.subject_id,
    organization_id: evidence.organization_id,
    tenant_id: evidence.tenant_id,
    capability_id: evidence.capability_id,
    capability_digest: evidence.capability_digest,
    engine_id: evidence.engine_id,
    entitlement_reference: evidence.entitlement_reference,
    entitlement_digest: evidence.entitlement_digest,
    policy_reference: evidence.policy_reference,
    policy_outcome: evidence.policy_outcome,
    kernel_decision: evidence.kernel_decision,
    control_plane_revision: evidence.control_plane_revision,
    control_plane_digest: evidence.control_plane_digest,
    source_evidence_ids: evidence.source_evidence_ids,
    timestamp: evidence.timestamp,
  });
}

export function capabilityAdmissionProofDigest(
  proof: CapabilityAdmissionProof
): string {
  return artifactDigest({
    control_plane_revision: proof.control_plane_revision,
    control_plane_digest: proof.control_plane_digest,
    capability: proof.capability,
    entitlement: proof.entitlement,
    issuer: proof.issuer,
    policy: proof.policy,
    active_revocation_ids: proof.active_revocation_ids,
  });
}
