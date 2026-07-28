import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { artifactDigest } from "../kernel";
import { validateRequiredArtifact } from "./artifact-validation";
import type { GateDefinition } from "./types";

let rootDir: string | undefined;

const gate: GateDefinition = {
  id: "PBOS-NEXT-001",
  title: "Next",
  description: "Next constitutional gate.",
  status: "in_progress",
  priority: 100,
  lifecycle_stage: 1,
  dependencies: ["PBOS-DONE-001"],
  produces: [],
  requires: [],
  blocking_conditions: [],
  completion_state: "pending",
  handbook_refs: [],
  tasks: [],
  definition_of_done: [],
  validation: ["test"],
  next_gate: null,
};

function write(relativePath: string, value: unknown): void {
  rootDir ??= mkdtempSync(join(tmpdir(), "pbos-artifact-"));
  const target = join(rootDir, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(
    target,
    typeof value === "string" ? value : JSON.stringify(value)
  );
}

function validate(relativePath: string, now?: Date) {
  return validateRequiredArtifact({
    rootDir: rootDir ?? "/missing",
    relativePath,
    gate,
    completedGateIds: new Set(["PBOS-DONE-001"]),
    now,
  });
}

afterEach(() => {
  if (rootDir) rmSync(rootDir, { recursive: true, force: true });
  rootDir = undefined;
});

describe("planner required artifact validation", () => {
  it("rejects missing and malformed artifacts", () => {
    expect(validate("missing.json").valid).toBe(false);
    write("broken.json", "{");
    expect(validate("broken.json").errors).toContain(
      "Artifact JSON schema is invalid."
    );
  });

  it("rejects a conflicting gate identity", () => {
    write("artifact.json", { gateId: "PBOS-OTHER-001" });

    expect(validate("artifact.json").errors).toContain(
      "Artifact gate identity PBOS-OTHER-001 is not valid for PBOS-NEXT-001."
    );
  });

  it("accepts a completed dependency artifact identity", () => {
    write("artifact.json", { gateId: "PBOS-DONE-001" });

    expect(validate("artifact.json").valid).toBe(true);
  });

  it("rejects stale and digest-mismatched artifacts", () => {
    write("artifact.json", {
      gateId: "PBOS-NEXT-001",
      generatedAt: "2026-07-20T00:00:00.000Z",
      digest: "invalid",
    });

    const result = validate(
      "artifact.json",
      new Date("2026-07-28T00:00:00.000Z")
    );
    expect(result.errors).toContain(
      "Artifact freshness validation failed."
    );
    expect(result.errors).toContain(
      "Artifact declared digest does not match its content."
    );
  });

  it("validates snapshot identity when declared", () => {
    const snapshot = { gateId: "PBOS-NEXT-001" };
    write("artifact.json", {
      snapshot,
      identity: artifactDigest(snapshot),
    });
    expect(validate("artifact.json").valid).toBe(true);

    write("artifact.json", { snapshot, identity: "invalid" });
    expect(validate("artifact.json").errors).toContain(
      "Artifact identity does not match its snapshot."
    );
  });
});
