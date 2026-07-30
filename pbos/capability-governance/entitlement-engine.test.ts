import { describe, expect, it } from "vitest";
import { artifactDigest } from "../kernel/identity";
import type {
  AuthorityEnvelope,
  IdentityEnvelope,
} from "../kernel/contracts";
import type { EngineAdmissionDecision } from "../kernel/admission";
import {
  CapabilityDecisionEvidenceRecorder,
  CapabilityPolicyRegistry,
  CapabilityRegistry,
  EntitlementEngine,
  EntitlementRegistry,
  createCapabilityDefinition,
  createCapabilityPolicy,
  createEntitlementRecord,
  type CapabilityActivationRequest,
  type CapabilityDefinition,
  type CapabilityPolicy,
  type EntitlementRecord,
} from ".";

const requestedAt = "2026-07-29T12:00:00.000Z";
const effectiveAt = "2026-07-01T00:00:00.000Z";
const expiresAt = "2027-07-01T00:00:00.000Z";

function capability(
  overrides: Partial<Omit<CapabilityDefinition, "definition_digest">> = {}
): CapabilityDefinition {
  return createCapabilityDefinition({
    schema_version: "1.0.0",
    capability_id: "CAPABILITY-COMPASS",
    name: "Compass Capability",
    purpose: "Provide governed Compass intelligence.",
    owner: "PLAYBOOK-CAPABILITY-GOVERNANCE",
    owning_engine_id: "PBOS-ENGINE-COMPASS",
    version: "1.0.0",
    classification: "INTELLIGENCE",
    dependencies: [],
    security_requirements: ["SECURITY-TENANT-ISOLATION"],
    evidence_requirements: ["EVIDENCE-CAPABILITY-DEFINITION"],
    lifecycle_state: "AVAILABLE",
    ...overrides,
  });
}

function entitlement(
  definition: CapabilityDefinition,
  overrides: Partial<Omit<EntitlementRecord, "record_digest">> = {}
): EntitlementRecord {
  return createEntitlementRecord({
    schema_version: "1.0.0",
    entitlement_id: "ENTITLEMENT-COMPASS-001",
    capability_id: definition.capability_id,
    capability_definition_digest: definition.definition_digest,
    subject_id: "SCHOLAR-001",
    beneficiary_type: "SCHOLAR",
    organization_id: "ORGANIZATION-001",
    tenant_id: "TENANT-001",
    issuer_id: "PLAYBOOK-ENTITLEMENT-ISSUER",
    grant_authority_id: "PBOS-ENTITLEMENT-AUTHORITY",
    source: "PROGRAM_ENROLLMENT",
    status: "ACTIVE",
    effective_at: effectiveAt,
    expires_at: expiresAt,
    evidence_ids: ["EVIDENCE-ENTITLEMENT-001"],
    policy_ids: ["POLICY-COMPASS-001"],
    ...overrides,
  });
}

function policy(
  definition: CapabilityDefinition,
  overrides: Partial<Omit<CapabilityPolicy, "policy_digest">> = {}
): CapabilityPolicy {
  return createCapabilityPolicy({
    schema_version: "1.0.0",
    policy_id: "POLICY-COMPASS-001",
    capability_id: definition.capability_id,
    capability_definition_digest: definition.definition_digest,
    owner: definition.owner,
    allowed_beneficiary_types: ["SCHOLAR"],
    allowed_sources: ["PROGRAM_ENROLLMENT"],
    required_permission_ids: ["capability:activate"],
    required_evidence_ids: ["EVIDENCE-POLICY-001"],
    status: "ACTIVE",
    effective_at: effectiveAt,
    expires_at: expiresAt,
    ...overrides,
  });
}

function identity(tenantId = "TENANT-001"): IdentityEnvelope {
  return {
    version: "1.0.0",
    actor: {
      id: "SCHOLAR-001",
      kind: "HUMAN",
      issuer: "PLAYBOOK-IDENTITY-AUTHORITY",
      verificationStatus: "VERIFIED",
      ownerId: "SCHOLAR-001",
      organizationId: "ORGANIZATION-001",
      tenantId,
      lifecycleState: "ACTIVE",
      issuedAt: effectiveAt,
      verifiedAt: effectiveAt,
      expiresAt,
    },
    organization: {
      id: "ORGANIZATION-001",
      kind: "ORGANIZATION",
      issuer: "PLAYBOOK-IDENTITY-AUTHORITY",
      verificationStatus: "VERIFIED",
      ownerId: "ORGANIZATION-001",
      organizationId: null,
      tenantId: null,
      lifecycleState: "ACTIVE",
      issuedAt: effectiveAt,
      verifiedAt: effectiveAt,
      expiresAt,
    },
    tenant: {
      id: tenantId,
      kind: "TENANT",
      issuer: "PLAYBOOK-IDENTITY-AUTHORITY",
      verificationStatus: "VERIFIED",
      ownerId: "ORGANIZATION-001",
      organizationId: "ORGANIZATION-001",
      tenantId,
      lifecycleState: "ACTIVE",
      issuedAt: effectiveAt,
      verifiedAt: effectiveAt,
      expiresAt,
    },
    service: null,
    partner: null,
  };
}

function authority(
  definition: CapabilityDefinition,
  tenantId = "TENANT-001"
): AuthorityEnvelope {
  return {
    version: "1.0.0",
    id: "AUTHORITY-CAPABILITY-001",
    actorId: "SCHOLAR-001",
    subjectId: definition.capability_id,
    ownerId: definition.owner,
    delegationIds: [],
    permissionIds: ["capability:activate"],
    approvalIds: ["APPROVAL-CAPABILITY-001"],
    policyDecisionIds: ["POLICY-DECISION-CAPABILITY-001"],
    administrativeAuthorityId: null,
    scope: {
      organizationId: "ORGANIZATION-001",
      tenantId,
      environmentId: "production",
      region: "us",
      resourceIds: [definition.capability_id],
      operations: ["capability.activate"],
    },
    status: "AUTHORIZED",
    issuedAt: effectiveAt,
    expiresAt,
  };
}

function admission(
  definition: CapabilityDefinition
): EngineAdmissionDecision {
  const body = {
    request_id: "ENGINE-ADMISSION-COMPASS",
    engine_id: definition.owning_engine_id,
    manifest_digest: artifactDigest({ engine: definition.owning_engine_id }),
    status: "ADMITTED" as const,
    findings: [],
  };
  return { ...body, decision_digest: artifactDigest(body) };
}

function activationRequest(
  definition: CapabilityDefinition
): CapabilityActivationRequest {
  return {
    request_id: "CAPABILITY-REQUEST-001",
    requested_at: requestedAt,
    subject_id: "SCHOLAR-001",
    capability_id: definition.capability_id,
    identity: identity(),
    authority: authority(definition),
    engine_admission: admission(definition),
    available_evidence_ids: [
      "EVIDENCE-CAPABILITY-DEFINITION",
      "EVIDENCE-ENTITLEMENT-001",
      "EVIDENCE-POLICY-001",
    ],
    available_security_requirement_ids: [
      "SECURITY-TENANT-ISOLATION",
    ],
  };
}

function setup(args: {
  definition?: CapabilityDefinition;
  entitlement?: EntitlementRecord | null;
  policy?: CapabilityPolicy;
} = {}): {
  definition: CapabilityDefinition;
  engine: EntitlementEngine;
  request: CapabilityActivationRequest;
} {
  const definition = args.definition ?? capability();
  const record =
    args.entitlement === undefined
      ? entitlement(definition)
      : args.entitlement;
  const governedPolicy = args.policy ?? policy(definition);
  const capabilities = new CapabilityRegistry([
    "PBOS-CAPABILITY-REGISTRATION-AUTHORITY",
  ]);
  const entitlements = new EntitlementRegistry([
    "PBOS-ENTITLEMENT-AUTHORITY",
  ]);
  const policies = new CapabilityPolicyRegistry();
  expect(
    capabilities.register(
      definition,
      "PBOS-CAPABILITY-REGISTRATION-AUTHORITY"
    ).status
  ).toBe("REGISTERED");
  if (record) expect(entitlements.register(record).status).toBe("REGISTERED");
  expect(policies.register(governedPolicy).status).toBe("REGISTERED");
  return {
    definition,
    engine: new EntitlementEngine(capabilities, entitlements, policies),
    request: activationRequest(definition),
  };
}

describe("PBOS Entitlement Engine", () => {
  it("allows an eligible request deterministically without granting authority", () => {
    const { engine, request } = setup();
    const decision = engine.evaluate(request);

    expect(decision).toEqual(engine.evaluate(request));
    expect(decision).toMatchObject({
      outcome: "ALLOW",
      findings: [],
      entitlement_id: "ENTITLEMENT-COMPASS-001",
      policy_id: "POLICY-COMPASS-001",
    });
    expect(decision).not.toHaveProperty("authorization");
    expect(decision).not.toHaveProperty("execution");
  });

  it("denies a missing entitlement", () => {
    const { engine, request } = setup({ entitlement: null });
    expect(engine.evaluate(request)).toMatchObject({
      outcome: "DENY",
      findings: ["capability entitlement is unavailable."],
    });
  });

  it("returns EXPIRED for an expired entitlement", () => {
    const definition = capability();
    const { engine, request } = setup({
      definition,
      entitlement: entitlement(definition, {
        expires_at: "2026-07-02T00:00:00.000Z",
      }),
    });
    expect(engine.evaluate(request)).toMatchObject({
      outcome: "EXPIRED",
      findings: ["capability entitlement is expired."],
    });
  });

  it("denies cross-tenant entitlement use", () => {
    const { definition, engine, request } = setup();
    const result = engine.evaluate({
      ...request,
      identity: identity("TENANT-002"),
      authority: authority(definition, "TENANT-002"),
    });
    expect(result.outcome).toBe("DENY");
    expect(result.findings).toContain(
      "entitlement organization or tenant scope does not match."
    );
  });

  it("denies invalid authority", () => {
    const { engine, request } = setup();
    const result = engine.evaluate({
      ...request,
      authority: { ...request.authority, status: "DENIED" },
      available_evidence_ids: [],
    });
    expect(result.outcome).toBe("DENY");
    expect(result.findings).toContain(
      "authority status must be AUTHORIZED."
    );
  });

  it("suspends access when the capability is suspended", () => {
    const definition = capability({ lifecycle_state: "SUSPENDED" });
    const { engine, request } = setup({ definition });
    expect(engine.evaluate(request)).toMatchObject({
      outcome: "SUSPEND",
      findings: ["capability is not available."],
    });
  });

  it("denies access under an invalid policy", () => {
    const definition = capability();
    const { engine, request } = setup({
      definition,
      policy: policy(definition, { status: "SUSPENDED" }),
    });
    const result = engine.evaluate(request);
    expect(result.outcome).toBe("DENY");
    expect(result.findings).toContain("capability policy is not active.");
  });

  it("requires review when required evidence is unavailable", () => {
    const { engine, request } = setup();
    const result = engine.evaluate({
      ...request,
      available_evidence_ids: [],
    });
    expect(result.outcome).toBe("REQUIRES_REVIEW");
    expect(result.findings).toContain(
      "capability evidence unavailable: EVIDENCE-CAPABILITY-DEFINITION."
    );
  });

  it("denies a forged engine admission or missing security control", () => {
    const { engine, request } = setup();
    const result = engine.evaluate({
      ...request,
      engine_admission: {
        ...request.engine_admission,
        engine_id: "PBOS-ENGINE-UNAUTHORIZED",
      },
      available_security_requirement_ids: [],
    });
    expect(result.outcome).toBe("DENY");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        "engine admission decision digest does not match content.",
        "owning engine is not admitted.",
        "capability security requirement unavailable: SECURITY-TENANT-ISOLATION.",
      ])
    );
  });

  it("rejects unauthorized and self-granted registry records", () => {
    const definition = capability({ lifecycle_state: "REGISTERED" });
    const capabilities = new CapabilityRegistry([]);
    expect(capabilities.register(definition, definition.owning_engine_id)).toEqual({
      status: "REJECTED",
      findings: expect.arrayContaining([
        "capability registration authority is not recognized.",
        "capability or owning engine cannot register itself.",
      ]),
    });

    const selfGranted = entitlement(definition, {
      grant_authority_id: "SCHOLAR-001",
    });
    const entitlements = new EntitlementRegistry(["SCHOLAR-001"]);
    expect(entitlements.register(selfGranted)).toEqual({
      status: "REJECTED",
      findings: expect.arrayContaining([
        "entitlement cannot be self-granted.",
      ]),
    });
  });

  it("records immutable decision evidence without changing the decision", () => {
    const { engine, request } = setup();
    const decision = engine.evaluate(request);
    const recorder = new CapabilityDecisionEvidenceRecorder();
    const before = JSON.stringify(decision);
    const evidence = recorder.record({
      evidence_id: "EVIDENCE-DECISION-001",
      decision,
      organization_id: "ORGANIZATION-001",
      tenant_id: "TENANT-001",
    });

    expect(evidence.decision_digest).toBe(decision.decision_digest);
    expect(recorder.history()).toEqual([evidence]);
    expect(JSON.stringify(decision)).toBe(before);
    expect(() =>
      recorder.record({
        evidence_id: "EVIDENCE-DECISION-001",
        decision,
        organization_id: "ORGANIZATION-001",
        tenant_id: "TENANT-001",
      })
    ).toThrow("Capability decision evidence identity already exists.");
  });
});
