import { describe, expect, it } from "vitest";
import { compileContext, ContextCompilationError } from "./compiler";
import type { ConstitutionalSource, ContextCompilationInput } from "./contracts";
import { sha256 } from "./digest";

const content = "canonical constitutional source";
const source: ConstitutionalSource = {
  identifier: "PPS-000",
  title: "Platform Overview",
  version: "1.0.0",
  location: "docs/PPS/00_CONSTITUTION/PPS-000_PLATFORM_OVERVIEW.md",
  status: "Canonical",
  owner: "Playbook Platform",
  dependencies: [],
  content,
  digest: sha256(content),
  validationState: "verified",
  rules: [{ id: "PPS-000-RULE-001", effect: "required", subject: "platform", description: "Preserve constitutional authority." }],
};

function validInput(): ContextCompilationInput {
  return {
    sources: [structuredClone(source)],
    governanceDecisions: [],
    registry: {
      version: "1.0.0",
      validationState: "verified",
      documents: [{ identifier: source.identifier, location: source.location, owner: source.owner, version: source.version }],
    },
    compilationTimestamp: "2026-07-26T00:00:00.000Z",
  };
}

function failureCodes(input: ContextCompilationInput): string[] {
  try {
    compileContext(input);
    return [];
  } catch (error) {
    expect(error).toBeInstanceOf(ContextCompilationError);
    return (error as ContextCompilationError).failures.map((item) => item.code);
  }
}

describe("PBOS constitutional context compiler", () => {
  it("compiles a valid constitutional source deterministically", () => {
    const first = compileContext(validInput());
    const second = compileContext(validInput());

    expect(second).toEqual(first);
    expect(first.documentInventory).toHaveLength(1);
    expect(first.validatedRules[0].provenance).toMatchObject({
      sourceIdentifier: "PPS-000",
      compilationTimestamp: "2026-07-26T00:00:00.000Z",
      validationStatus: "verified",
    });
    expect(first.contextDigest).toMatch(/^[a-f0-9]{64}$/);
  });

  it("rejects missing constitutional authority", () => {
    const input = validInput();
    input.sources = [];
    expect(failureCodes(input)).toContain("MISSING_AUTHORITY");
  });

  it("rejects an unresolved dependency", () => {
    const input = validInput();
    input.sources[0].dependencies = ["PPS-999"];
    expect(failureCodes(input)).toContain("UNRESOLVED_DEPENDENCY");
  });

  it("rejects an invalid digest", () => {
    const input = validInput();
    input.sources[0].digest = "0".repeat(64);
    expect(failureCodes(input)).toContain("INVALID_DIGEST");
  });

  it("rejects a pending governance decision", () => {
    const input = validInput();
    input.governanceDecisions = [{
      issueIdentifier: "PBOS-CONST-002-PATH-03",
      decisionType: "correction",
      affectedArtifacts: ["VOLUME-03"],
      approvalStatus: "pending",
      evidence: ["Governance queue"],
      effectiveVersion: "1.0.0",
    }];
    expect(failureCodes(input)).toContain("PENDING_GOVERNANCE");
  });

  it("rejects conflicting registry authority", () => {
    const input = validInput();
    input.registry.documents[0].location = "docs/PPS/conflicting.md";
    expect(failureCodes(input)).toContain("CONFLICTING_AUTHORITY");
  });
});
