import {
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../contracts";
import {
  engineActivationDecisionDigest,
  engineActivationRequestDigest,
  engineActivationTrustDigest,
  productionCertificationProofDigest,
} from "./identity";
import type {
  EngineActivationDecision,
  EngineActivationInvocation,
} from "./types";

export class KernelEngineActivationAuthority {
  evaluate(invocation: EngineActivationInvocation): EngineActivationDecision {
    const errors: string[] = [];
    const { request } = invocation;
    requireIdentifier(errors, "activation.request_id", request.request_id);
    requireIdentifier(errors, "activation.engine_id", request.engine_id);
    requireIdentifier(errors, "activation.capability_id", request.capability_id);
    requireIdentifier(errors, "activation.owner", request.owner);
    requireIdentifier(errors, "activation.version", request.version);
    requireIdentifiers(errors, "activation.dependencies", request.dependencies);
    requireIdentifiers(
      errors,
      "activation.security_requirements",
      request.security_requirements
    );
    requireIdentifiers(
      errors,
      "activation.evidence_requirements",
      request.evidence_requirements
    );
    requireIdentifier(
      errors,
      "activation.kernel_admission_reference",
      request.kernel_admission_reference
    );
    requireIdentifier(
      errors,
      "activation.lifecycle_reference",
      request.lifecycle_reference
    );
    requireIdentifier(
      errors,
      "activation.organization_id",
      request.organization_id
    );
    requireIdentifier(
      errors,
      "activation.production_certification_reference",
      request.production_certification_reference
    );
    requireTimestamp(errors, "activation.requested_at", request.requested_at);
    requireDigest(errors, "activation.digest", request.digest);
    if (request.digest !== engineActivationRequestDigest(request)) {
      errors.push("engine activation request digest is invalid.");
    }
    if (
      invocation.trust.digest !== engineActivationTrustDigest(invocation.trust) ||
      !invocation.trust.issuer_trusted ||
      !invocation.trust.entitlement_valid ||
      Date.parse(invocation.trust.valid_until) <= Date.parse(request.requested_at)
    ) {
      errors.push("issuer or entitlement trust is invalid.");
    }
    if (
      invocation.production.digest !==
        productionCertificationProofDigest(invocation.production) ||
      invocation.production.status !== "CERTIFIED" ||
      invocation.production.certification_reference !==
        request.production_certification_reference ||
      invocation.production.authority !==
        "PBOS-CAPABILITY-PRODUCTION-CERTIFICATION" ||
      Date.parse(invocation.production.valid_until) <=
        Date.parse(request.requested_at)
    ) {
      errors.push("production readiness certification is invalid.");
    }
    if (
      invocation.capability_admission.decision.decision !== "ADMITTED" ||
      invocation.capability_admission.decision.decision_id !==
        request.kernel_admission_reference ||
      invocation.capability_admission.evidence.capability_id !==
        request.capability_id ||
      invocation.capability_admission.evidence.engine_id !== request.engine_id ||
      invocation.capability_admission.evidence.organization_id !==
        request.organization_id ||
      invocation.capability_admission.evidence.tenant_id !== request.tenant_id
    ) {
      errors.push("Kernel capability admission does not match activation.");
    }
    if (
      invocation.engine_admission.status !== "ADMITTED" ||
      invocation.engine_admission.engine_id !== request.engine_id
    ) {
      errors.push("Kernel engine admission does not permit activation.");
    }
    if (
      invocation.execution_binding.outcome !== "ELIGIBLE" ||
      invocation.execution_binding.binding_digest.length !== 64
    ) {
      errors.push("execution lifecycle binding does not permit activation.");
    }
    for (const dependency of request.dependencies) {
      if (!invocation.available_dependencies.includes(dependency)) {
        errors.push(`engine activation dependency is unavailable: ${dependency}.`);
      }
    }
    for (const requirement of request.security_requirements) {
      if (!invocation.satisfied_security_requirements.includes(requirement)) {
        errors.push(`engine activation security is unavailable: ${requirement}.`);
      }
    }
    for (const requirement of request.evidence_requirements) {
      if (!invocation.available_evidence_requirements.includes(requirement)) {
        errors.push(`engine activation evidence is unavailable: ${requirement}.`);
      }
    }
    const evidence = [
      ...invocation.trust.evidence_references,
      ...invocation.production.evidence_references,
      invocation.capability_admission.evidence.evidence_id,
      invocation.execution_binding.evidence_reference,
    ];
    const body: EngineActivationDecision = {
      decision_id: `ENGINE-ACTIVATION-${request.request_id}`,
      request_id: request.request_id,
      engine_id: request.engine_id,
      capability_id: request.capability_id,
      decision: errors.length === 0 ? "ACTIVATED" : "BLOCKED",
      authority: "PBOS-KERNEL-ENGINE-ACTIVATION",
      evidence: [...new Set(evidence)].sort(),
      findings: errors,
      timestamp: request.requested_at,
      digest: "",
    };
    return { ...body, digest: engineActivationDecisionDigest(body) };
  }
}
