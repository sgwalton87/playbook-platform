import { readFile } from "node:fs/promises";
import path from "node:path";

interface ReleaseGate {
  id: string;
  status: string;
}

export async function resolveReleaseGateId(options: {
  requestedGateId?: string;
  currentGateId: string | null;
  rootDir?: string;
}): Promise<string> {
  const gateId = options.requestedGateId ?? options.currentGateId;

  if (!gateId) {
    throw new Error(
      "Release validation denied: no requested or active gate."
    );
  }

  const rootDir = options.rootDir ?? process.cwd();
  const gatePath = path.join(
    rootDir,
    "pbos/gates",
    `${gateId}.json`
  );
  const gate = JSON.parse(
    await readFile(gatePath, "utf8")
  ) as ReleaseGate;

  if (gate.id !== gateId || gate.status !== "in_progress") {
    throw new Error(
      `Release validation denied: gate ${gateId} is not in_progress.`
    );
  }

  return gateId;
}
