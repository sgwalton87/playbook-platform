import { readFileSync } from "node:fs";
import { Artifacts } from "../kernel";

export function loadExecutionModel() {
  return JSON.parse(
    readFileSync(
      Artifacts.execution,
      "utf8"
    )
  );
}
