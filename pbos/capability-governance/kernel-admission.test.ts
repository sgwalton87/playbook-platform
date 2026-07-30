import {
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  KernelCapabilityAdmissionGate,
  KernelCapabilityEngineAdmissionHandoff,
  createCapabilityAdmissionRequest,
  type CapabilityAdmissionInvocation,
} from "../kernel/capability-admission";
import {
  CertifiedEngineManifestRegistry,
  KernelEngineAdmissionAuthority,
  createEngineManifest,
  type EngineAdmissionRequest,
} from "../kernel/admission";
import type {
  AuthorityEnvelope,
  IdentityEnvelope,
} from "../kernel/contracts";
import { artifactDigest, canonicalJson } from "../kernel/identity";
import {
  issuerTrustDecisionDigest,
  type IssuerTrustDecision,
} from "./issuer-trust";
import {
  DurableCapabilityKernelAdmissionAdapter,
  type CapabilityAdmissionPolicySource,
} from "./kernel-admission-adapter";
import {
  createCapabilityIssuerRecord,
  createCapabilityGovernanceEvidenceRecord,
  createCapabilityLifecycleTransitionRecord,
  createCapabilityRegistryRecord,
  createCapabilityRevocationRecord,
  createDurableCapabilityControlPlane,
  createPersistentEntitlementRecord,
  type DurableCapabilityControlPlane,
  type PersistentCapabilityLifecycleState,
} from "./persistence";

const directories: string[] = [];
const requestedAt = "2026-08-02T00:00:00.000Z";
const validFrom = "2026-07-01T00:00:00.000Z";
const expiresAt = "2027-07-01T00:00:00.000Z";
const kernelAuthority = "PBOS-KERNEL-CAPABILITY-ADMISSION";

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function controlPlane(): DurableCapabilityControlPlane {
  const directory = mkdtempSync(join(tmpdir(), "pbos-kernel-admission-"));
  directories.push(directory);
  return createDurableCapabilityControlPlane(
    join(directory, "capability-control-plane.json"),
    {
      capability_registration: ["AUTHORITY-CAPABILITY"],
      issuer_registration: ["AUTHORITY-ISSUER"],
      revocation: ["AUTHORITY-REVOCATION"],
      activation_decision: [kernelAuthority],
      evidence: ["AUTHORITY-EVIDENCE"],
    }
  );
}

function transition(
  from: PersistentCapabilityLifecycleState,
  to: PersistentCapabilityLifecycleState,
  index: number
) {
  return createCapabilityLifecycleTransitionRecord({
    transition_id: `TRANSITION-${index}`,
    capability_id: "CAPABILITY-SCHOLAR-RECORD",
    previous_state: from,
    new_state: to,
    authorized_actor: "AUTHORITY-CAPABILITY",
    reason: `Move capability to ${to}.`,
    evidence_ids: [`EVIDENCE-TRANSITION-${index}`],
    validation_ids: [`VALIDATION-TRANSITION-${index}`],
    timestamp: `2026-07-0${index + 1}T00:00:00.000Z`,
  });
}

function initializeTruth(
  plane: DurableCapabilityControlPlane,
  entitlementExpiresAt = expiresAt
): number {
  plane.initialize("2026-07-01T00:00:00.000Z");
  plane.registerCapability({
    record: createCapabilityRegistryRecord({
      record_revision: 1,
      capability_id: "CAPABILITY-SCHOLAR-RECORD",
      name: "Scholar Record",
      description: "Provide governed Scholar Record capability access.",
      owning_engine: "PBOS-ENGINE-SCHOLAR-RECORD",
      owner_identity: "PLAYBOOK-SCHOLAR-RECORD-OWNER",
      classification: "FOUNDATION",
      version: "1.0.0",
      dependencies: [],
      security_requirements: ["SECURITY-TENANT-ISOLATION"],
      evidence_requirements: ["EVIDENCE-CAPABILITY-001"],
      lifecycle_state: "PROPOSED",
      approval_authority: "AUTHORITY-CAPABILITY",
      created_at: "2026-07-02T00:00:00.000Z",
      updated_at: "2026-07-02T00:00:00.000Z",
    }),
    authority_id: "AUTHORITY-CAPABILITY",
    event_id: "EVENT-CAPABILITY-REGISTERED",
    expected_revision: 0,
  });
  const steps: readonly [
    PersistentCapabilityLifecycleState,
    PersistentCapabilityLifecycleState,
  ][] = [
    ["PROPOSED", "DESIGNED"],
    ["DESIGNED", "APPROVED"],
    ["APPROVED", "AVAILABLE"],
  ];
  steps.forEach(([from, to], index) => {
    plane.transitionCapability({
      transition: transition(from, to, index + 1),
      expected_revision: index + 1,
    });
  });
  plane.registerIssuer({
    record: createCapabilityIssuerRecord({
      record_revision: 1,
      issuer_id: "ISSUER-SCHOOL-001",
      identity: "WORKLOAD-ISSUER-001",
      organization: "ORGANIZATION-001",
      tenant_id: "TENANT-001",
      authority_scope: ["entitlement.issue"],
      allowed_capabilities: ["CAPABILITY-SCHOLAR-RECORD"],
      verification_status: "VERIFIED",
      lifecycle_state: "ACTIVE",
      issued_credentials: ["CREDENTIAL-ISSUER-001"],
      valid_from: validFrom,
      expires_at: expiresAt,
      created_at: validFrom,
      updated_at: validFrom,
    }),
    registration_authority_id: "AUTHORITY-ISSUER",
    event_id: "EVENT-ISSUER-REGISTERED",
    evidence_ids: ["EVIDENCE-ISSUER-001"],
    expected_revision: 4,
  });
  const entitlement = createPersistentEntitlementRecord({
    record_revision: 1,
    entitlement_id: "ENTITLEMENT-SCHOLAR-001",
    subject_id: "SCHOLAR-001",
    organization_id: "ORGANIZATION-001",
    tenant_id: "TENANT-001",
    capability_id: "CAPABILITY-SCHOLAR-RECORD",
    issuer_id: "ISSUER-SCHOOL-001",
    source_type: "SCHOOL_LICENSE",
    status: "ACTIVE",
    issued_at: "2026-07-06T00:00:00.000Z",
    expires_at: entitlementExpiresAt,
    revoked_at: null,
    policy_reference: "POLICY-SCHOLAR-RECORD-001",
    evidence_reference: "EVIDENCE-ENTITLEMENT-001",
  });
  const trustBody: IssuerTrustDecision = {
    decision_id: "ISSUER-TRUST-ENTITLEMENT-SCHOLAR-001",
    request_id: "ISSUER-TRUST-REQUEST-ENTITLEMENT-SCHOLAR-001",
    issuer_id: entitlement.issuer_id,
    capability_id: entitlement.capability_id,
    organization_id: entitlement.organization_id ?? "",
    tenant_id: entitlement.tenant_id,
    operation: "entitlement.issue",
    outcome: "TRUSTED",
    authority_identity: "PBOS-CAPABILITY-ISSUER-TRUST",
    findings: [],
    identity_evidence_reference: "WORKLOAD-ISSUER-001",
    credential_evidence_reference: "CREDENTIAL-ISSUER-001",
    authority_evidence_reference: "AUTHORITY-ISSUER-TRUST",
    timestamp: entitlement.issued_at,
    digest: "",
  };
  const issuerTrust = {
    ...trustBody,
    digest: issuerTrustDecisionDigest(trustBody),
  };
  const trustPayload = canonicalJson(issuerTrust);
  plane.issueEntitlement({
    record: entitlement,
    issuer_trust: issuerTrust,
    issuer_evidence: createCapabilityGovernanceEvidenceRecord({
      evidence_id: "EVIDENCE-ISSUER-TRUST-ENTITLEMENT-SCHOLAR-001",
      subject_id: issuerTrust.decision_id,
      event_id: issuerTrust.decision_id,
      authority_id: issuerTrust.authority_identity,
      source_evidence_ids: [issuerTrust.digest],
      payload: trustPayload,
      payload_digest: artifactDigest(trustPayload),
      recorded_at: entitlement.issued_at,
    }),
    event_id: "EVENT-ENTITLEMENT-ISSUED",
    expected_revision: 5,
  });
  return 6;
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
      issuedAt: validFrom,
      verifiedAt: validFrom,
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
      issuedAt: validFrom,
      verifiedAt: validFrom,
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
      issuedAt: validFrom,
      verifiedAt: validFrom,
      expiresAt,
    },
    service: null,
    partner: null,
  };
}

function authority(
  capabilityId = "CAPABILITY-SCHOLAR-RECORD",
  tenantId = "TENANT-001"
): AuthorityEnvelope {
  return {
    version: "1.0.0",
    id: "AUTHORITY-CAPABILITY-USE-001",
    actorId: "SCHOLAR-001",
    subjectId: capabilityId,
    ownerId: "PLAYBOOK-SCHOLAR-RECORD-OWNER",
    delegationIds: [],
    permissionIds: ["capability:use"],
    approvalIds: ["APPROVAL-CAPABILITY-USE-001"],
    policyDecisionIds: ["POLICY-DECISION-001"],
    administrativeAuthorityId: null,
    scope: {
      organizationId: "ORGANIZATION-001",
      tenantId,
      environmentId: "production",
      region: "us",
      resourceIds: [capabilityId],
      operations: ["capability.use"],
    },
    status: "AUTHORIZED",
    issuedAt: validFrom,
    expiresAt,
  };
}

function invocation(): CapabilityAdmissionInvocation {
  const request = createCapabilityAdmissionRequest({
    schema_version: "1.0.0",
    request_id: "CAPABILITY-REQUEST-001",
    subject_id: "SCHOLAR-001",
    tenant_id: "TENANT-001",
    organization_id: "ORGANIZATION-001",
    capability_id: "CAPABILITY-SCHOLAR-RECORD",
    engine_id: "PBOS-ENGINE-SCHOLAR-RECORD",
    requested_action: "capability.use",
    entitlement_reference: "ENTITLEMENT-SCHOLAR-001",
    policy_reference: "POLICY-SCHOLAR-RECORD-001",
    authority_reference: "AUTHORITY-CAPABILITY-USE-001",
    requested_at: requestedAt,
  });
  return {
    request,
    identity: identity(),
    authority: authority(),
    available_evidence_ids: [
      "EVIDENCE-CAPABILITY-001",
      "EVIDENCE-ENTITLEMENT-001",
      "EVIDENCE-POLICY-001",
    ],
    satisfied_security_requirement_ids: [
      "SECURITY-TENANT-ISOLATION",
    ],
  };
}

function engineRequest(): {
  registry: CertifiedEngineManifestRegistry;
  request: EngineAdmissionRequest;
} {
  const manifest = createEngineManifest({
    manifest_version: "1.0.0",
    engine_id: "PBOS-ENGINE-SCHOLAR-RECORD",
    name: "Scholar Record Engine",
    purpose: "Provide governed Scholar Record computation.",
    owner: "PLAYBOOK-SCHOLAR-RECORD-OWNER",
    version: "1.0.0",
    classification: "GOVERNANCE",
    lifecycle_state: "REGISTERED",
    capabilities: [
      {
        capability_id: "CAPABILITY-SCHOLAR-RECORD",
        description: "Process governed Scholar Record requests.",
        operations: ["capability.use"],
      },
    ],
    authority_scope: ["CAPABILITY-SCHOLAR-RECORD"],
    required_permissions: ["capability:use"],
    input_contracts: ["contract.scholar-record.input.v1"],
    output_contracts: ["contract.scholar-record.output.v1"],
    lifecycle_requirements: {
      lifecycle_id: "engine-lifecycle.v1",
      compatible_states: ["ACTIVE"],
    },
    evidence_requirements: ["EVIDENCE-ENGINE-EXECUTION"],
    security_requirements: ["SECURITY-TENANT-ISOLATION"],
    certification_requirements: ["CERT-SCHOLAR-RECORD-ENGINE"],
    operational_requirements: ["OPERATIONS-ENGINE-HEALTH"],
    dependencies: [],
  });
  const registration = {
    registration_id: "ENGINE-REGISTRATION-SCHOLAR-RECORD",
    engine_id: manifest.engine_id,
    manifest_digest: manifest.manifest_digest,
    authority_id: "PBOS-ENGINE-REGISTRATION-AUTHORITY",
    registered_by: "PBOS-PLATFORM-OPERATOR",
    registered_at: validFrom,
    status: "REGISTERED" as const,
  };
  const registry = new CertifiedEngineManifestRegistry([
    "PBOS-ENGINE-REGISTRATION-AUTHORITY",
  ]);
  expect(registry.register(manifest, registration).status).toBe("REGISTERED");
  const certificationBody = {
    version: "1.0.0" as const,
    id: "CERT-SCHOLAR-RECORD-ENGINE",
    issuerId: "PBOS-CERTIFICATION-AUTHORITY",
    subjectId: manifest.engine_id,
    subjectDigest: manifest.manifest_digest,
    evidenceIds: ["EVIDENCE-ENGINE-CERTIFICATION"],
    validationIds: ["VALIDATION-ENGINE-CERTIFICATION"],
    organizationId: "ORGANIZATION-001",
    tenantId: null,
    conditions: [],
    status: "CERTIFIED" as const,
    issuedAt: validFrom,
    expiresAt,
    revocationId: null,
    supersedesId: null,
  };
  return {
    registry,
    request: {
      request_id: "ENGINE-ADMISSION-SCHOLAR-RECORD",
      manifest,
      registration,
      authority: {
        authority_id: "PBOS-EXECUTION-AUTHORITY",
        engine_id: manifest.engine_id,
        owner: manifest.owner,
        capability_ids: ["CAPABILITY-SCHOLAR-RECORD"],
        permission_ids: ["capability:use"],
        scope_ids: ["CAPABILITY-SCHOLAR-RECORD"],
        status: "AUTHORIZED",
      },
      lifecycle: {
        lifecycle_id: "engine-lifecycle.v1",
        state: "ACTIVE",
      },
      available_dependency_ids: [],
      available_evidence_requirement_ids: ["EVIDENCE-ENGINE-EXECUTION"],
      available_security_requirement_ids: ["SECURITY-TENANT-ISOLATION"],
      available_operational_requirement_ids: ["OPERATIONS-ENGINE-HEALTH"],
      certifications: [certificationBody],
    },
  };
}

class StaticPolicySource implements CapabilityAdmissionPolicySource {
  constructor(
    private readonly outcome:
      | "ALLOW"
      | "DENY"
      | "REQUIRES_REVIEW" = "ALLOW",
    private readonly onResolve: (() => void) | null = null
  ) {}

  resolve() {
    this.onResolve?.();
    return {
      id: "POLICY-SCHOLAR-RECORD-001",
      outcome: this.outcome,
      evidence_ids: ["EVIDENCE-POLICY-001"],
    };
  }
}

function gate(
  plane: DurableCapabilityControlPlane,
  policySource: CapabilityAdmissionPolicySource = new StaticPolicySource()
): KernelCapabilityAdmissionGate {
  const adapter = new DurableCapabilityKernelAdmissionAdapter(
    plane,
    policySource
  );
  return new KernelCapabilityAdmissionGate(
    adapter,
    adapter
  );
}

describe("PBOS Kernel capability admission integration", () => {
  it("admits a valid capability and persists immutable Kernel evidence", () => {
    const plane = controlPlane();
    initializeTruth(plane);
    const result = gate(plane).admit(invocation());

    expect(result.decision).toMatchObject({
      decision: "ADMITTED",
      kernel_authority: kernelAuthority,
      reason: [],
    });
    expect(result.receipt).toMatchObject({
      evidence_id: result.evidence.evidence_id,
      evidence_digest: result.evidence.digest,
      persisted_revision: 7,
    });
    expect(plane.state().activation_decisions).toHaveLength(1);
    expect(plane.state().evidence).toHaveLength(2);
    expect(result).not.toHaveProperty("execution");
  });

  it("hands an admitted capability to the sole engine admission authority", () => {
    const plane = controlPlane();
    initializeTruth(plane);
    const adapter = new DurableCapabilityKernelAdmissionAdapter(
      plane,
      new StaticPolicySource()
    );
    const capabilityGate = new KernelCapabilityAdmissionGate(
      adapter,
      adapter
    );
    const engine = engineRequest();
    const handoff = new KernelCapabilityEngineAdmissionHandoff(
      capabilityGate,
      new KernelEngineAdmissionAuthority(engine.registry)
    );
    const result = handoff.admit(invocation(), engine.request);

    expect(result.capability_admission.decision.decision).toBe("ADMITTED");
    expect(result.engine_admission?.status).toBe("ADMITTED");
    expect(result.execution_eligible).toBe(true);
    expect(result).not.toHaveProperty("execution");
    expect(result).not.toHaveProperty("activation");
  });

  it("denies missing entitlement and unknown capability with evidence", () => {
    const missing = controlPlane();
    initializeTruth(missing);
    const missingInvocation = invocation();
    const missingResult = gate(missing).admit({
      ...missingInvocation,
      request: createCapabilityAdmissionRequest({
        ...missingInvocation.request,
        entitlement_reference: "ENTITLEMENT-UNKNOWN",
      }),
    });
    expect(missingResult.decision.decision).toBe("DENIED");
    expect(missingResult.decision.reason).toContain(
      "entitlement is unavailable."
    );
    expect(missing.state().activation_decisions).toHaveLength(1);

    const unknown = controlPlane();
    initializeTruth(unknown);
    const unknownInvocation = invocation();
    const unknownCapability = "CAPABILITY-UNKNOWN";
    const unknownResult = gate(unknown).admit({
      ...unknownInvocation,
      request: createCapabilityAdmissionRequest({
        ...unknownInvocation.request,
        capability_id: unknownCapability,
      }),
      authority: authority(unknownCapability),
    });
    expect(unknownResult.decision.decision).toBe("DENIED");
    expect(unknownResult.decision.reason).toContain("capability is unknown.");
  });

  it("denies expired and revoked entitlements", () => {
    const expired = controlPlane();
    initializeTruth(expired, "2026-08-01T00:00:00.000Z");
    const expiredResult = gate(expired).admit(invocation());
    expect(expiredResult.decision.decision).toBe("DENIED");
    expect(expiredResult.decision.reason).toContain(
      "entitlement is expired, suspended, or revoked."
    );

    const revoked = controlPlane();
    const revision = initializeTruth(revoked);
    revoked.revoke({
      record: createCapabilityRevocationRecord({
        revocation_id: "REVOCATION-ENTITLEMENT-001",
        target_type: "ENTITLEMENT",
        target_id: "ENTITLEMENT-SCHOLAR-001",
        authority_id: "AUTHORITY-REVOCATION",
        reason: "Revoke entitlement access.",
        evidence_ids: ["EVIDENCE-REVOCATION-001"],
        revoked_at: "2026-08-01T00:00:00.000Z",
      }),
      validation_ids: ["VALIDATION-REVOCATION-001"],
      expected_revision: revision,
    });
    const revokedResult = gate(revoked).admit(invocation());
    expect(revokedResult.decision.decision).toBe("DENIED");
    expect(revokedResult.decision.reason).toContain(
      "capability trust chain contains an active revocation."
    );
  });

  it("returns SUSPENDED for a suspended capability", () => {
    const plane = controlPlane();
    const revision = initializeTruth(plane);
    plane.revoke({
      record: createCapabilityRevocationRecord({
        revocation_id: "REVOCATION-CAPABILITY-001",
        target_type: "CAPABILITY",
        target_id: "CAPABILITY-SCHOLAR-RECORD",
        authority_id: "AUTHORITY-REVOCATION",
        reason: "Suspend capability after security review.",
        evidence_ids: ["EVIDENCE-SUSPENSION-001"],
        revoked_at: "2026-08-01T00:00:00.000Z",
      }),
      validation_ids: ["VALIDATION-SUSPENSION-001"],
      expected_revision: revision,
    });
    const result = gate(plane).admit(invocation());
    expect(result.decision.decision).toBe("SUSPENDED");
    expect(result.decision.decision).not.toBe("ADMITTED");
  });

  it("denies cross-tenant requests and unknown subjects", () => {
    const crossTenant = controlPlane();
    initializeTruth(crossTenant);
    const crossTenantInvocation = invocation();
    const tenantResult = gate(crossTenant).admit({
      ...crossTenantInvocation,
      request: createCapabilityAdmissionRequest({
        ...crossTenantInvocation.request,
        tenant_id: "TENANT-002",
      }),
      identity: identity("TENANT-002"),
      authority: authority("CAPABILITY-SCHOLAR-RECORD", "TENANT-002"),
    });
    expect(tenantResult.decision.decision).toBe("DENIED");
    expect(tenantResult.decision.reason).toContain(
      "entitlement organization or tenant does not match request."
    );

    const unknownSubject = controlPlane();
    initializeTruth(unknownSubject);
    const subjectInvocation = invocation();
    const subjectResult = gate(unknownSubject).admit({
      ...subjectInvocation,
      request: createCapabilityAdmissionRequest({
        ...subjectInvocation.request,
        subject_id: "SCHOLAR-UNKNOWN",
      }),
    });
    expect(subjectResult.decision.decision).toBe("DENIED");
    expect(subjectResult.decision.reason).toContain(
      "subject identity or scope does not match request."
    );
  });

  it("denies invalid engine mapping and missing evidence or security", () => {
    const invalidEngine = controlPlane();
    initializeTruth(invalidEngine);
    const engineInvocation = invocation();
    const wrongEngine = "PBOS-ENGINE-UNAUTHORIZED";
    const engineResult = gate(invalidEngine).admit({
      ...engineInvocation,
      request: createCapabilityAdmissionRequest({
        ...engineInvocation.request,
        engine_id: wrongEngine,
      }),
    });
    expect(engineResult.decision.decision).toBe("DENIED");
    expect(engineResult.decision.reason).toContain(
      "capability owning engine does not match request."
    );

    const missingEvidence = controlPlane();
    initializeTruth(missingEvidence);
    const evidenceInvocation = invocation();
    const evidenceResult = gate(missingEvidence).admit({
      ...evidenceInvocation,
      available_evidence_ids: [],
      satisfied_security_requirement_ids: [],
    });
    expect(evidenceResult.decision.decision).toBe("DENIED");
    expect(evidenceResult.decision.reason).toEqual(
      expect.arrayContaining([
        "capability evidence is unavailable: EVIDENCE-CAPABILITY-001.",
        "entitlement evidence is unavailable.",
        "capability security requirement is unavailable: SECURITY-TENANT-ISOLATION.",
      ])
    );
  });

  it("fails admission when truth changes before evidence persistence", () => {
    const plane = controlPlane();
    const revision = initializeTruth(plane);
    const policy = new StaticPolicySource("ALLOW", () => {
      plane.revoke({
        record: createCapabilityRevocationRecord({
          revocation_id: "REVOCATION-RACE-001",
          target_type: "ENTITLEMENT",
          target_id: "ENTITLEMENT-SCHOLAR-001",
          authority_id: "AUTHORITY-REVOCATION",
          reason: "Concurrent revocation wins admission race.",
          evidence_ids: ["EVIDENCE-REVOCATION-RACE"],
          revoked_at: "2026-08-01T00:00:00.000Z",
        }),
        validation_ids: ["VALIDATION-REVOCATION-RACE"],
        expected_revision: revision,
      });
    });

    expect(() => gate(plane, policy).admit(invocation())).toThrow(
      "revision conflict"
    );
    expect(plane.state().activation_decisions).toHaveLength(0);
    expect(plane.state().revocations).toHaveLength(1);
  });
});
