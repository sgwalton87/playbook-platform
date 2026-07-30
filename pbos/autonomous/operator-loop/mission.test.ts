import { describe, expect, it } from "vitest";
import type { PBOSSystemIntelligence } from "../../orchestration/intelligence";
import { checkMissionAlignment } from "./mission";

function intelligence(findings: readonly string[]): PBOSSystemIntelligence {
  const snapshot = {
    identity: "identity",
    timestamp: "2026-07-30T00:00:00.000Z",
    source_references: ["source"],
    digest: "digest",
    confidence: 0,
    validation_status: "INVALID" as const,
    findings,
  };
  return {
    repository: {
      ...snapshot,
      repository_root: "/repo",
      branch: "main",
      commit: "commit",
      content_digest: "content",
    },
    architecture: {
      ...snapshot,
      validation_status: "VALID",
      findings: [],
      constitution_reference: "constitution",
      objective_count: 1,
      architecture_gaps: [],
      documentation_maturity: "VALIDATED",
    },
    capabilities: {
      ...snapshot,
      completed_capabilities: [],
      incomplete_capabilities: [],
      blocked_dependencies: [],
    },
    engine: {
      ...snapshot,
      engine_version: "3.0.0",
      execution_mode: "planning",
      active_gate: null,
      test_health: "UNKNOWN",
    },
    governance: {
      ...snapshot,
      lifecycle_status: "PROMOTION_COMPLETE",
      certification_status: "REJECTED",
      validation_status_summary: "FAIL",
      governance_conflicts: findings,
    },
    lifecycle: {
      ...snapshot,
      release_state: "PROMOTION_COMPLETE",
      active_gate: null,
      completed_milestones: [],
    },
    documentation: {
      ...snapshot,
      constitutional_source: "constitution",
      maturity: "VALIDATED",
    },
    validation: {
      ...snapshot,
      kernel_certification: "REJECTED",
      repository_context: "INVALID",
      runtime_context: "VALID",
    },
    assessment: {
      assessment_id: "assessment",
      current_maturity: "BLOCKED",
      completed_domains: [],
      incomplete_domains: ["repository"],
      blocked_dependencies: [],
      risks: findings,
      recommended_focus: "context",
      confidence: 0,
      evidence: ["evidence"],
      timestamp: snapshot.timestamp,
      digest: "assessment-digest",
    },
    digest: "intelligence",
  };
}

describe("mission alignment", () => {
  it("does not misclassify stale context as a mission conflict", () => {
    expect(checkMissionAlignment(intelligence(["Context validation failed."])).aligned).toBe(true);
  });

  it("fails closed on constitutional conflict", () => {
    expect(checkMissionAlignment(intelligence(["Constitution authority conflict."])).aligned).toBe(false);
  });
});
