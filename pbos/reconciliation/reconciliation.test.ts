import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Artifacts } from "../kernel";
import { runChecks } from "../validator/checks";
import { appendArtifactReconciliationHistory } from "./history";
import { inspectArtifactConsistency } from "./inspect";
import type { ArtifactReconciliationRun } from "./types";

const roots: string[] = [];

function write(root: string, relativePath: string, value: unknown): void {
  const target = path.join(root, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(value), "utf8");
}

function arrange(): string {
  const parent = mkdtempSync(
    path.join(tmpdir(), "pbos-reconciliation-")
  );
  roots.push(parent);
  const root = path.join(parent, "playbook-platform");
  mkdirSync(root);
  write(root, "pbos/state/engine-state.json", {
    currentGate: null,
  });
  write(root, Artifacts.planning, {
    selectedGate: null,
    state: "VALID_IDLE",
    authority: "constitutional-planner",
  });
  write(root, Artifacts.validation, {
    status: "PASS",
    selectedGate: "PBOS-CONTEXT-001",
  });
  write(root, Artifacts.execution, {
    status: "BLOCKED",
    gate: "PBOS-CONTEXT-001",
    tasks: [],
  });
  write(root, Artifacts.repositoryContext, {
    version: "1.1.0",
    identity: "previous",
  });
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("PBOS artifact reconciliation", () => {
  it("classifies superseded validation and execution artifacts", () => {
    const artifacts = inspectArtifactConsistency(arrange());
    const classifications = Object.fromEntries(
      artifacts.map(({ path: artifactPath, classification }) => [
        artifactPath,
        classification,
      ])
    );

    expect(classifications[Artifacts.planning]).toBe("valid");
    expect(classifications[Artifacts.validation]).toBe("superseded");
    expect(classifications[Artifacts.execution]).toBe("superseded");
    expect(
      classifications["pbos/state/engine-state.json"]
    ).toBe("valid");
  });

  it("recognizes canonical valid-idle validation without authorizing execution", () => {
    const checks = runChecks({
      repository: {},
      planning: {
        selectedGate: null,
        state: "VALID_IDLE",
        authority: "constitutional-planner",
      } as never,
    });

    expect(checks.every(({ status }) => status === "PASS")).toBe(true);
    expect(checks.find(({ name }) => name === "Selected Gate")?.message)
      .toBe("Valid idle");
  });

  it("preserves prior reconciliation runs and archived artifacts", () => {
    const previousArtifact = {
      status: "PASS",
      selectedGate: "PBOS-CONTEXT-001",
    };
    const run = {
      runId: "run-1",
      evaluatedAt: "2026-07-29T06:00:00.000Z",
      owner: "artifact-reconciliation",
      engineStateOwner: "engine-state-manager",
      artifacts: [
        {
          path: Artifacts.validation,
          owner: "runtime-validator",
          producer: "pbos validator",
          classification: "valid",
          reasons: ["Superseded evidence was archived."],
          previousDigest: "old",
          currentDigest: "new",
          previousArtifact,
          regenerated: true,
        },
      ],
      unresolvedConflicts: [],
      artifactHealth: "VALID",
      refreshRequired: true,
      readyForContextRefresh: true,
    } satisfies ArtifactReconciliationRun;

    const artifact = appendArtifactReconciliationHistory(null, run);
    const second = appendArtifactReconciliationHistory(artifact, {
      ...run,
      runId: "run-2",
    });

    expect(second.history).toHaveLength(2);
    expect(second.history[0].artifacts[0].previousArtifact).toEqual(
      previousArtifact
    );
  });

  it("fails closed when engine state and planning disagree", () => {
    const root = arrange();
    write(root, "pbos/state/engine-state.json", {
      currentGate: "PBOS-OTHER-001",
    });

    const state = inspectArtifactConsistency(root).find(
      ({ path: artifactPath }) =>
        artifactPath === "pbos/state/engine-state.json"
    );

    expect(state?.classification).toBe("stale");
  });
});
