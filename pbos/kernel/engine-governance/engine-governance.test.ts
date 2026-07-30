import { describe, expect, it } from "vitest";
import {
  createEngineManifest,
  type EngineManifest,
} from "../admission";
import {
  buildEngineDependencyGraph,
  evaluateEngineHealth,
  evaluateEngineRetirement,
  validateEngineLifecycleTransition,
} from ".";

const observedAt = "2026-07-29T12:00:00.000Z";

function manifest(
  engineId: string,
  dependencies: readonly string[] = [],
  overrides: Partial<Omit<EngineManifest, "manifest_digest">> = {}
): EngineManifest {
  return createEngineManifest({
    manifest_version: "1.0.0",
    engine_id: engineId,
    name: `${engineId} governed engine`,
    purpose: "Provide governed domain computation.",
    owner: "PBOS-PLATFORM-GOVERNANCE",
    version: "1.0.0",
    classification: "GOVERNANCE",
    lifecycle_state: "REGISTERED",
    capabilities: [
      {
        capability_id: `${engineId}.evaluate`,
        description: "Evaluate governed domain inputs.",
        operations: [`${engineId}.evaluate`],
      },
    ],
    authority_scope: [`${engineId}.domain`],
    required_permissions: [`${engineId}:read`],
    input_contracts: [`contract.${engineId}.input.v1`],
    output_contracts: [`contract.${engineId}.output.v1`],
    lifecycle_requirements: {
      lifecycle_id: "engine-lifecycle.v1",
      compatible_states: ["ACTIVE"],
    },
    evidence_requirements: ["evidence.engine-execution.v1"],
    security_requirements: ["security.engine-boundary.v1"],
    certification_requirements: [`CERT-${engineId}`],
    operational_requirements: [
      "operations.health.v1",
      "operations.evidence.v1",
    ],
    dependencies,
    ...overrides,
  });
}

describe("PBOS engine lifecycle governance", () => {
  it("approves only adjacent, authorized, evidenced transitions", () => {
    const transition = {
      transition_id: "TRANSITION-001",
      engine_id: "PBOS-ENGINE-001",
      from: "PROPOSED" as const,
      to: "DESIGNED" as const,
      authority_id: "PBOS-LIFECYCLE-AUTHORITY",
      evidence_ids: ["EVIDENCE-001"],
      validation_ids: ["VALIDATION-001"],
      audit_record_id: "AUDIT-001",
      expected_revision: 0,
      requested_at: observedAt,
    };

    expect(validateEngineLifecycleTransition(transition)).toMatchObject({
      status: "APPROVED",
      findings: [],
    });
    expect(validateEngineLifecycleTransition(transition)).toEqual(
      validateEngineLifecycleTransition(transition)
    );
  });

  it("rejects skipped transitions and engine-owned authority", () => {
    const result = validateEngineLifecycleTransition({
      transition_id: "TRANSITION-002",
      engine_id: "PBOS-ENGINE-001",
      from: "PROPOSED",
      to: "ACTIVE",
      authority_id: "PBOS-ENGINE-001",
      evidence_ids: [],
      validation_ids: [],
      audit_record_id: "AUDIT-002",
      expected_revision: 0,
      requested_at: observedAt,
    });

    expect(result.status).toBe("REJECTED");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        "engine cannot own lifecycle transition authority.",
        "engine lifecycle transition requires evidence.",
        "engine lifecycle transition requires validation.",
        "engine lifecycle transition PROPOSED -> ACTIVE is prohibited.",
      ])
    );
  });
});

describe("PBOS engine dependency governance", () => {
  it("creates deterministic execution order for a complete graph", () => {
    const manifests = [
      manifest("PBOS-ENGINE-003", ["PBOS-ENGINE-002"]),
      manifest("PBOS-ENGINE-001"),
      manifest("PBOS-ENGINE-002", ["PBOS-ENGINE-001"]),
    ];

    expect(buildEngineDependencyGraph(manifests)).toMatchObject({
      valid: true,
      execution_order: [
        "PBOS-ENGINE-001",
        "PBOS-ENGINE-002",
        "PBOS-ENGINE-003",
      ],
      blocked_engine_ids: [],
      findings: [],
    });
    expect(buildEngineDependencyGraph(manifests)).toEqual(
      buildEngineDependencyGraph([...manifests].reverse())
    );

    expect(
      buildEngineDependencyGraph([
        manifest("PBOS-ENGINE-001", ["PBOS-ENGINE-002"]),
        manifest("PBOS-ENGINE-002"),
      ]).execution_order
    ).toEqual(["PBOS-ENGINE-002", "PBOS-ENGINE-001"]);
  });

  it("fails closed for missing and circular dependencies", () => {
    const missing = buildEngineDependencyGraph([
      manifest("PBOS-ENGINE-001", ["PBOS-ENGINE-999"]),
    ]);
    expect(missing.valid).toBe(false);
    expect(missing.findings[0]).toMatchObject({
      code: "MISSING_DEPENDENCY",
      engine_id: "PBOS-ENGINE-001",
      dependency_id: "PBOS-ENGINE-999",
    });

    const circular = buildEngineDependencyGraph([
      manifest("PBOS-ENGINE-001", ["PBOS-ENGINE-002"]),
      manifest("PBOS-ENGINE-002", ["PBOS-ENGINE-001"]),
    ]);
    expect(circular.valid).toBe(false);
    expect(circular.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "CIRCULAR_DEPENDENCY",
          engine_id: "PBOS-ENGINE-001",
        }),
        expect.objectContaining({
          code: "CIRCULAR_DEPENDENCY",
          engine_id: "PBOS-ENGINE-002",
        }),
      ])
    );
  });
});

describe("PBOS engine operational governance", () => {
  it("accepts identity-bound health evidence satisfying every requirement", () => {
    const value = manifest("PBOS-ENGINE-001");
    const result = evaluateEngineHealth(value, {
      engine_id: value.engine_id,
      manifest_digest: value.manifest_digest,
      version: value.version,
      observed_at: observedAt,
      health: "HEALTHY",
      availability_percent: 99.99,
      latency_ms: 25,
      error_count: 0,
      evidence_ids: ["EVIDENCE-HEALTH-001"],
      satisfied_requirement_ids: [...value.operational_requirements],
      governance_compliant: true,
    });

    expect(result).toMatchObject({ status: "HEALTHY", findings: [] });
  });

  it("rejects unbound or incomplete health claims", () => {
    const value = manifest("PBOS-ENGINE-001");
    const result = evaluateEngineHealth(value, {
      engine_id: value.engine_id,
      manifest_digest: "0".repeat(64),
      version: value.version,
      observed_at: observedAt,
      health: "DEGRADED",
      availability_percent: 101,
      latency_ms: -1,
      error_count: -1,
      evidence_ids: [],
      satisfied_requirement_ids: [],
      governance_compliant: false,
    });

    expect(result.status).toBe("UNHEALTHY");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        "engine health identity does not match manifest.",
        "engine does not report healthy status.",
        "engine health requires evidence.",
        "engine governance compliance is not proven.",
        "engine operational requirement unavailable: operations.health.v1.",
      ])
    );
  });
});

describe("PBOS engine retirement governance", () => {
  it("requires a complete retirement and preservation package", () => {
    const value = manifest("PBOS-ENGINE-001", [], {
      lifecycle_state: "DEPRECATED",
    });
    const result = evaluateEngineRetirement({
      request_id: "RETIREMENT-001",
      manifest: value,
      authority_id: "PBOS-LIFECYCLE-AUTHORITY",
      deprecation_notice_id: "NOTICE-001",
      migration_plan_id: "MIGRATION-001",
      dependency_impact_review_id: "DEPENDENCY-REVIEW-001",
      data_impact_review_id: "DATA-REVIEW-001",
      evidence_preservation_id: "EVIDENCE-ARCHIVE-001",
      certification_closure_id: "CERT-CLOSURE-001",
      validation_ids: ["VALIDATION-RETIREMENT-001"],
      requested_at: observedAt,
    });

    expect(result).toMatchObject({ status: "ELIGIBLE", findings: [] });
  });

  it("rejects silent disappearance and engine-owned retirement", () => {
    const value = manifest("PBOS-ENGINE-001");
    const result = evaluateEngineRetirement({
      request_id: "RETIREMENT-002",
      manifest: value,
      authority_id: value.engine_id,
      deprecation_notice_id: "",
      migration_plan_id: "",
      dependency_impact_review_id: "",
      data_impact_review_id: "",
      evidence_preservation_id: "",
      certification_closure_id: "",
      validation_ids: [],
      requested_at: observedAt,
    });

    expect(result.status).toBe("REJECTED");
    expect(result.findings).toEqual(
      expect.arrayContaining([
        "engine cannot own retirement authority.",
        "engine must be DEPRECATED or SUSPENDED before retirement.",
        "engine retirement requires validation.",
      ])
    );
  });
});
