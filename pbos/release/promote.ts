import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

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


  const artifactDirectory = path.join(
    rootDir,
    "pbos/runtime"
  );

  await mkdir(
    artifactDirectory,
    { recursive: true }
  );


  await writeFile(
    path.join(
      artifactDirectory,
      "promotion.json"
    ),
    JSON.stringify(
      result,
      null,
      2
    ) + "\n"
  );


  return result;
}
