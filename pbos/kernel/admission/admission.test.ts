import { describe, expect, it } from "vitest";
import { artifactDigest } from "../identity";
import {
  CertifiedEngineManifestRegistry,
  createEngineManifest,
  KernelEngineAdmissionAuthority,
  type EngineAdmissionRequest,
  type EngineManifest,
  type EngineRegistration,
} from ".";

const issuedAt = "2026-07-29T12:00:00.000Z";
const expiresAt = "2027-07-29T12:00:00.000Z";

function manifest(
  overrides: Partial<Omit<EngineManifest, "manifest_digest">> = {}
): EngineManifest {
  return createEngineManifest({
    manifest_version: "1.0.0",
    engine_id: "PBOS-ENGINE-016",
    name: "Decision Intelligence Engine",
    purpose: "Produce governed decision intelligence.",
    owner: "PBOS-PLATFORM-GOVERNANCE",
    version: "1.0.0",
    classification: "INTELLIGENCE",
    lifecycle_state: "REGISTERED",
    capabilities: [
      {
        capability_id: "decision.analyze",
        description: "Analyze governed decision evidence.",
        operations: ["decision.analyze"],
      },
    ],
    authority_scope: ["decision-evidence"],
    required_permissions: ["decision:read"],
    input_contracts: ["contract.decision-evidence.v1"],
    output_contracts: ["contract.decision-analysis.v1"],
    lifecycle_requirements: {
      lifecycle_id: "engine-lifecycle.v1",
      compatible_states: ["ACTIVE"],
    },
    evidence_requirements: ["evidence.engine-execution.v1"],
    security_requirements: ["security.engine-boundary.v1"],
    certification_requirements: ["CERT-ENGINE-016"],
    operational_requirements: ["operations.engine-health.v1"],
    dependencies: ["PBOS-ENGINE-015"],
    ...overrides,
  });
}

function registration(value: EngineManifest): EngineRegistration {
  return {
    registration_id: "ENGINE-REGISTRATION-016",
    engine_id: value.engine_id,
    manifest_digest: value.manifest_digest,
    authority_id: "PBOS-ENGINE-REGISTRATION-AUTHORITY",
    registered_by: "PBOS-PLATFORM-OPERATOR",
    registered_at: issuedAt,
    status: "REGISTERED",
  };
}

function request(value: EngineManifest): EngineAdmissionRequest {
  return {
    request_id: "ENGINE-ADMISSION-016",
    manifest: value,
    registration: registration(value),
    authority: {
      authority_id: "PBOS-EXECUTION-AUTHORITY",
      engine_id: value.engine_id,
      owner: value.owner,
      capability_ids: value.capabilities.map(
        ({ capability_id }) => capability_id
      ),
      permission_ids: [...value.required_permissions],
      scope_ids: [...value.authority_scope],
      status: "AUTHORIZED",
    },
    lifecycle: {
      lifecycle_id: value.lifecycle_requirements.lifecycle_id,
      state: "ACTIVE",
    },
    available_dependency_ids: [...value.dependencies],
    available_evidence_requirement_ids: [...value.evidence_requirements],
    available_security_requirement_ids: [...value.security_requirements],
    available_operational_requirement_ids: [
      ...value.operational_requirements,
    ],
    certifications: [
      {
        version: "1.0.0",
        id: "CERT-ENGINE-016",
        issuerId: "PBOS-CERTIFICATION-AUTHORITY",
        subjectId: value.engine_id,
        subjectDigest: value.manifest_digest,
        evidenceIds: ["EVIDENCE-ENGINE-016"],
        validationIds: ["VALIDATION-ENGINE-016"],
        organizationId: "PBOS",
        tenantId: null,
        conditions: [],
        status: "CERTIFIED",
        issuedAt,
        expiresAt,
        revocationId: null,
        supersedesId: null,
      },
    ],
  };
}

function authority(value: EngineManifest): KernelEngineAdmissionAuthority {
  const registry = new CertifiedEngineManifestRegistry([
    "PBOS-ENGINE-REGISTRATION-AUTHORITY",
  ]);
  expect(registry.register(value, registration(value)).status).toBe(
    "REGISTERED"
  );
  return new KernelEngineAdmissionAuthority(registry);
}

describe("PBOS Kernel engine admission", () => {
  it("admits a valid registered and certified engine deterministically", () => {
    const value = manifest();
    const admission = authority(value);
    const engineRequest = request(value);
    const before = JSON.stringify(engineRequest);

    expect(admission.admit(engineRequest)).toEqual(
      admission.admit(engineRequest)
    );
    expect(admission.admit(engineRequest)).toMatchObject({
      engine_id: value.engine_id,
      manifest_digest: value.manifest_digest,
      status: "ADMITTED",
      findings: [],
    });
    expect(JSON.stringify(engineRequest)).toBe(before);
  });

  it("rejects an invalid manifest and never registers it", () => {
    const value = manifest({
      engine_id: "",
      owner: "",
      evidence_requirements: [],
    });
    const registry = new CertifiedEngineManifestRegistry([
      "PBOS-ENGINE-REGISTRATION-AUTHORITY",
    ]);
    const result = registry.register(value, registration(value));

    expect(result.status).toBe("REJECTED");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        "engine.engine_id is required.",
        "engine.owner is required.",
        "engine.evidence_requirements is required.",
      ])
    );
    expect(registry.get(value.engine_id)).toBeNull();
  });

  it("rejects missing authority", () => {
    const value = manifest();
    const engineRequest = request(value);
    const result = authority(value).admit({
      ...engineRequest,
      authority: {
        ...engineRequest.authority,
        authority_id: "",
        status: "DENIED",
      },
    });

    expect(result.status).toBe("REJECTED");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        "admission.authority.authority_id is required.",
        "engine authority status must be AUTHORIZED.",
      ])
    );
  });

  it("rejects unavailable evidence requirements", () => {
    const value = manifest();
    const engineRequest = request(value);
    const result = authority(value).admit({
      ...engineRequest,
      available_evidence_requirement_ids: [],
    });

    expect(result.status).toBe("REJECTED");
    expect(result.findings).toContain(
      "engine evidence requirement unavailable: evidence.engine-execution.v1."
    );
  });

  it("rejects unavailable security and operational requirements", () => {
    const value = manifest();
    const engineRequest = request(value);
    const result = authority(value).admit({
      ...engineRequest,
      available_security_requirement_ids: [],
      available_operational_requirement_ids: [],
    });

    expect(result.status).toBe("REJECTED");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        "engine security requirement unavailable: security.engine-boundary.v1.",
        "engine operational requirement unavailable: operations.engine-health.v1.",
      ])
    );
  });

  it("rejects incompatible lifecycle state", () => {
    const value = manifest();
    const engineRequest = request(value);
    const result = authority(value).admit({
      ...engineRequest,
      lifecycle: { ...engineRequest.lifecycle, state: "SUSPENDED" },
    });

    expect(result.status).toBe("REJECTED");
    expect(result.findings).toContain("engine lifecycle is incompatible.");
  });

  it("rejects unavailable dependencies and invalid certification", () => {
    const value = manifest();
    const engineRequest = request(value);
    const certification = engineRequest.certifications[0];
    const result = authority(value).admit({
      ...engineRequest,
      available_dependency_ids: [],
      certifications: [
        {
          ...certification,
          status: "REVOKED",
          revocationId: "REVOCATION-ENGINE-016",
        },
      ],
    });

    expect(result.status).toBe("REJECTED");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        "engine dependency unavailable: PBOS-ENGINE-015.",
        "certification status must be CERTIFIED.",
        "certification cannot have a revocation reference.",
      ])
    );
  });

  it("rejects hidden capabilities and engine-owned authority", () => {
    const value = manifest();
    const engineRequest = request(value);
    const result = authority(value).admit({
      ...engineRequest,
      authority: {
        ...engineRequest.authority,
        authority_id: value.engine_id,
        capability_ids: ["decision.analyze", "decision.execute-hidden"],
      },
    });

    expect(result.status).toBe("REJECTED");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        "engine cannot own its execution authority.",
        "engine authority contains hidden capability: decision.execute-hidden.",
      ])
    );
  });

  it("rejects unauthorized registration and protects registered content", () => {
    const value = manifest();
    const unauthorized = new CertifiedEngineManifestRegistry([]);
    expect(
      unauthorized.register(value, registration(value)).findings
    ).toContain("registration authority is not recognized.");

    const registry = new CertifiedEngineManifestRegistry([
      "PBOS-ENGINE-REGISTRATION-AUTHORITY",
    ]);
    expect(registry.register(value, registration(value)).status).toBe(
      "REGISTERED"
    );
    const returned = registry.get(value.engine_id);
    if (!returned) throw new Error("Expected registered engine manifest.");
    const changed = createEngineManifest({
      ...returned,
      name: "Changed Engine",
    });
    expect(registry.register(changed, registration(changed)).findings).toContain(
      "engine identity is already registered with different content."
    );
    expect(registry.get(value.engine_id)?.manifest_digest).toBe(
      value.manifest_digest
    );
  });

  it("binds certification to exact manifest content identity", () => {
    const value = manifest();
    const engineRequest = request(value);
    const certification = engineRequest.certifications[0];
    const result = authority(value).admit({
      ...engineRequest,
      certifications: [
        {
          ...certification,
          subjectDigest: artifactDigest({ different: true }),
        },
      ],
    });

    expect(result.status).toBe("REJECTED");
    expect(result.findings).toContain(
      "engine certification identity does not match manifest: CERT-ENGINE-016."
    );
  });

  it("rejects engine-owned certification authority", () => {
    const value = manifest();
    const engineRequest = request(value);
    const certification = engineRequest.certifications[0];
    const result = authority(value).admit({
      ...engineRequest,
      certifications: [
        { ...certification, issuerId: value.engine_id },
      ],
    });

    expect(result.status).toBe("REJECTED");
    expect(result.findings).toContain(
      "engine cannot own its certification authority."
    );
  });
});
