import type {
  CapabilityAdmissionDecision,
  CapabilityAdmissionEvidence,
  CapabilityAdmissionEvidenceReceipt,
  CapabilityAdmissionEvidenceSink,
  CapabilityAdmissionProof,
  CapabilityAdmissionRequest,
  CapabilityAdmissionTruthSource,
} from "../kernel/capability-admission";
import { capabilityAdmissionProofDigest } from "../kernel/capability-admission";
import { artifactDigest, canonicalJson } from "../kernel/identity";
import {
  createCapabilityActivationDecisionRecord,
  createCapabilityGovernanceEvidenceRecord,
  type CapabilityControlPlaneState,
  type CapabilityIssuerRecord,
  type CapabilityRegistryRecord,
  type DurableCapabilityControlPlane,
  type PersistentEntitlementRecord,
} from "./persistence";

export interface CapabilityAdmissionPolicyProof {
  readonly id: string;
  readonly outcome: "ALLOW" | "DENY" | "REQUIRES_REVIEW";
  readonly evidence_ids: readonly string[];
}

export interface CapabilityAdmissionPolicySource {
  resolve(
    policyId: string,
    capabilityId: string,
    capabilityDigest: string,
    subjectId: string,
    evaluatedAt: string
  ): CapabilityAdmissionPolicyProof | null;
}

function latestById<T>(
  records: readonly T[],
  id: (record: T) => string,
  revision: (record: T) => number
): Map<string, T> {
  const latest = new Map<string, T>();
  for (const record of records) {
    const key = id(record);
    const current = latest.get(key);
    if (!current || revision(record) > revision(current)) {
      latest.set(key, record);
    }
  }
  return latest;
}

function activeRevocations(
  state: CapabilityControlPlaneState,
  request: CapabilityAdmissionRequest,
  entitlement: PersistentEntitlementRecord | null
): readonly string[] {
  const at = Date.parse(request.requested_at);
  return state.revocations
    .filter(
      (revocation) =>
        Date.parse(revocation.revoked_at) <= at &&
        ((revocation.target_type === "CAPABILITY" &&
          revocation.target_id === request.capability_id) ||
          (revocation.target_type === "ORGANIZATION" &&
            revocation.target_id === request.organization_id) ||
          (revocation.target_type === "ENTITLEMENT" &&
            revocation.target_id === request.entitlement_reference) ||
          (revocation.target_type === "ISSUER" &&
            revocation.target_id === entitlement?.issuer_id))
    )
    .map(({ revocation_id: id }) => id)
    .sort();
}

function capabilityProof(
  capability: CapabilityRegistryRecord | null,
  capabilities: ReadonlyMap<string, CapabilityRegistryRecord>
): CapabilityAdmissionProof["capability"] {
  if (!capability) return null;
  const state =
    capability.lifecycle_state === "AVAILABLE" ||
    capability.lifecycle_state === "ACTIVATED" ||
    capability.lifecycle_state === "SUSPENDED" ||
    capability.lifecycle_state === "DEPRECATED" ||
    capability.lifecycle_state === "RETIRED"
      ? capability.lifecycle_state
      : "UNKNOWN";
  return {
    id: capability.capability_id,
    content_digest: capability.content_digest,
    owner_id: capability.owner_identity,
    owning_engine_id: capability.owning_engine,
    lifecycle_state: state,
    evidence_requirement_ids: [...capability.evidence_requirements],
    security_requirement_ids: [...capability.security_requirements],
    dependencies_available: capability.dependencies.every((id) => {
      const dependency = capabilities.get(id);
      return (
        dependency?.lifecycle_state === "AVAILABLE" ||
        dependency?.lifecycle_state === "ACTIVATED"
      );
    }),
  };
}

function entitlementProof(
  entitlement: PersistentEntitlementRecord | null
): CapabilityAdmissionProof["entitlement"] {
  return entitlement
    ? {
        id: entitlement.entitlement_id,
        content_digest: entitlement.content_digest,
        subject_id: entitlement.subject_id,
        capability_id: entitlement.capability_id,
        issuer_id: entitlement.issuer_id,
        organization_id: entitlement.organization_id,
        tenant_id: entitlement.tenant_id,
        status: entitlement.status,
        expires_at: entitlement.expires_at,
        policy_reference: entitlement.policy_reference,
        evidence_reference: entitlement.evidence_reference,
      }
    : null;
}

function issuerProof(
  issuer: CapabilityIssuerRecord | null,
  request: CapabilityAdmissionRequest
): CapabilityAdmissionProof["issuer"] {
  if (!issuer) return null;
  const at = Date.parse(request.requested_at);
  return {
    id: issuer.issuer_id,
    organization_id: issuer.organization,
    tenant_id: issuer.tenant_id,
    trusted:
      issuer.verification_status === "VERIFIED" &&
      issuer.lifecycle_state === "ACTIVE" &&
      Date.parse(issuer.valid_from) <= at &&
      (issuer.expires_at === null || Date.parse(issuer.expires_at) > at),
    capability_allowed:
      issuer.authority_scope.includes("entitlement.issue") &&
      issuer.allowed_capabilities.includes(request.capability_id),
  };
}

export class DurableCapabilityKernelAdmissionAdapter
  implements CapabilityAdmissionTruthSource, CapabilityAdmissionEvidenceSink
{
  constructor(
    private readonly controlPlane: DurableCapabilityControlPlane,
    private readonly policySource: CapabilityAdmissionPolicySource
  ) {}

  resolve(request: CapabilityAdmissionRequest): CapabilityAdmissionProof {
    const state = this.controlPlane.state();
    const capabilities = latestById(
      state.capabilities,
      ({ capability_id: id }) => id,
      ({ record_revision: revision }) => revision
    );
    const entitlements = latestById(
      state.entitlements,
      ({ entitlement_id: id }) => id,
      ({ record_revision: revision }) => revision
    );
    const issuers = latestById(
      state.issuers,
      ({ issuer_id: id }) => id,
      ({ record_revision: revision }) => revision
    );
    const capability = capabilities.get(request.capability_id) ?? null;
    const entitlement =
      entitlements.get(request.entitlement_reference) ?? null;
    const issuer = entitlement
      ? issuers.get(entitlement.issuer_id) ?? null
      : null;
    const policy = capability
      ? this.policySource.resolve(
          request.policy_reference,
          request.capability_id,
          capability.content_digest,
          request.subject_id,
          request.requested_at
        )
      : null;
    const proof: CapabilityAdmissionProof = {
      proof_digest: "",
      control_plane_revision: state.revision,
      control_plane_digest: state.state_digest,
      capability: capabilityProof(capability, capabilities),
      entitlement: entitlementProof(entitlement),
      issuer: issuerProof(issuer, request),
      policy,
      active_revocation_ids: activeRevocations(
        state,
        request,
        entitlement
      ),
    };
    return { ...proof, proof_digest: capabilityAdmissionProofDigest(proof) };
  }

  record(
    decision: CapabilityAdmissionDecision,
    evidence: CapabilityAdmissionEvidence,
    expectedRevision: number
  ): CapabilityAdmissionEvidenceReceipt {
    const payload = canonicalJson({ decision, evidence });
    const governanceEvidence = createCapabilityGovernanceEvidenceRecord({
      evidence_id: evidence.evidence_id,
      subject_id: decision.decision_id,
      event_id: decision.decision_id,
      authority_id: decision.kernel_authority,
      source_evidence_ids: [
        ...new Set([
          evidence.request_digest,
          decision.digest,
          evidence.digest,
          ...evidence.source_evidence_ids,
        ]),
      ],
      payload,
      payload_digest: artifactDigest(payload),
      recorded_at: evidence.timestamp,
    });
    const activationDecision = createCapabilityActivationDecisionRecord({
      decision_id: decision.decision_id,
      subject: evidence.subject_id,
      organization_id: evidence.organization_id,
      tenant_id: evidence.tenant_id,
      capability: evidence.capability_id,
      capability_digest:
        evidence.capability_digest ?? evidence.request_digest,
      entitlement_reference: evidence.entitlement_reference,
      policy_result: evidence.policy_outcome,
      authority_result:
        decision.decision === "ADMITTED"
          ? "KERNEL_ADMISSION_VALID"
          : "KERNEL_ADMISSION_REJECTED",
      kernel_reference: decision.kernel_authority,
      decision:
        decision.decision === "ADMITTED"
          ? "ALLOW"
          : decision.decision === "DENIED"
            ? "DENY"
            : decision.decision === "SUSPENDED"
              ? "SUSPEND"
              : "REQUIRES_REVIEW",
      timestamp: evidence.timestamp,
      evidence_digest: governanceEvidence.content_digest,
    });
    const state = this.controlPlane.recordActivationDecision({
      record: activationDecision,
      evidence: governanceEvidence,
      authority_id: decision.kernel_authority,
      expected_revision: expectedRevision,
    });
    return {
      evidence_id: evidence.evidence_id,
      evidence_digest: evidence.digest,
      persisted_revision: state.revision,
    };
  }
}
