import path from "node:path";
import { Runtime, Artifacts } from "../../kernel";
import type { ExecutionContract } from "../contracts";
import { buildExecutionAuthorization } from "./builder";

export function generateExecutionAuthorization(
  contract: ExecutionContract
) {

  const authorization =
    buildExecutionAuthorization(contract);

  Runtime.save(
    path.join(
      process.cwd(),
      Artifacts.executionAuthorization
    ),
    authorization
  );

  return authorization;
}
