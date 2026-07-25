import { existsSync, readFileSync } from "node:fs";
import { ExecutionContext } from "./types";

export function loadExecutionContext(): ExecutionContext {

  const files = [
    "pbos/runtime/repository.json",
    "pbos/runtime/next-gate.json",
    "pbos/runtime/validation.json",
  ];

  for (const file of files) {
    if (!existsSync(file)) {
      throw new Error(`Missing runtime artifact: ${file}`);
    }
  }

  return {
    repository: JSON.parse(
      readFileSync("pbos/runtime/repository.json", "utf8")
    ),
    planning: JSON.parse(
      readFileSync("pbos/runtime/next-gate.json", "utf8")
    ),
    validation: JSON.parse(
      readFileSync("pbos/runtime/validation.json", "utf8")
    ),
  };
}
