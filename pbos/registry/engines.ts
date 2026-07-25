import { EngineDefinition } from "./types";

import { runRepositoryAnalysis } from "../commands/repository";
import { runPlanner } from "../commands/planner";
import { runValidator } from "../commands/validator";
import { runExecute } from "../commands/execute";

export const ENGINE_REGISTRY: EngineDefinition[] = [

  {
    id: "repository",
    name: "Repository Intelligence",
    version: "1.0.0",
    order: 1,
    enabled: true,
    dependsOn: [],
    produces: ["repository.json"],
    run: runRepositoryAnalysis,
  },

  {
    id: "planner",
    name: "Planning Engine",
    version: "1.0.0",
    order: 2,
    enabled: true,
    dependsOn: ["repository"],
    produces: ["next-gate.json"],
    run: runPlanner,
  },

  {
    id: "validator",
    name: "Runtime Validator",
    version: "1.0.0",
    order: 3,
    enabled: true,
    dependsOn: ["planner"],
    produces: ["validation.json"],
    run: runValidator,
  },

  {
    id: "execution",
    name: "Execution Engine",
    version: "1.0.0",
    order: 4,
    enabled: true,
    dependsOn: ["validator"],
    produces: ["execution.json"],
    run: runExecute,
  },

];
