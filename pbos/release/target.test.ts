import {
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveReleaseGateId } from "./target";

let rootDir: string | undefined;

async function writeGate(
  id: string,
  status: string
): Promise<void> {
  if (!rootDir) {
    throw new Error("Test root is not initialized.");
  }

  await mkdir(path.join(rootDir, "pbos/gates"), {
    recursive: true,
  });
  await writeFile(
    path.join(rootDir, "pbos/gates", `${id}.json`),
    JSON.stringify({ id, status })
  );
}

afterEach(async () => {
  if (rootDir) {
    await rm(rootDir, { recursive: true, force: true });
    rootDir = undefined;
  }
});

describe("PBOS release target", () => {
  it("uses an explicitly requested in-progress gate", async () => {
    rootDir = await mkdtemp(
      path.join(os.tmpdir(), "pbos-release-target-")
    );
    await writeGate("PBOS-ENGINE-005", "in_progress");

    await expect(
      resolveReleaseGateId({
        requestedGateId: "PBOS-ENGINE-005",
        currentGateId: "PBOS-RLS-001",
        rootDir,
      })
    ).resolves.toBe("PBOS-ENGINE-005");
  });

  it("fails closed for a completed gate", async () => {
    rootDir = await mkdtemp(
      path.join(os.tmpdir(), "pbos-release-target-")
    );
    await writeGate("PBOS-ENGINE-005", "complete");

    await expect(
      resolveReleaseGateId({
        currentGateId: "PBOS-ENGINE-005",
        rootDir,
      })
    ).rejects.toThrow("is not in_progress");
  });
});
