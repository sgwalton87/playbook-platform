import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  createExecutionReport,
  loadPbosState,
  PbosLoadError,
  planNextSprint,
  resolveGates,
  validatePbosState,
  type PbosState,
} from "@/lib/pbos/engine";

const validState: PbosState = {
  repositoryState: { repository: "example", status: "active" },
  repositoryHealth: { repository: "example", health: "degraded", blockers: ["evidence required"] },
  repositoryTopology: { repository: "example", required_files: ["src/index.ts"] },
  engineeringGates: {
    repository: "example",
    gates: [
      gate("GATE-001", "completed"),
      gate("GATE-002", "pending", ["GATE-001"]),
      gate("GATE-003", "pending", ["GATE-002"]),
    ],
  },
  validationBaseline: { repository: "example", validations: ["npm test"] },
};

function gate(id: string, status: "completed" | "current" | "blocked" | "pending", depends_on: string[] = []) {
  return {
    id,
    goal: `Deliver ${id}`,
    status,
    depends_on,
    scope: ["engine only"],
    required_files: ["lib/engine.ts"],
    constraints: ["read only"],
    acceptance_criteria: ["deterministic output"],
    required_validations: ["npm test"],
  };
}

describe("PBOS loader", () => {
  it("loads all canonical YAML documents", async () => {
    const root = await writeFixture();
    await expect(loadPbosState(root)).resolves.toEqual(validState);
  });

  it("reports the canonical file when parsing fails", async () => {
    const root = await writeFixture({ "repository-state.yaml": "repository: [" });
    await expect(loadPbosState(root)).rejects.toMatchObject({
      name: PbosLoadError.name,
      file: "repository-state.yaml",
    });
  });
});

describe("PBOS validator", () => {
  it("accepts consistent state without changing it", () => {
    const before = structuredClone(validState);
    expect(validatePbosState(validState)).toEqual({ valid: true, issues: [] });
    expect(validState).toEqual(before);
  });

  it("reports identity, reference, duplicate, and unknown errors", () => {
    const state = structuredClone(validState);
    state.repositoryHealth.repository = "other";
    state.repositoryState.status = "unknown";
    state.engineeringGates.gates[1].depends_on = ["MISSING"];
    state.engineeringGates.gates[2].id = "GATE-002";
    const messages = validatePbosState(state).issues.map((issue) => issue.message);
    expect(messages).toEqual(expect.arrayContaining([
      expect.stringContaining("exact \"UNKNOWN\""),
      expect.stringContaining("must reference repository example"),
      expect.stringContaining("references missing gate MISSING"),
      expect.stringContaining("duplicate gate identifier GATE-002"),
    ]));
  });
});

describe("PBOS gate resolution and planning", () => {
  it("selects only the first eligible gate in declared order", () => {
    const resolution = resolveGates(validState.engineeringGates);
    expect(resolution.nextEligibleGate?.id).toBe("GATE-002");
    expect(resolution.blockedGates.map((item) => item.id)).toEqual(["GATE-003"]);
    expect(planNextSprint(resolution)).toEqual({
      gate: "GATE-002",
      goal: "Deliver GATE-002",
      scope: ["engine only"],
      requiredFiles: ["lib/engine.ts"],
      constraints: ["read only"],
      acceptanceCriteria: ["deterministic output"],
      requiredValidations: ["npm test"],
    });
  });

  it("returns no sprint when no pending gate is eligible", () => {
    const state = structuredClone(validState);
    state.engineeringGates.gates[1].status = "blocked";
    expect(planNextSprint(resolveGates(state.engineeringGates))).toBeNull();
  });
});

describe("PBOS reporter", () => {
  it("produces a deterministic report and lowers confidence for UNKNOWN evidence", () => {
    const state = structuredClone(validState);
    state.repositoryTopology.owner = "UNKNOWN";
    const validation = validatePbosState(state);
    const resolution = resolveGates(state.engineeringGates);
    const report = createExecutionReport(state, validation, resolution, planNextSprint(resolution));
    expect(report).toMatchObject({
      repositoryStatus: "active",
      currentHealth: "degraded",
      currentBlockers: ["evidence required"],
      confidence: "LOW",
      unknownInformation: ["$.repositoryTopology.owner"],
    });
  });
});

async function writeFixture(overrides: Partial<Record<string, string>> = {}): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "pbos-"));
  const directory = path.join(root, "docs", "PBOS");
  await mkdir(directory, { recursive: true });
  const files: Record<string, unknown> = {
    "repository-state.yaml": validState.repositoryState,
    "repository-health.yaml": validState.repositoryHealth,
    "repository-topology.yaml": validState.repositoryTopology,
    "engineering-gates.yaml": validState.engineeringGates,
    "validation-baseline.yaml": validState.validationBaseline,
  };
  await Promise.all(Object.entries(files).map(([name, value]) =>
    writeFile(path.join(directory, name), overrides[name] ?? JSON.stringify(value), "utf8"),
  ));
  return root;
}
