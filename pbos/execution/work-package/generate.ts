import path from "node:path";
import { Runtime, Artifacts } from "../../kernel";
import type { ExecutionContract } from "../contracts";
import { buildCodexWorkPackage } from "./builder";

export const WorkPackageArtifact =
  Artifacts.workPackage;

export function generateCodexWorkPackage(
  contract: ExecutionContract
) {

  const packageData =
    buildCodexWorkPackage(contract);

  Runtime.save(
    path.join(
      process.cwd(),
      WorkPackageArtifact
    ),
    packageData
  );

  return packageData;
}
