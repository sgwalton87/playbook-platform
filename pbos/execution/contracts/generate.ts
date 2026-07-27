import path from "node:path";
import { Runtime, Artifacts } from "../../kernel";
import type { GateDefinition } from "../../planner/types";
import { buildExecutionContract } from "./builder";

export function generateExecutionContract(
  gate: GateDefinition
) {
  const contract = buildExecutionContract(gate);

  Runtime.save(
    path.join(
      process.cwd(),
      Artifacts.executionContract
    ),
    contract
  );

  return contract;
}