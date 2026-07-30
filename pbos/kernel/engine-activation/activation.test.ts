import { describe, expect, it } from "vitest";
import {
  capabilityAdmissionDecisionDigest,
  capabilityAdmissionEvidenceDigest,
  type CapabilityAdmissionResult,
} from "../capability-admission";
import type { EngineAdmissionDecision } from "../admission";
import type { CapabilityExecutionBindingDecision } from "../capability-execution-binding";
import {
  engineActivationRequestDigest,
  engineActivationTrustDigest,
  productionCertificationProofDigest,
} from "./identity";
import { KernelEngineActivationAuthority } from "./authority";
import type {
  EngineActivationInvocation,
  EngineActivationRequest,
  EngineActivationTrustProof,
  ProductionCertificationProof,
} from "./types";

const now = "2026-07-30T12:00:00.000Z";
const later = "2026-07-30T13:00:00.000Z";

function capabilityAdmission(): CapabilityAdmissionResult {
  const decisionBody = {
    decision_id: "CAPABILITY-ADMISSION-001",
    request_id: "CAPABILITY-REQUEST-001",
    decision: "ADMITTED" as const,
    kernel_authority: "PBOS-KERNEL-CAPABILITY-ADMISSION",
    reason: [],
    evidence_reference: "CAPABILITY-EVIDENCE-001",
    timestamp: now,
    digest: "",
  };
  const decision = {
    ...decisionBody,
    digest: capabilityAdmissionDecisionDigest(decisionBody),
  };
  const evidenceBody = {
    evidence_id: decision.evidence_reference,
    request_id: decision.request_id,
    request_digest: "a".repeat(64),
    decision_id: decision.decision_id,
    decision_digest: decision.digest,
    subject_id: "SCHOLAR-001",
    organization_id: "ORGANIZATION-001",
    tenant_id: "TENANT-001",
    capability_id: "CAPABILITY-SCHOLAR-RECORD",
    capability_digest: "b".repeat(64),
    engine_id: "PBOS-ENGINE-SCHOLAR-RECORD",
    entitlement_reference: "ENTITLEMENT-001",
    entitlement_digest: "c".repeat(64),
    policy_reference: "POLICY-001",
    policy_outcome: "ALLOW" as const,
    kernel_decision: "ADMITTED" as const,
    control_plane_revision: 1,
    control_plane_digest: "d".repeat(64),
    source_evidence_ids: ["EVIDENCE-001"],
    timestamp: now,
    digest: "",
  };
  const evidence = {
    ...evidenceBody,
    digest: capabilityAdmissionEvidenceDigest(evidenceBody),
  };
  return {
    decision,
    evidence,
    receipt: {
      evidence_id: evidence.evidence_id,
      evidence_digest: evidence.digest,
      persisted_revision: 2,
    },
  };
}

function request(): EngineActivationRequest {
  const body: EngineActivationRequest = {
    request_id: "ACTIVATION-REQUEST-001",
    engine_id: "PBOS-ENGINE-SCHOLAR-RECORD",
    capability_id: "CAPABILITY-SCHOLAR-RECORD",
    owner: "PLAYBOOK-SCHOLAR-RECORD-OWNER",
    version: "1.0.0",
    dependencies: ["PBOS-KERNEL"],
    security_requirements: ["TENANT-ISOLATION"],
    evidence_requirements: ["SCHOLAR-RECORD-EVIDENCE"],
    kernel_admission_reference: "CAPABILITY-ADMISSION-001",
    lifecycle_reference: "LIFECYCLE-SCHOLAR-RECORD-001",
    organization_id: "ORGANIZATION-001",
    tenant_id: "TENANT-001",
    production_certification_reference: "PRODUCTION-CERTIFICATION-001",
    requested_at: now,
    digest: "",
  };
  return { ...body, digest: engineActivationRequestDigest(body) };
}

function trust(): EngineActivationTrustProof {
  const body: EngineActivationTrustProof = {
    issuer_trusted: true,
    entitlement_valid: true,
    issuer_decision_reference: "ISSUER-TRUST-001",
    entitlement_reference: "ENTITLEMENT-001",
    evidence_references: ["EVIDENCE-TRUST-001"],
    valid_until: later,
    digest: "",
  };
  return { ...body, digest: engineActivationTrustDigest(body) };
}

function production(
  status: ProductionCertificationProof["status"] = "CERTIFIED"
): ProductionCertificationProof {
  const body: ProductionCertificationProof = {
    certification_reference: "PRODUCTION-CERTIFICATION-001",
    status,
    authority: "PBOS-CAPABILITY-PRODUCTION-CERTIFICATION",
    evidence_references: ["EVIDENCE-PRODUCTION-001"],
    valid_until: later,
    digest: "",
  };
  return { ...body, digest: productionCertificationProofDigest(body) };
}

const engineAdmission: EngineAdmissionDecision = {
  request_id: "ENGINE-ADMISSION-001",
  engine_id: "PBOS-ENGINE-SCHOLAR-RECORD",
  manifest_digest: "e".repeat(64),
  status: "ADMITTED",
  findings: [],
  decision_digest: "f".repeat(64),
};

const binding: CapabilityExecutionBindingDecision = {
  decision_id: "EXECUTION-BINDING-001",
  binding_digest: "1".repeat(64),
  outcome: "ELIGIBLE",
  kernel_authority: "PBOS-KERNEL-CAPABILITY-EXECUTION-BINDING",
  findings: [],
  evidence_reference: "EVIDENCE-BINDING-001",
  timestamp: now,
  digest: "2".repeat(64),
};

function invocation(
  overrides: Partial<EngineActivationInvocation> = {}
): EngineActivationInvocation {
  return {
    request: request(),
    trust: trust(),
    production: production(),
    capability_admission: capabilityAdmission(),
    engine_admission: engineAdmission,
    execution_binding: binding,
    available_dependencies: ["PBOS-KERNEL"],
    satisfied_security_requirements: ["TENANT-ISOLATION"],
    available_evidence_requirements: ["SCHOLAR-RECORD-EVIDENCE"],
    ...overrides,
  };
}

describe("PBOS Kernel engine activation authority", () => {
  it("activates only a completely governed hypothetical request", () => {
    expect(
      new KernelEngineActivationAuthority().evaluate(invocation())
    ).toMatchObject({ decision: "ACTIVATED", findings: [] });
  });

  it("blocks absent production certification and missing controls", () => {
    const authority = new KernelEngineActivationAuthority();
    expect(
      authority.evaluate(
        invocation({ production: production("BLOCKED") })
      ).decision
    ).toBe("BLOCKED");
    expect(
      authority.evaluate(
        invocation({
          available_dependencies: [],
          satisfied_security_requirements: [],
          available_evidence_requirements: [],
        })
      ).decision
    ).toBe("BLOCKED");
  });

  it("blocks expired, tampered, and unauthorized activation inputs", () => {
    const authority = new KernelEngineActivationAuthority();
    const expiredBody: ProductionCertificationProof = {
      ...production(),
      valid_until: now,
      digest: "",
    };
    const expired = {
      ...expiredBody,
      digest: productionCertificationProofDigest(expiredBody),
    };
    expect(
      authority.evaluate(invocation({ production: expired })).decision
    ).toBe("BLOCKED");
    expect(
      authority.evaluate(
        invocation({
          production: {
            ...production(),
            evidence_references: ["TAMPERED-EVIDENCE"],
          },
        })
      ).decision
    ).toBe("BLOCKED");
    expect(
      authority.evaluate({
        ...invocation(),
        engine_admission: { ...engineAdmission, status: "REJECTED" },
      }).decision
    ).toBe("BLOCKED");
  });
});
