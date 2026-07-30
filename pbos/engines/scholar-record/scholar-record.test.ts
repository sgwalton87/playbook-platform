import { describe, expect, it } from "vitest";
import type {
  AuthorityEnvelope,
  IdentityEnvelope,
} from "../../kernel/contracts";
import {
  engineActivationDecisionDigest,
  type EngineActivationDecision,
} from "../../kernel/engine-activation";
import { ScholarRecordEngine } from "./engine";
import {
  scholarRecordDigest,
  scholarRecordActivationContractDigest,
  scholarRecordEntryDigest,
  scholarRecordMutationDigest,
} from "./identity";
import { validateScholarRecordActivationContract } from "./activation";
import type {
  ScholarRecord,
  ScholarRecordActivationContract,
  ScholarRecordEntry,
  ScholarRecordMutation,
} from "./types";

const now = "2026-07-30T12:00:00.000Z";
const later = "2026-07-30T12:10:00.000Z";

function record(): ScholarRecord {
  const body: ScholarRecord = {
    record_id: "SCHOLAR-RECORD-001",
    scholar_identity: "SCHOLAR-001",
    owner_identity: "SCHOLAR-001",
    organization_id: "ORGANIZATION-001",
    tenant_id: "TENANT-001",
    revision: 0,
    entries: [],
    history: [],
    created_at: now,
    updated_at: now,
    digest: "",
  };
  return { ...body, digest: scholarRecordDigest(body) };
}

function entry(humanConfirmed = true): ScholarRecordEntry {
  const body: ScholarRecordEntry = {
    entry_id: "GOAL-001",
    domain: "GOAL",
    label: "Education goal",
    value: "Complete an undergraduate degree.",
    source: "HUMAN",
    owner_identity: "SCHOLAR-001",
    evidence_references: ["EVIDENCE-GOAL-001"],
    human_confirmed: humanConfirmed,
    recorded_at: later,
    digest: "",
  };
  return { ...body, digest: scholarRecordEntryDigest(body) };
}

function identity(tenantId = "TENANT-001"): IdentityEnvelope {
  return {
    version: "1.0.0",
    actor: {
      id: "SCHOLAR-001",
      kind: "HUMAN",
      issuer: "PBOS-IDENTITY",
      verificationStatus: "VERIFIED",
      ownerId: "SCHOLAR-001",
      organizationId: "ORGANIZATION-001",
      tenantId,
      lifecycleState: "ACTIVE",
      issuedAt: now,
      verifiedAt: now,
      expiresAt: "2027-07-30T00:00:00.000Z",
    },
    organization: null,
    tenant: null,
    service: null,
    partner: null,
  };
}

function authority(tenantId = "TENANT-001"): AuthorityEnvelope {
  return {
    version: "1.0.0",
    id: "AUTHORITY-SCHOLAR-WRITE-001",
    actorId: "SCHOLAR-001",
    subjectId: "SCHOLAR-RECORD-001",
    ownerId: "SCHOLAR-001",
    delegationIds: [],
    permissionIds: ["PERMISSION-SCHOLAR-WRITE"],
    approvalIds: ["APPROVAL-SCHOLAR-001"],
    policyDecisionIds: ["POLICY-SCHOLAR-WRITE"],
    administrativeAuthorityId: null,
    scope: {
      organizationId: "ORGANIZATION-001",
      tenantId,
      environmentId: "PRODUCTION",
      region: "GLOBAL",
      resourceIds: ["SCHOLAR-RECORD-001"],
      operations: ["scholar-record.write"],
    },
    status: "AUTHORIZED",
    issuedAt: now,
    expiresAt: "2027-07-30T00:00:00.000Z",
  };
}

function activation(
  decision: EngineActivationDecision["decision"] = "ACTIVATED"
): EngineActivationDecision {
  const body: EngineActivationDecision = {
    decision_id: "ENGINE-ACTIVATION-001",
    request_id: "ACTIVATION-REQUEST-001",
    engine_id: "PBOS-ENGINE-SCHOLAR-RECORD",
    capability_id: "CAPABILITY-SCHOLAR-RECORD",
    decision,
    authority: "PBOS-KERNEL-ENGINE-ACTIVATION",
    evidence: ["EVIDENCE-ACTIVATION-001"],
    findings: decision === "ACTIVATED" ? [] : ["blocked"],
    timestamp: now,
    digest: "",
  };
  return { ...body, digest: engineActivationDecisionDigest(body) };
}

function mutation(
  overrides: Partial<ScholarRecordMutation> = {}
): ScholarRecordMutation {
  const body: ScholarRecordMutation = {
    mutation_id: "MUTATION-001",
    record_id: "SCHOLAR-RECORD-001",
    expected_revision: 0,
    entry: entry(),
    identity: identity(),
    authority: authority(),
    activation: activation(),
    timestamp: later,
    digest: "",
    ...overrides,
  };
  return { ...body, digest: scholarRecordMutationDigest(body) };
}

describe("PBOS Scholar Record foundation engine", () => {
  it("preserves a human-confirmed evidence-backed immutable revision", () => {
    const next = new ScholarRecordEngine().apply(record(), mutation());
    expect(next).toMatchObject({ revision: 1 });
    expect(next.entries).toHaveLength(1);
    expect(next.history[0]).toMatchObject({
      previous_record_digest: record().digest,
      actor_identity: "SCHOLAR-001",
    });
  });

  it("rejects inactive engine, inferred facts, and cross-tenant authority", () => {
    const engine = new ScholarRecordEngine();
    expect(() =>
      engine.apply(record(), mutation({ activation: activation("BLOCKED") }))
    ).toThrow("engine is not activated");
    expect(() =>
      engine.apply(record(), mutation({ entry: entry(false) }))
    ).toThrow("require human control and evidence");
    expect(() =>
      engine.apply(
        record(),
        mutation({
          identity: identity("TENANT-OTHER"),
          authority: authority("TENANT-OTHER"),
        })
      )
    ).toThrow("identity or authority scope is invalid");
  });

  it("binds activation contracts to Kernel authority and evidence", () => {
    const activationDecision = activation();
    const body: ScholarRecordActivationContract = {
      contract_id: "SCHOLAR-ACTIVATION-CONTRACT-001",
      engine_id: "PBOS-ENGINE-SCHOLAR-RECORD",
      scholar_identity: "SCHOLAR-001",
      capability_reference: "CAPABILITY-SCHOLAR-RECORD",
      provider_reference: "PROVIDER-001",
      kernel_activation_reference: activationDecision.decision_id,
      evidence_reference: "EVIDENCE-ACTIVATION-001",
      lifecycle_state: "ACTIVATED",
      activation: activationDecision,
      timestamp: now,
      digest: "",
    };
    const contract = {
      ...body,
      digest: scholarRecordActivationContractDigest(body),
    };
    expect(validateScholarRecordActivationContract(contract)).toEqual([]);
    expect(
      validateScholarRecordActivationContract({
        ...contract,
        provider_reference: "PROVIDER-TAMPERED",
      })
    ).toContain("Scholar Record activation contract digest is invalid.");
  });
});
