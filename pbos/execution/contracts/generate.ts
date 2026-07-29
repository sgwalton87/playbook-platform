import path from "node:path";
import { Runtime, Artifacts } from "../../kernel";
import type { GateDefinition } from "../../planner/types";
import { buildExecutionContract } from "./builder";

export function generateExecutionContract(
  gate: GateDefinition,
  rootDir = process.cwd()
) {
  const contract = buildExecutionContract(gate);

  Runtime.save(
    path.join(
      rootDir,
      Artifacts.executionContract
    ),
    contract,
    "execution-contract"
  );

  return contract;
}
