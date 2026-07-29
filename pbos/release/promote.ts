import { readFile } from "node:fs/promises";
import path from "node:path";
import { Artifacts, Runtime } from "../kernel";

export interface PromotionResult {
  gateId: string;
  promoted: boolean;
  reason: string;
  timestamp: string;
}

interface ReleaseContract {
  gateId: string | null;
  overallStatus: string;
  promotionReady: boolean;
}

export async function promoteGate(
  rootDir = process.cwd()
): Promise<PromotionResult> {

  const contractPath = path.join(
    rootDir,
    "docs/release-evidence/release-contract.json"
  );

  const contractRaw = await readFile(
    contractPath,
    "utf8"
  );

  const contract = JSON.parse(
    contractRaw
  ) as ReleaseContract;


  if (!contract.gateId) {
    throw new Error(
      "Promotion denied: release contract has no gateId."
    );
  }

  const gatePath = path.join(
    rootDir,
    "pbos/gates",
    `${contract.gateId}.json`
  );
  const gate = JSON.parse(
    await readFile(gatePath, "utf8")
  ) as { id: string; status: string };

  if (
    gate.id !== contract.gateId ||
    gate.status !== "in_progress"
  ) {
    return {
      gateId: contract.gateId,
      promoted: false,
      reason:
        "Promotion denied: release contract gate is not in_progress.",
      timestamp: new Date().toISOString(),
    };
  }


  if (
    contract.overallStatus !== "PASS" ||
    contract.promotionReady !== true
  ) {
    return {
      gateId: contract.gateId,
      promoted: false,
      reason:
        "Promotion denied: release contract is not promotion ready.",
      timestamp: new Date().toISOString(),
    };
  }


  const result: PromotionResult = {
    gateId: contract.gateId,
    promoted: true,
    reason:
      "Release contract passed promotion requirements.",
    timestamp: new Date().toISOString(),
  };


  Runtime.save(
    path.join(rootDir, Artifacts.promotion),
    result,
    "release-promotion"
  );


  return result;
}
