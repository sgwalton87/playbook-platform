import { describe, expect, it } from "vitest";
import {
  capabilityAdmissionDecisionDigest,
  capabilityAdmissionEvidenceDigest,
  type CapabilityAdmissionResult,
} from "../capability-admission";
import type { EngineAdmissionDecision } from "../admission";
import {
  capabilityExecutionBindingDigest,
  executionLifecycleProofDigest,
} from "./identity";
import { KernelCapabilityExecutionBindingGate } from "./gate";
import type {
  CapabilityExecutionBindingContract,
  CapabilityExecutionBindingRequest,
  CapabilityExecutionEvidenceSink,
  ExecutionLifecycleProof,
} from "./types";

const timestamp = "2026-07-29T12:00:00.000Z";

function admission(outcome: "ADMITTED" | "DENIED" = "ADMITTED") {
  const decisionBody = {
    decision_id: "CAPABILITY-ADMISSION-DECISION-001",
    request_id: "CAPABILITY-REQUEST-001",
    decision: outcome,
    kernel_authority: "PBOS-KERNEL-CAPABILITY-ADMISSION",
    reason: outcome === "ADMITTED" ? [] : ["denied"],
    evidence_reference: "CAPABILITY-ADMISSION-EVIDENCE-001",
    timestamp,
    digest: "",
  } as const;
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
    subject_id: "SUBJECT-001",
    organization_id: "ORGANIZATION-001",
    tenant_id: "TENANT-001",
    capability_id: "CAPABILITY-001",
    capability_digest: "b".repeat(64),
    engine_id: "ENGINE-001",
    entitlement_reference: "ENTITLEMENT-001",
    entitlement_digest: "c".repeat(64),
    policy_reference: "POLICY-001",
    policy_outcome: "ALLOW" as const,
    kernel_decision: outcome,
    control_plane_revision: 5,
    control_plane_digest: "d".repeat(64),
    source_evidence_ids: ["EVIDENCE-CAPABILITY"],
    timestamp,
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
      persisted_revision: 6,
    },
  } satisfies CapabilityAdmissionResult;
}

const engineAdmission: EngineAdmissionDecision = {
  request_id: "ENGINE-ADMISSION-001",
  engine_id: "ENGINE-001",
  manifest_digest: "e".repeat(64),
  status: "ADMITTED",
  findings: [],
  decision_digest: "f".repeat(64),
};

function lifecycle(permitted = true): ExecutionLifecycleProof {
  const body: ExecutionLifecycleProof = {
    lifecycle_reference: "EXECUTION-LIFECYCLE-001",
    current_state: "AUTHORIZED",
    requested_transition: "VALIDATION",
    transition_permitted: permitted,
    evidence_references: ["EVIDENCE-LIFECYCLE-001"],
    digest: "",
  };
  return { ...body, digest: executionLifecycleProofDigest(body) };
}

function binding(): CapabilityExecutionBindingContract {
  const body: CapabilityExecutionBindingContract = {
    request_id: "EXECUTION-BINDING-001",
    capability_id: "CAPABILITY-001",
    engine_id: "ENGINE-001",
    execution_type: "GOVERNED_ACTION",
    kernel_admission_reference: "CAPABILITY-ADMISSION-DECISION-001",
    kernel_admission_digest: admission().decision.digest,
    engine_admission_reference: engineAdmission.request_id,
    engine_admission_digest: engineAdmission.decision_digest,
    lifecycle_reference: "EXECUTION-LIFECYCLE-001",
    authorization_reference: "AUTHORIZATION-001",
    authorization_digest: "1".repeat(64),
    evidence_reference: "EVIDENCE-BINDING-001",
    organization_id: "ORGANIZATION-001",
    tenant_id: "TENANT-001",
    created_at: timestamp,
    digest: "",
  };
  return { ...body, digest: capabilityExecutionBindingDigest(body) };
}

function request(
  overrides: Partial<CapabilityExecutionBindingRequest> = {}
): CapabilityExecutionBindingRequest {
  return {
    contract: binding(),
    capability_admission: admission(),
    engine_admission: engineAdmission,
    authorization: {
      authorization_reference: "AUTHORIZATION-001",
      authorization_digest: "1".repeat(64),
      status: "AUTHORIZED",
      valid: true,
      findings: [],
      evidence_references: ["EVIDENCE-AUTHORIZATION-001"],
    },
    lifecycle: lifecycle(),
    available_evidence_references: [
      "EVIDENCE-BINDING-001",
      "CAPABILITY-ADMISSION-EVIDENCE-001",
      "EVIDENCE-AUTHORIZATION-001",
      "EVIDENCE-LIFECYCLE-001",
    ],
    ...overrides,
  };
}

function sink(): CapabilityExecutionEvidenceSink {
  return {
    record(evidence, expectedRevision) {
      return {
        evidence_id: evidence.evidence_id,
        persisted_revision: expectedRevision + 1,
      };
    },
  };
}

describe("PBOS Kernel capability execution binding", () => {
  it("makes a fully governed capability eligible without executing it", () => {
    const result = new KernelCapabilityExecutionBindingGate(sink()).evaluate(
      request()
    );
    expect(result.decision).toMatchObject({
      outcome: "ELIGIBLE",
      findings: [],
      kernel_authority: "PBOS-KERNEL-CAPABILITY-EXECUTION-BINDING",
    });
    expect(result).not.toHaveProperty("execution");
    expect(result).not.toHaveProperty("certification");
  });

  it("blocks invalid admission, authorization, lifecycle, engine, and evidence", () => {
    const gate = new KernelCapabilityExecutionBindingGate(sink());
    const cases: CapabilityExecutionBindingRequest[] = [
      request({ capability_admission: admission("DENIED") }),
      request({
        authorization: {
          ...request().authorization,
          status: "DENIED",
          valid: false,
          findings: ["authorization denied"],
        },
      }),
      request({ lifecycle: lifecycle(false) }),
      request({
        engine_admission: { ...engineAdmission, status: "REJECTED" },
      }),
      request({ available_evidence_references: [] }),
    ];
    for (const value of cases) {
      expect(gate.evaluate(value).decision.outcome).toBe("BLOCKED");
    }
  });

  it("fails closed when evidence cannot be persisted at the current revision", () => {
    const gate = new KernelCapabilityExecutionBindingGate({
      record() {
        throw new Error("Capability control-plane revision conflict.");
      },
    });
    expect(() => gate.evaluate(request())).toThrow(
      "Capability control-plane revision conflict."
    );
  });
});
