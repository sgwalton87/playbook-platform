import { existsSync, readFileSync } from "node:fs";
import { Artifacts } from "../kernel";
import { ValidationContext } from "./types";

export function loadValidationContext(
  rootDir = process.cwd()
): ValidationContext {

    const repoPath = `${rootDir}/${Artifacts.repository}`;
    const planningPath = `${rootDir}/${Artifacts.planning}`;

    if (!existsSync(repoPath))
        throw new Error("Missing runtime artifact: repository.json");

    if (!existsSync(planningPath))
        throw new Error("Missing runtime artifact: next-gate.json");

    return {
        repository: JSON.parse(readFileSync(repoPath, "utf8")),
        planning: JSON.parse(readFileSync(planningPath, "utf8"))
    };
}
