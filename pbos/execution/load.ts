import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { ExecutionContext } from "./types";
import { Artifacts } from "../kernel";

export function loadExecutionContext(
  rootDir = process.cwd()
): ExecutionContext {

  const files = [
    Artifacts.repository,
    Artifacts.planning,
    Artifacts.validation,
  ];

  for (const file of files) {
    if (!existsSync(path.join(rootDir, file))) {
      throw new Error(`Missing runtime artifact: ${file}`);
    }
  }

  return {
    repository: JSON.parse(
      readFileSync(path.join(rootDir, Artifacts.repository), "utf8")
    ),
    planning: JSON.parse(
      readFileSync(path.join(rootDir, Artifacts.planning), "utf8")
    ),
    validation: JSON.parse(
      readFileSync(path.join(rootDir, Artifacts.validation), "utf8")
    ),
  };
}
