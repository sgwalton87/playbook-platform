import { readFileSync } from "node:fs";

export function loadExecutionModel() {
  return JSON.parse(
    readFileSync(
      "pbos/runtime/execution.json",
      "utf8"
    )
  );
}
