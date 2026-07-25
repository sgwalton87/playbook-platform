import { existsSync, readFileSync } from "node:fs";
import { ValidationContext } from "./types";

export function loadValidationContext(): ValidationContext {

    const repoPath = "pbos/runtime/repository.json";
    const planningPath = "pbos/runtime/next-gate.json";

    if (!existsSync(repoPath))
        throw new Error("Missing runtime artifact: repository.json");

    if (!existsSync(planningPath))
        throw new Error("Missing runtime artifact: next-gate.json");

    return {
        repository: JSON.parse(readFileSync(repoPath, "utf8")),
        planning: JSON.parse(readFileSync(planningPath, "utf8"))
    };
}
