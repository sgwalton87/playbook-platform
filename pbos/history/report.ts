import { ExecutionHistory } from "./types";
import { Artifacts, Runtime } from "../kernel";

export function writeExecutionHistory(
  report: ExecutionHistory
) {

  Runtime.save(
    Artifacts.executionHistory,
    report,
    "execution-history"
  );

}
