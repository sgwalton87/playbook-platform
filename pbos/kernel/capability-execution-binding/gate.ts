import {
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../contracts";
import {
  capabilityExecutionBindingDigest,
  capabilityExecutionDecisionDigest,
  capabilityExecutionEvidenceDigest,
  executionLifecycleProofDigest,
} from "./identity";
import type {
  CapabilityExecutionBindingDecision,
  CapabilityExecutionBindingEvidence,
  CapabilityExecutionBindingRequest,
  CapabilityExecutionEvidenceSink,
} from "./types";

export class KernelCapabilityExecutionBindingGate {
  constructor(private readonly evidenceSink: CapabilityExecutionEvidenceSink) {}

  evaluate(request: CapabilityExecutionBindingRequest): {
    readonly decision: CapabilityExecutionBindingDecision;
    readonly evidence: CapabilityExecutionBindingEvidence;
  } {
    const errors: string[] = [];
    const { contract } = request;
    requireIdentifier(errors, "binding.request_id", contract.request_id);
    requireIdentifier(errors, "binding.capability_id", contract.capability_id);
    requireIdentifier(errors, "binding.engine_id", contract.engine_id);
    requireIdentifier(errors, "binding.execution_type", contract.execution_type);
    requireIdentifier(
      errors,
      "binding.kernel_admission_reference",
      contract.kernel_admission_reference
    );
    requireDigest(
      errors,
      "binding.kernel_admission_digest",
      contract.kernel_admission_digest
    );
    requireIdentifier(
      errors,
      "binding.engine_admission_reference",
      contract.engine_admission_reference
    );
    requireDigest(
      errors,
      "binding.engine_admission_digest",
      contract.engine_admission_digest
    );
    requireIdentifier(
      errors,
      "binding.lifecycle_reference",
      contract.lifecycle_reference
    );
    requireIdentifier(
      errors,
      "binding.authorization_reference",
      contract.authorization_reference
    );
    requireDigest(
      errors,
      "binding.authorization_digest",
      contract.authorization_digest
    );
    requireIdentifier(
      errors,
      "binding.evidence_reference",
      contract.evidence_reference
    );
    requireIdentifier(
      errors,
      "binding.organization_id",
      contract.organization_id
    );
    requireTimestamp(errors, "binding.created_at", contract.created_at);
    requireDigest(errors, "binding.digest", contract.digest);
    requireIdentifiers(
      errors,
      "binding.available_evidence_references",
      request.available_evidence_references
    );
    if (contract.digest !== capabilityExecutionBindingDigest(contract)) {
      errors.push("capability execution binding digest does not match content.");
    }
    const admission = request.capability_admission;
    if (
      admission.decision.decision !== "ADMITTED" ||
      admission.decision.decision_id !== contract.kernel_admission_reference ||
      admission.decision.digest !== contract.kernel_admission_digest ||
      admission.evidence.capability_id !== contract.capability_id ||
      admission.evidence.engine_id !== contract.engine_id ||
      admission.evidence.organization_id !== contract.organization_id ||
      admission.evidence.tenant_id !== contract.tenant_id
    ) {
      errors.push("current Kernel capability admission is invalid.");
    }
    if (
      request.engine_admission.status !== "ADMITTED" ||
      request.engine_admission.request_id !==
        contract.engine_admission_reference ||
      request.engine_admission.decision_digest !==
        contract.engine_admission_digest ||
      request.engine_admission.engine_id !== contract.engine_id
    ) {
      errors.push("current Kernel engine admission is invalid.");
    }
    if (
      !request.authorization.valid ||
      request.authorization.status !== "AUTHORIZED" ||
      request.authorization.authorization_reference !==
        contract.authorization_reference ||
      request.authorization.authorization_digest !==
        contract.authorization_digest
    ) {
      errors.push("execution authorization is invalid or no longer current.");
    }
    errors.push(...request.authorization.findings);
    if (
      request.lifecycle.lifecycle_reference !== contract.lifecycle_reference ||
      request.lifecycle.digest !==
        executionLifecycleProofDigest(request.lifecycle) ||
      !request.lifecycle.transition_permitted
    ) {
      errors.push("execution lifecycle transition is not permitted.");
    }
    const requiredEvidence = [
      contract.evidence_reference,
      admission.evidence.evidence_id,
      ...request.authorization.evidence_references,
      ...request.lifecycle.evidence_references,
    ];
    for (const reference of requiredEvidence) {
      if (!request.available_evidence_references.includes(reference)) {
        errors.push(`execution binding evidence is unavailable: ${reference}.`);
      }
    }
    const decisionBody: CapabilityExecutionBindingDecision = {
      decision_id: `CAPABILITY-EXECUTION-DECISION-${contract.request_id}`,
      binding_digest: contract.digest,
      outcome: errors.length === 0 ? "ELIGIBLE" : "BLOCKED",
      kernel_authority: "PBOS-KERNEL-CAPABILITY-EXECUTION-BINDING",
      findings: errors,
      evidence_reference: `CAPABILITY-EXECUTION-EVIDENCE-${contract.request_id}`,
      timestamp: contract.created_at,
      digest: "",
    };
    const decision = {
      ...decisionBody,
      digest: capabilityExecutionDecisionDigest(decisionBody),
    };
    const evidenceBody: CapabilityExecutionBindingEvidence = {
      evidence_id: decision.evidence_reference,
      contract,
      decision,
      source_evidence_references: [...new Set(requiredEvidence)].sort(),
      digest: "",
    };
    const evidence = {
      ...evidenceBody,
      digest: capabilityExecutionEvidenceDigest(evidenceBody),
    };
    const expectedRevision =
      request.capability_admission.evidence.control_plane_revision + 1;
    const receipt = this.evidenceSink.record(evidence, expectedRevision);
    if (
      receipt.evidence_id !== evidence.evidence_id ||
      receipt.persisted_revision !== expectedRevision + 1
    ) {
      throw new Error("Capability execution evidence receipt is invalid.");
    }
    return { decision, evidence };
  }
}
