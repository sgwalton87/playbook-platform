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
import { promoteGate } from "./promote";

let rootDir: string | undefined;

async function arrange(status: string): Promise<string> {
  const root = await mkdtemp(
    path.join(os.tmpdir(), "pbos-promote-")
  );
  rootDir = root;
  await mkdir(path.join(root, "pbos/gates"), {
    recursive: true,
  });
  await mkdir(path.join(root, "docs/release-evidence"), {
    recursive: true,
  });
  await writeFile(
    path.join(root, "pbos/gates/PBOS-ENGINE-005.json"),
    JSON.stringify({
      id: "PBOS-ENGINE-005",
      status,
    })
  );
  await writeFile(
    path.join(root, "docs/release-evidence/release-contract.json"),
    JSON.stringify({
      gateId: "PBOS-ENGINE-005",
      overallStatus: "PASS",
      promotionReady: true,
    })
  );
  return root;
}

afterEach(async () => {
  if (rootDir) {
    await rm(rootDir, { recursive: true, force: true });
    rootDir = undefined;
  }
});

describe("PBOS gate promotion", () => {
  it("promotes an in-progress gate with passing evidence", async () => {
    const root = await arrange("in_progress");

    const result = await promoteGate(root);

    expect(result.promoted).toBe(true);
    const artifact = JSON.parse(
      await readFile(
        path.join(root, "pbos/runtime/promotion.json"),
        "utf8"
      )
    ) as { gateId: string };
    expect(artifact.gateId).toBe("PBOS-ENGINE-005");
  });

  it("does not promote a gate outside implementation", async () => {
    const root = await arrange("complete");

    const result = await promoteGate(root);

    expect(result.promoted).toBe(false);
    expect(result.reason).toContain("not in_progress");
  });
});
