import { describe, expect, it } from "vitest";
import { artifactDigest } from "../kernel/identity";
import { MilestoneAdvancementAuthority } from "./authority";
import type { ManifestTransitionRequest } from "./types";

function request(from: ManifestTransitionRequest["from"], to: ManifestTransitionRequest["to"]) {
  const body = {
    request_id: "TRANSITION-001",
    milestone_id: "MILESTONE-001",
    from,
    to,
    manifest_digest: "a".repeat(64),
    context_digest: "b".repeat(64),
    package_digest: "c".repeat(64),
    authorization_id: "AUTH-001",
    execution_id: "EXEC-001",
    validation_evidence: ["VALIDATION-001"],
    completion_evidence: ["COMPLETION-001"],
    requested_by: "operator",
    timestamp: "2026-07-30T00:00:00.000Z",
  };
  return { ...body, digest: artifactDigest(body) };
}

const expected = {
  manifest_digest: "a".repeat(64),
  context_digest: "b".repeat(64),
  package_digest: "c".repeat(64),
  authorization_valid: true,
  execution_succeeded: true,
  validation_passed: true,
};

describe("milestone advancement", () => {
  it("rejects READY to COMPLETE", () => {
    const result = new MilestoneAdvancementAuthority().evaluate(
      request("READY", "COMPLETE"),
      expected,
      "2026-07-30T00:00:01.000Z"
    );
    expect(result.approved).toBe(false);
    expect(result.findings).toContain("Lifecycle transition is invalid.");
  });

  it("approves only the next evidence-bound transition", () => {
    const result = new MilestoneAdvancementAuthority().evaluate(
      request("VALIDATING", "COMPLETE"),
      expected,
      "2026-07-30T00:00:01.000Z"
    );
    expect(result.approved).toBe(true);
    expect(result.transition_digest).toMatch(/^[a-f0-9]{64}$/);
  });
});
