import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { completePromotedGate } from "./completion";

let rootDir: string | undefined;

async function writeJson(
  root: string,
  relativePath: string,
  value: unknown
): Promise<void> {
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`);
}

async function arrange(): Promise<string> {
  const root = await mkdtemp(
    path.join(os.tmpdir(), "pbos-completion-")
  );
  rootDir = root;
  const gate = {
    id: "PBOS-ENGINE-005",
    title: "Governed execution",
    description: "Governed execution lifecycle.",
    status: "in_progress",
    priority: 95,
    lifecycle_stage: 70,
    dependencies: [],
    produces: [],
    requires: [],
    blocking_conditions: [],
    completion_state: "pending",
    handbook_refs: [],
    tasks: ["Complete lifecycle"],
    definition_of_done: ["Lifecycle complete"],
    validation: ["pbos:test"],
    next_gate: null,
  };
  const contextGate = {
    ...gate,
    id: "PBOS-CONTEXT-001",
    title: "Context",
    status: "in_progress",
    priority: 100,
    dependencies: ["PBOS-ENGINE-005"],
  };

  await writeJson(root, "pbos/gates/PBOS-ENGINE-005.json", gate);
  await writeJson(root, "pbos/gates/PBOS-CONTEXT-001.json", contextGate);
  await writeJson(root, "pbos/runtime/promotion.json", {
    gateId: "PBOS-ENGINE-005",
    promoted: true,
  });
  await writeJson(
    root,
    "docs/release-evidence/release-contract.json",
    {
      gateId: "PBOS-ENGINE-005",
      overallStatus: "PASS",
      promotionReady: true,
    }
  );
  await writeJson(root, "pbos/config/pbos.config.json", {
    version: "3.0.0",
    defaultMode: "planning",
    supportedModes: ["planning", "release"],
    handbook: {
      implementationTruth: "docs/MASTER_CHECKLIST.md",
      releasePolicy: "docs/RELEASE_PROCESS.md",
      sprintSequencing: "docs/auto_sprint.md",
      historyDirectory: "docs/HISTORY",
      ledgerDirectory: "docs/LEDGER",
      futureDirection: "docs/ROADMAP.md",
    },
    gatesDirectory: "pbos/gates",
    reportsDirectory: "docs/release-evidence",
    stateFile: "pbos/state/engine-state.json",
    defaultCommand: "next",
    promptsManifest: "pbos/prompts/manifest.json",
  });
  await writeJson(root, "pbos/state/engine-state.json", {
    currentGate: "PBOS-ENGINE-005",
    failedGates: [],
    blockedGates: [],
    blockedBy: [],
    lastRun: null,
    handbookVersion: "test",
    validationHash: null,
    configurationHash: null,
    futureCompatibility: [],
    engineVersion: "3.0.0",
    resumeToken: "test",
    executionMode: "planning",
    release: {
      currentState: "PROMOTION_COMPLETE",
      previousState: "PROMOTION_PENDING",
      transitionTimestamp: "2026-07-28T00:00:00.000Z",
      transitionReason: "Test",
      environment: {
        name: "local",
        gitRemoteAvailable: true,
        gitCredentialsAvailable: true,
        repositoryWritable: true,
        pullRequestPossible: true,
        tagCreationPossible: true,
      },
      blockingConditions: [],
    },
  });
  return root;
}

afterEach(async () => {
  if (rootDir) {
    await rm(rootDir, { recursive: true, force: true });
    rootDir = undefined;
  }
});

describe("PBOS gate completion", () => {
  it("records completion in gate metadata and refreshes fail closed", async () => {
    const root = await arrange();

    await completePromotedGate({
      requestedGateId: "PBOS-ENGINE-005",
      rootDir: root,
    });

    const state = JSON.parse(
      await readFile(
        path.join(root, "pbos/state/engine-state.json"),
        "utf8"
      )
    ) as {
      currentGate: string | null;
    };
    const planning = JSON.parse(
      await readFile(
        path.join(root, "pbos/runtime/next-gate.json"),
        "utf8"
      )
    ) as { selectedGate: { id: string } | null };
    const completedGate = JSON.parse(
      await readFile(
        path.join(root, "pbos/gates/PBOS-ENGINE-005.json"),
        "utf8"
      )
    ) as {
      status: string;
      completion_state: string;
    };

    expect(completedGate.status).toBe("complete");
    expect(completedGate.completion_state).toBe("satisfied");
    expect(state.currentGate).toBeNull();
    expect(planning.selectedGate).toBeNull();
  });

  it("rejects stale promotion identity", async () => {
    const root = await arrange();

    await expect(
      completePromotedGate({
        requestedGateId: "PBOS-CONTEXT-001",
        rootDir: root,
      })
    ).rejects.toThrow("identities do not match");
  });
});
